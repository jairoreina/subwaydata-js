import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import router from "./routes.js";
import { limiter, queryLimiter } from "./middleware/rateLimiter.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());  // Sets various HTTP headers for security
app.use(cors());    // Enable Cross-Origin Resource Sharing
app.use(compression());  // Compress all responses

// Request parsing middleware
app.use(express.json({ limit: '100kb' }));  // Parse JSON payloads
app.use(express.urlencoded({ extended: true, limit: '100kb' }));  // Parse URL-encoded bodies

// Rate limiting
app.use(limiter);  // Global rate limit
app.use("/api", queryLimiter, router);  // Stricter limit for API endpoints

// Health check endpoint
app.get("/", (req, res) => {
    res.send("Subway data API is running");
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});