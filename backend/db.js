import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

function getPool(readOnly = false) {
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: readOnly ? process.env.RO_DB_USER : process.env.DB_USER,
        password: readOnly ? process.env.RO_DB_PASSWORD : process.env.DB_PASSWORD,
    };
    
    return new pg.Pool(config);
}

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
        console.error('Error logging query:', error);
    }
}

async function logError(pool, userQuery, errorMessage, queryTimestamp) {
    const logEntry = {
        userQuery: userQuery,
        errorMessage: errorMessage,
        queryTimestamp: queryTimestamp,
    };

    const insertQuery = `
        INSERT INTO query_logs (user_query, error_message, created_at)
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
        console.error('Error logging query:', error);
    }
}

const pool = getPool(false);
const readOnlyPool = getPool(true);

export { pool, readOnlyPool, logQuery, logError };