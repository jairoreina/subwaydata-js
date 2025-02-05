import express from "express";
import { pool, readOnlyPool, logQuery, logError } from "./db.js";
import { getFinalSQLQueries, isQuerySafe } from "./utils/queryUtils.js";
import { APIError, BadRequestError } from './utils/errors.js';

const router = express.Router();

router.post("/query", async (req, res) => {
    const startTime = Date.now();
    let userQuery;
    
    try {
        const { query, is_sql_only = false } = req.body;
        
        // Input validation
        if (!query || query.trim().length === 0) {
            throw new BadRequestError('Query cannot be empty');
        }
        
        if (query.length > 500) {
            throw new BadRequestError('Query is too long. Please limit to 500 characters', {
                queryLength: query.length,
                maxLength: 500 // See if this changes with the needs of the project
            });
        }

        userQuery = query;
        const queryTimestamp = new Date().toISOString();
        
        let generatedSQL;
        let initialResponse = null;
        let correctedResponse = null;

        // Determine the SQL query to execute
        if (is_sql_only) {
            generatedSQL = userQuery;
            initialResponse = "SQL only mode";
            correctedResponse = "SQL only mode";
        } else {
            const queryResponse = await getFinalSQLQueries(userQuery);
            initialResponse = queryResponse.initialResponse;
            correctedResponse = queryResponse.correctedResponse;
            generatedSQL = correctedResponse ? correctedResponse.sql : initialResponse.sql;
        }

        // Check if query is safe
        isQuerySafe(generatedSQL);  // Will throw UnauthorizedQueryError if unsafe

        // Execute the query
        const queryResult = await readOnlyPool.query(generatedSQL);
        
        if (!queryResult.rows || queryResult.rows.length === 0) {
            throw new Error("The query did not return any results.");
        }

        // Log the successful query
        await logQuery(
            pool,
            userQuery,
            JSON.stringify(initialResponse),
            JSON.stringify(correctedResponse),
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
        await logError(
            pool,
            userQuery || '',
            errorMessage,
            new Date().toISOString()
        ).catch(console.error);

        // Return appropriate error response with status code from custom error
        const statusCode = error instanceof APIError ? error.statusCode : 500;
        res.status(statusCode).json({
            error: {
                message: errorMessage,
                details: error instanceof APIError ? error.details : null
            }
        });
    }
});

export default router;