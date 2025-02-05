import express from "express";
import { pool, readOnlyPool, logQuery, logError } from "./db.js";
import { getFinalSQLQueries, isQuerySafe } from "./utils.js";

const router = express.Router();

router.post("/query", async (req, res) => {
    const startTime = Date.now();
    try {
        const { query: userQuery, is_sql_only = false } = req.body;
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
        if (!isQuerySafe(generatedSQL)) {
            throw new Error("Generated query is not safe to execute.");
        }

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
            userQuery,
            errorMessage,
            new Date().toISOString()
        ).catch(console.error);  // Catch logging errors separately

        // Return appropriate error response
        res.status(error instanceof Error ? 400 : 500).json({
            error: errorMessage
        });
    }
});

export default router;