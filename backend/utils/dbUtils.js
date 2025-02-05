import * as fuzz from "fuzzball";
import { readOnlyPool } from "../db.js";

/**
 * Corrects station names in an SQL query using fuzzy matching against the database.
 * 
 * @param {Object} responseJSON - Object containing SQL query and station information
 * @param {string} responseJSON.sql - The SQL query containing station names
 * @param {Array<Array<string>>|null} responseJSON.stations - Array of [station_name, route] tuples, or null if no stations
 * @returns {Promise<Object>} The responseJSON object with corrected station names in the SQL query
 * 
 * For each station mentioned in the query, this function:
 * 1. Queries the database for valid station names (filtered by route if provided)
 * 2. Uses fuzzy matching to find the closest matching official station name
 * 3. Replaces the original station name in the SQL query with the corrected version
 * 
 * If no stations are provided or an error occurs, returns the original responseJSON unchanged.
 */

async function correctStationNames(responseJSON) {
    // Return early if stations is null or empty
    if (!responseJSON.stations || responseJSON.stations.length === 0) {
        return responseJSON;
    }

    for (const station of responseJSON.stations) {
        const [station_name, route] = station;
        
        // Define query based on route presence
        const stationsQuery = route
            ? `
                SELECT sr.*, s.station_complex
                FROM stations s
                JOIN station_routes sr ON s.station_complex_id = sr.station_complex_id
                WHERE route_name ILIKE $1
            `
            : "SELECT station_complex FROM stations";
        const params = route ? [route] : [];
        
        try {
            const stationsResult = await readOnlyPool.query(stationsQuery, params);
            const stationsList = stationsResult.rows.map(row => row.station_complex);
            
            if (stationsList.length === 0) continue;

            const matches = fuzz.extract(
                station_name, 
                stationsList, 
                {
                    limit: 3,
                    scorer: fuzz.partial_token_sort_ratio
                }
            );
            
            if (matches && matches[0] && matches[0][0]) {
                const bestMatch = matches[0][0];
                // Use regex to ensure we only replace the exact station name
                const regex = new RegExp(`\\b${station_name}\\b`, 'gi');
                responseJSON.sql = responseJSON.sql.replace(regex, bestMatch);
            }
        } catch (error) {
            console.error(`Error processing station ${station_name}:`, error);
        }
    }
    return responseJSON;
}

export { correctStationNames };