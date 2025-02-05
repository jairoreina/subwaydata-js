import fs from "fs/promises";
import dotenv from "dotenv";
import path from 'path';
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { fileURLToPath } from 'url';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Makes a query to the Gemini LLM to convert natural language to SQL.
 * 
 * @param {string} userQuery - The natural language query from the user
 * @returns {Promise<Object>} An object containing:
 *   - sql {string} - The generated PostgreSQL query
 *   - stations {Array<Array<string>>|null} - Array of [station, route] tuples, or null if no stations mentioned
 * 
 * The function reads a prompt template from initial_prompt.txt and uses it with a schema
 * to generate structured JSON output from the Gemini API containing both the SQL query
 * and any referenced station information.
 */
async function makeLLMQuery(userQuery) {
    const prompt = await fs.readFile(path.join(__dirname, '../initial_prompt.txt'), 'utf-8');

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

export { makeLLMQuery };