import { makeLLMQuery } from "./aiUtils.js";
import { correctStationNames } from "./dbUtils.js";
import { APIError, BadRequestError, UnauthorizedQueryError } from './errors.js';

/**
 * Executes a database query with retry logic for handling timeouts and Postgres errors
 * 
 * @param {object} params
 * @param {string} params.sql - The SQL query to execute
 * @param {string} params.originalQuery - The original user query
 * @param {object} params.readOnlyPool - The database pool to use
 * @param {boolean} params.isSQLOnly - Whether this is a direct SQL query
 * @param {Function} params.getFinalSQLQueries - Function to get corrected SQL
 * @returns {Promise<object>} The query result
 */
async function executeQueryWithRetry({
    sql,
    originalQuery,
    readOnlyPool,
    isSQLOnly,
    getFinalSQLQueries
}) {
    let retryCount = 0;
    const MAX_RETRIES = 2;

    async function execute(currentSQL) {
        try {
            return await readOnlyPool.query(currentSQL);
        } catch (err) {
            if (err.message === 'Query read timeout') {
                throw new APIError('Query timeout: The query took too long to execute. Please simplify your query.', 408);
            }
            
            // If not in SQL-only mode and we haven't exceeded retries, attempt correction
            if (err.code && !isSQLOnly && retryCount < MAX_RETRIES) {
                retryCount++;

                console.log("retryCount", retryCount);
                // Retry with error context
                const queryResponse = await getFinalSQLQueries(originalQuery, {
                    previousError: {
                        message: err.message,
                        code: err.code,
                        invalidSQL: currentSQL
                    }
                });
                
                const newSQL = queryResponse.correctedResponse?.sql || queryResponse.initialResponse.sql;
                return await execute(newSQL);
            }
            
            // If max retries reached or other error, throw with detailed message
            throw new APIError(
                `Database error: ${err.message}`,
                500,
                { 
                    pgError: err.code, 
                    sql: currentSQL,
                    retryCount 
                }
            );
        }
    }

    return execute(sql);
}

/**
 * Gets both initial and corrected SQL queries from a natural language user query.
 * 
 * @param {string} userQuery - The natural language query from the user
 * @returns {Promise<Object>} An object containing:
 *   - initialResponse {Object} - The raw response from the LLM containing SQL and station info
 *   - correctedResponse {Object} - Response with corrected station names.
 * 
 * This function:
 * 1. Calls the LLM to convert natural language to SQL
 * 2. Validates the SQL query
 * 3. If stations are mentioned, corrects their names using fuzzy matching
 * 4. Returns both the initial and corrected responses
 */
async function getFinalSQLQueries(userQuery, context = null) {
    try {
        const initialResponse = await makeLLMQuery(userQuery, context);
        
        // Validate the SQL - check for SELECT NULL pattern
        if (initialResponse.sql.trim().toLowerCase() === 'select null;') {
            throw new BadRequestError(
                "I couldn't understand how your question relates to MTA subway data. " +
                "Please ask a question about subway stations, ridership, routes, or boroughs.",
                { invalidQuery: userQuery }
            );
        }

        // Add rounding to numeric calculations
        const numericFunctions = ['AVG', 'SUM', 'COUNT'];
        let modifiedSQL = initialResponse.sql;
        
        numericFunctions.forEach(func => {
            // Look for patterns like AVG(...) or SUM(...) and wrap them in ROUND
            const regex = new RegExp(`${func}\\s*\\((.*?)\\)`, 'gi');
            modifiedSQL = modifiedSQL.replace(regex, `ROUND(${func}($1), 2)`);
        });

        // Update the SQL in the response
        initialResponse.sql = modifiedSQL;

        // Process station names if needed
        const correctedResponse = initialResponse.stations ? 
            await correctStationNames(initialResponse) : null;

        return { initialResponse, correctedResponse };
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }
        throw new APIError(`Failed to generate SQL: ${error.message}`, 500);
    }
}

/**
 * Checks if a SQL query is safe to execute by looking for forbidden keywords.
 * 
 * @param {string} query - The SQL query to check
 * @returns {boolean} True if the query is safe (read-only), false otherwise
 * 
 * Checks for presence of dangerous SQL keywords like INSERT, UPDATE, DELETE, etc.
 * Returns false if any forbidden keywords are found, true otherwise.
 * Case-insensitive matching is used.
 */
const isQuerySafe = (query) => {
    const queryUpper = query.toUpperCase();
    const forbiddenKeywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE"];
    
    const foundKeyword = forbiddenKeywords.find(keyword =>
        new RegExp('\\b' + keyword + '\\b').test(queryUpper)
    );

    if (foundKeyword) {
        throw new UnauthorizedQueryError('Unauthorized query operation detected', {
            foundKeyword,
            query: query
        });
    }

    return true;
};

export { getFinalSQLQueries, isQuerySafe, executeQueryWithRetry };