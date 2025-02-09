import * as fuzz from "fuzzball";
import { readPool } from "../db.js";

/**
 * Corrects station names in an SQL query using fuzzy matching.
 *
 * @param {Object} responseJSON - The response containing SQL and stations.
 * @returns {Promise<Object>} The updated response with corrected station names.
 */
async function correctStationNames(responseJSON) {
    if (!responseJSON.stations || responseJSON.stations.length === 0) return responseJSON;

    for (const [station_name, route] of responseJSON.stations) {
        if (!station_name && route) continue; // Skip empty station names

        const stationsQuery = route
            ? `SELECT sr.*, s.station_complex FROM stations s JOIN station_routes sr ON s.station_complex_id = sr.station_complex_id WHERE route_name ILIKE $1`
            : `SELECT station_complex FROM stations`;
        const params = route ? [route] : [];

        try {
            const { rows } = await readPool.query(stationsQuery, params);
            const stationsList = rows.map(row => row.station_complex);

            if (stationsList.length === 0 || !station_name) continue;

            const bestMatch = fuzz.extractBest(station_name, stationsList, {
                scorer: fuzz.partial_token_sort_ratio
            })?.[0];

            if (bestMatch) {
                responseJSON.sql = responseJSON.sql.replace(new RegExp(`\\b${station_name}\\b`, 'gi'), bestMatch);
            }
        } catch (error) {
            console.error(`Error processing station ${station_name}:`, error);
        }
    }
    return responseJSON;
}

export { correctStationNames };
