import { makeLLMQuery } from "./aiUtils.js";
import { correctStationNames } from "./dbUtils.js";
import { APIError, BadRequestError, UnauthorizedQueryError } from './errors.js';

/**
 * Executes a database query with retry logic.
 */
async function executeQueryWithRetry({ sql, originalQuery, readPool, isSQLOnly, getFinalSQLQueries }) {
    let retryCount = 0;
    const MAX_RETRIES = 2;

    async function execute(currentSQL) {
        try {
            return await readPool.query(currentSQL);
        } catch (err) {
            if (err.message === 'Query read timeout') {
                throw new APIError('Query timeout: The query took too long to execute. Please simplify your query.', 408);
            }

            if (!isSQLOnly && retryCount < MAX_RETRIES) {
                retryCount++;
                const queryResponse = await getFinalSQLQueries(originalQuery, {
                    previousError: { message: err.message, code: err.code, invalidSQL: currentSQL }
                });

                return execute(queryResponse.correctedResponse?.sql || queryResponse.initialResponse.sql);
            }

            throw new APIError(`Database error: ${err.message}`, 500, { pgError: err.code, sql: currentSQL, retryCount });
        }
    }

    return execute(sql);
}

/**
 * Gets both initial and corrected SQL queries from a user query.
 */
async function getFinalSQLQueries(userQuery, context = null) {
    try {
        const initialResponse = await makeLLMQuery(userQuery, context);

        if (initialResponse.sql.trim().toLowerCase() === 'select null;') {
            throw new BadRequestError(
                "I couldn't understand how your question relates to MTA subway data.",
                { invalidQuery: userQuery }
            );
        }

        const numericFunctions = ['AVG', 'SUM', 'COUNT'];
        initialResponse.sql = numericFunctions.reduce(
            (sql, func) => sql.replace(new RegExp(`${func}\\s*\\((.*?)\\)`, 'gi'), `ROUND(${func}($1), 2)`),
            initialResponse.sql
        );

        const correctedResponse = initialResponse.stations ? await correctStationNames(initialResponse) : null;
        return { initialResponse, correctedResponse };
    } catch (error) {
        throw error instanceof APIError ? error : new APIError(`Failed to generate SQL: ${error.message}`, 500);
    }
}

/**
 * Ensures a SQL query is safe to execute.
 */
const isQuerySafe = (query) => {
    const queryUpper = query.toUpperCase();
    const forbiddenKeywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE"];

    if (forbiddenKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(queryUpper))) {
        throw new UnauthorizedQueryError('Unauthorized query operation detected', { query });
    }

    return true;
};

export { getFinalSQLQueries, isQuerySafe, executeQueryWithRetry };
