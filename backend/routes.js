import express from "express";
import { writePool, readPool, logQuery, logError } from "./db.js";
import { getFinalSQLQueries, isQuerySafe, executeQueryWithRetry } from "./utils/queryUtils.js";
import { APIError, BadRequestError } from './utils/errors.js';

const router = express.Router();

router.post("/query", async (req, res) => {
    const startTime = Date.now();
    let userQuery;

    try {
        const { query, is_sql_only = false } = req.body;

        // Validate input
        if (!query || query.trim().length === 0) {
            throw new BadRequestError('Query cannot be empty');
        }
        if (query.length > 500) {
            throw new BadRequestError('Query is too long. Please limit to 500 characters', {
                queryLength: query.length,
                maxLength: 500
            });
        }

        userQuery = query;
        const queryTimestamp = new Date().toISOString();
        
        let generatedSQL, initialResponse, correctedResponse;

        // Determine the SQL query to execute
        if (is_sql_only) {
            generatedSQL = userQuery;
            initialResponse = correctedResponse = { sql: "SQL only mode" };
        } else {
            const queryResponse = await getFinalSQLQueries(userQuery);
            initialResponse = queryResponse.initialResponse;
            correctedResponse = queryResponse.correctedResponse;
            generatedSQL = correctedResponse?.sql || initialResponse.sql;
        }

        // Ensure the query is safe
        isQuerySafe(generatedSQL);

        // Execute the query using readPool
        const queryResult = await executeQueryWithRetry({
            sql: generatedSQL,
            originalQuery: userQuery,
            readPool,
            isSQLOnly: is_sql_only,
            getFinalSQLQueries
        });

        if (!queryResult.rows || queryResult.rows.length === 0) {
            throw new APIError("The query did not return any results.", 404);
        }

        // Log the successful query
        await logQuery(
            userQuery,
            initialResponse,
            correctedResponse,
            queryResult.rowCount,
            Date.now() - startTime,
            queryTimestamp
        );

        // Return the response
        res.json({
            data: queryResult.rows,
            query: generatedSQL,
            columns: queryResult.fields.map(field => ({
                name: field.name.replace(/_/g, ' ').toUpperCase(),
                type: field.dataTypeID
            }))
        });

    } catch (error) {
        const errorMessage = error.message || "An unexpected error occurred";

        // Log the error
        await logError(userQuery || '', errorMessage, new Date().toISOString()).catch(console.error);

        // Return an appropriate error response
        res.status(error instanceof APIError ? error.statusCode : 500).json({
            error: {
                message: errorMessage,
                details: error instanceof APIError ? error.details : null
            }
        });
    }
});

export default router;