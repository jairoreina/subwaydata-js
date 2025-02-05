import pg from "pg";
import dotenv from "dotenv";
import { DatabaseError } from './utils/errors.js';

dotenv.config();

/**
 * Creates and returns a PostgreSQL connection pool with the specified permissions.
 * 
 * @param {boolean} readOnly - Whether to create a read-only pool (true) or read-write pool (false)
 * @returns {pg.Pool} A configured PostgreSQL connection pool
 * 
 * Uses environment variables to configure the pool:
 * - DB_HOST, DB_PORT, DB_NAME for connection details
 * - For read-only pool: RO_DB_USER, RO_DB_PASSWORD
 * - For read-write pool: DB_USER, DB_PASSWORD
 */
function getPool(readOnly = false) {
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: readOnly ? process.env.RO_DB_USER : process.env.DB_USER,
        password: readOnly ? process.env.RO_DB_PASSWORD : process.env.DB_PASSWORD,
        
        // Pool configuration
        max: 20,                         // Maximum number of clients in pool
        idleTimeoutMillis: 30000,       // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000,   // Return error after 2 seconds if connection not established
        statement_timeout: 10000,        // Cancel queries that take more than 10 seconds
        query_timeout: 5000,            // Timeout for acquiring a client from pool
    };
    
    const pool = new pg.Pool(config);
    
    // Error handling for the pool
    pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
    });

    return pool;
}

/**
 * Logs details about an executed query to the query_logs table.
 * 
 * @param {pg.Pool} pool - Database connection pool
 * @param {string} userQuery - The original natural language query from the user
 * @param {Object} initialResponseJson - The initial LLM response with SQL and station info
 * @param {Object} correctedResponseJson - Response with corrected station names
 * @param {number} rowCount - Number of rows returned by the query
 * @param {number} executionTimeMs - Query execution time in milliseconds
 * @param {Date} queryTimestamp - When the query was executed
 * @returns {Promise<void>}
 * 
 * Stores query execution details including:
 * - Original user query
 * - Initial and corrected LLM responses
 * - Result statistics (row count, execution time)
 * - Timestamp
 */
async function logQuery(pool, userQuery, initialResponseJson, correctedResponseJson, rowCount, executionTimeMs, queryTimestamp) {
    const logEntry = {
        userQuery: userQuery,
        initialResponseJson: JSON.stringify(initialResponseJson),
        correctedResponseJson: JSON.stringify(correctedResponseJson),
        rowCount: rowCount,
        executionTimeMs: executionTimeMs,
        queryTimestamp: queryTimestamp,
    };

    const insertQuery = `
        INSERT INTO query_logs (user_query, initial_response_json, corrected_response_json, row_count, execution_time_ms, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
        logEntry.userQuery,
        logEntry.initialResponseJson,
        logEntry.correctedResponseJson,
        logEntry.rowCount,
        logEntry.executionTimeMs,
        logEntry.queryTimestamp,
    ];

    try {
        await pool.query(insertQuery, values);
    } catch (error) {
        throw new DatabaseError('Failed to log query', error);
    }
}

/**
 * Logs error information when a query fails.
 * 
 * @param {pg.Pool} pool - Database connection pool
 * @param {string} userQuery - The original natural language query that failed
 * @param {string} errorMessage - The error message describing what went wrong
 * @param {Date} queryTimestamp - When the error occurred
 * @returns {Promise<void>}
 * 
 * Records error details including:
 * - Failed query
 * - Error message
 * - Timestamp
 */
async function logError(pool, userQuery, errorMessage, queryTimestamp) {
    const logEntry = {
        userQuery: userQuery,
        errorMessage: errorMessage,
        queryTimestamp: queryTimestamp,
    };

    const insertQuery = `
        INSERT INTO error_logs (user_query, error_message, created_at)
        VALUES ($1, $2, $3)
    `;

    const values = [
        logEntry.userQuery,
        logEntry.errorMessage,
        logEntry.queryTimestamp,
    ];

    try {
        await pool.query(insertQuery, values);
    } catch (error) {
        throw new DatabaseError('Failed to log error', error);
    }
}

const pool = getPool(false);
const readOnlyPool = getPool(true);

export { pool, readOnlyPool, logQuery, logError };