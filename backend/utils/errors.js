class APIError extends Error {
    constructor(message, status = 500, details = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = status;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Specific error types
class BadRequestError extends APIError {
    constructor(message = 'Bad Request', details = null) {
        super(message, 400, details);
    }
}

class NotFoundError extends APIError {
    constructor(message = 'Resource Not Found', details = null) {
        super(message, 404, details);
    }
}

class DatabaseError extends APIError {
    constructor(message = 'Database Error', details = null) {
        super(message, 500, details);
    }
}

class UnauthorizedQueryError extends APIError {
    constructor(message = 'Unauthorized query detected', details = null) {
        super(message, 403, details);  // 403 Forbidden status code
    }
}

export { APIError, BadRequestError, NotFoundError, DatabaseError, UnauthorizedQueryError };