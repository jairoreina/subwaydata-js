import fs from "fs/promises";
import dotenv from "dotenv";
import * as fuzz from "fuzzball";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { readOnlyPool } from "./db.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function makeInitialQuery(userQuery) {
    const prompt = await fs.readFile('initial_prompt.txt', 'utf-8');

    const schema = {
        description: "Output containing a valid PostgreSQL query and a list of station tuples.",
        type: SchemaType.OBJECT,
        properties: {
          sql: {
            type: SchemaType.STRING,
            description: "A valid PostgreSQL query generated from the natural language input.",
            nullable: false,
          },
          stations: {
            type: SchemaType.ARRAY,
            description: "A list of tuples, where each tuple contains a station name and its corresponding route (or an empty string if no route is provided). If no train station is mentioned, this should be null.",
            nullable: true,
            items: {
              type: SchemaType.ARRAY,
              description: "A station tuple containing station name and route",
              items: {
                type: SchemaType.STRING,
                description: "Station name or route string"
              }
            }
          },
        },
        required: ["sql", "stations"],
    };

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        systemInstruction: prompt,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
        },
    });

    const result = await model.generateContent(userQuery);
    return JSON.parse(result.response.text());
}

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

async function getFinalSQLQueries(userQuery) {
    const initialResponse = await makeInitialQuery(userQuery);
    const correctedResponse = initialResponse.stations ? await correctStationNames(initialResponse) : null;
    return { initialResponse, correctedResponse };
}

const isQuerySafe = (query) => {
    const queryUpper = query.toUpperCase();
    const forbiddenKeywords = ["INSERT", "UPDATE", "DELETE", "DROP", "ALTER", "TRUNCATE", "CREATE"];

    return !forbiddenKeywords.some(keyword =>
        new RegExp('\\b' + keyword + '\\b').test(queryUpper)
    );
}

export { makeInitialQuery, correctStationNames, getFinalSQLQueries, isQuerySafe };