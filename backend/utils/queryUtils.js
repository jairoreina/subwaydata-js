import { makeLLMQuery } from "./aiUtils.js";
import { correctStationNames } from "./dbUtils.js";
import { UnauthorizedQueryError } from './errors.js';

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
 * 2. If stations are mentioned, corrects their names using fuzzy matching
 * 3. Returns both the initial and corrected responses
 */
async function getFinalSQLQueries(userQuery) {
    const initialResponse = await makeLLMQuery(userQuery);
    const correctedResponse = initialResponse.stations ? await correctStationNames(initialResponse) : null;
    return { initialResponse, correctedResponse };
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

export { getFinalSQLQueries, isQuerySafe };