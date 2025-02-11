import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import router from "./routes.js";
import { limiter, queryLimiter } from "./middleware/rateLimiter.js";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the frontend build folder
const frontendPath = path.join(__dirname, "../frontend/dist");

app.set("trust proxy", 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "https://subwaydata-js-production.up.railway.app", "https://nycsubwaydata.com"],
        },
    },
}));

// Enable CORS with specific options
app.use(cors({
    origin: [
        'https://nycsubwaydata.com',
        'http://localhost:5173',  // Your local frontend
        'http://localhost:5001',  // Your local backend
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(compression());  // Compresses all responses

// Request parsing middleware
app.use(express.json({ limit: "100kb" }));  // Parse JSON payloads
app.use(express.urlencoded({ extended: true, limit: "100kb" }));  // Parse URL-encoded bodies

// Rate limiting
app.use(limiter);  // Global rate limit
app.use("/api", queryLimiter, router);  // Stricter limit for API endpoints

// Serve static frontend files
app.use(express.static(frontendPath));

// Health check endpoint
app.get("/api", (req, res) => {
    res.send("Subway data API is running");
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Serve frontend for all other routes
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
