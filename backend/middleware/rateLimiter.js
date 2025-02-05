import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150,                 // Limit each IP to 150 requests per window
    message: {
        error: {
            message: 'Too many requests from this IP, please try again later.',
            status: 429
        }
    },
    standardHeaders: true,    // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,     // Disable the `X-RateLimit-*` headers
});

// Specific limiter for query endpoint
export const queryLimiter = rateLimit({
    windowMs: 60 * 1000,     // 1 minute
    max: 15,                 // Limit each IP to 15 queries per minute
    message: {
        error: {
            message: 'Query rate limit exceeded. Please wait before sending more queries.',
            status: 429
        }
    }
});
