import pg from "pg";
import dotenv from "dotenv";
import { DatabaseError } from './utils/errors.js';

dotenv.config();

/**
 * Creates and returns a PostgreSQL connection pool.
 * Uses Railway's DATABASE_URL.
 * @returns {pg.Pool} A configured PostgreSQL connection pool
 */
function getPool() {
    return new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 20,                         // Max clients in pool
        idleTimeoutMillis: 30000,        // Close idle clients after 30 sec
        connectionTimeoutMillis: 2000,   // Return error after 2 sec if not connected
        statement_timeout: 10000,        // Cancel queries >10 sec
        query_timeout: 15000             // Timeout for acquiring a client from pool
    });
}

// Create separate pools for reading & writing
const writePool = getPool();  // Standard pool for writes
const readPool = getPool();   // Read-only pool

/**
 * Executes a query using the read pool with enforced read-only transaction.
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query results
 */
async function readQuery(query, params = []) {
    const client = await readPool.connect();
    try {
        await client.query("BEGIN;");
        await client.query("SET TRANSACTION READ ONLY;"); // Forces read-only mode
        const result = await client.query(query, params);
        await client.query("COMMIT;");
        return result.rows;
    } catch (error) {
        await client.query("ROLLBACK;");
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Logs details about an executed query to the query_logs table.
 * Uses the writePool to ensure it logs even if readPool fails.
 * @param {string} userQuery - User's natural language query
 * @param {Object} initialResponseJson - Initial LLM response
 * @param {Object} correctedResponseJson - Corrected LLM response
 * @param {number} rowCount - Number of rows returned
 * @param {number} executionTimeMs - Query execution time
 * @param {Date} queryTimestamp - When the query was executed
 */
async function logQuery(userQuery, initialResponseJson, correctedResponseJson, rowCount, executionTimeMs, queryTimestamp) {
    const insertQuery = `
        INSERT INTO query_logs (user_query, initial_response_json, corrected_response_json, row_count, execution_time_ms, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
        userQuery,
        JSON.stringify(initialResponseJson),
        JSON.stringify(correctedResponseJson),
        rowCount,
        executionTimeMs,
        queryTimestamp
    ];

    try {
        await writePool.query(insertQuery, values);
    } catch (error) {
        throw new DatabaseError('Failed to log query', error);
    }
}

/**
 * Logs error information when a query fails.
 * Uses the writePool to ensure logging is always available.
 * @param {string} userQuery - The failed query
 * @param {string} errorMessage - The error message
 * @param {Date} queryTimestamp - When the error occurred
 */
async function logError(userQuery, errorMessage, queryTimestamp) {
    const insertQuery = `
        INSERT INTO error_logs (user_query, error_message, created_at)
        VALUES ($1, $2, $3)
    `;

    const values = [userQuery, errorMessage, queryTimestamp];

    try {
        await writePool.query(insertQuery, values);
    } catch (error) {
        throw new DatabaseError('Failed to log error', error);
    }
}

export { writePool, readPool, readQuery, logQuery, logError };
