import { APIError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        details: err.details || {},
    });

    // If it's our custom error, use its status code and details
    if (err instanceof APIError) {
        return res.status(err.status).json({
            error: {
                message: err.message,
                status: err.status,
                details: err.details,
                timestamp: new Date().toISOString()
            }
        });
    }

    // Handle PostgreSQL errors
    if (err.code && err.code.startsWith('P')) {
        return res.status(400).json({
            error: {
                message: 'Database Error',
                status: 400,
                details: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred with the database',
                timestamp: new Date().toISOString()
            }
        });
    }

    // Default error response
    return res.status(500).json({
        error: {
            message: 'Internal Server Error',
            status: 500,
            details: process.env.NODE_ENV === 'development' ? err.message : null,
            timestamp: new Date().toISOString()
        }
    });
}; 