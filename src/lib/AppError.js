/**
 * Base Application Error class
 * Extends Error to add HTTP status code
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

/**
 * 400 - Bad Request
 * Used for validation errors, missing required fields
 */
class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400)
    }
}

/**
 * 401 - Unauthorized
 * Used for invalid/missing authentication
 */
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401)
    }
}

/**
 * 403 - Forbidden
 * Used for insufficient permissions
 */
class ForbiddenError extends AppError {
    constructor(message = "Forbidden") {
        super(message, 403)
    }
}

/**
 * 404 - Not Found
 * Used when resource doesn't exist
 */
class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404)
    }
}

/**
 * 409 - Conflict
 * Used for duplicate entries, constraint violations
 */
class ConflictError extends AppError {
    constructor(message = "Conflict") {
        super(message, 409)
    }
}

/**
 * 422 - Unprocessable Entity
 * Used for validation errors
 */
class ValidationError extends AppError {
    constructor(message = "Validation failed", errors = []) {
        super(message, 422)
        this.errors = errors
    }
}

/**
 * 500 - Internal Server Error
 * Used for unexpected errors
 */
class InternalServerError extends AppError {
    constructor(message = "Internal server error") {
        super(message, 500)
    }
}

export {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalServerError
}
