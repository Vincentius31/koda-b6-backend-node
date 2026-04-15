/**
 * Global error handler middleware
 * Must be placed after all routes in main.js
 * 
 * @param {Error} err - Error object
 * @param {import("express").Request} req - Request object
 * @param {import("express").Response} res - Response object
 * @param {import("express").NextFunction} next - Next function
 */
export function errorHandler(err, req, res, next) {
    // Default values
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    // Log error details
    console.error("=== ERROR ===")
    console.error("Timestamp:", new Date().toISOString())
    console.error("Method:", req.method)
    console.error("Path:", req.path)
    console.error("Status:", err.statusCode)
    console.error("Message:", err.message)
    if (err.stack && process.env.NODE_ENV !== "production") {
        console.error("Stack:", err.stack)
    }

    // PostgreSQL unique constraint violation (duplicate entry)
    if (err.code === "23505") {
        const message = extractDuplicateMessage(err.detail) || "Duplicate entry"
        return res.status(409).json({
            success: false,
            message: message
        })
    }

    // PostgreSQL foreign key violation
    if (err.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Referenced resource not found"
        })
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired"
        })
    }

    // Multer file upload errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File size too large"
        })
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            success: false,
            message: "Unexpected file field"
        })
    }

    // Operational errors (expected errors we created)
    if (err.isOperational) {
        const response = {
            success: false,
            message: err.message
        }

        // Add validation errors if present
        if (err.errors) {
            response.errors = err.errors
        }

        return res.status(err.statusCode).json(response)
    }

    // Programming or unknown errors - don't leak details
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message
    })
}

/**
 * Extract duplicate field message from PostgreSQL error detail
 * @param {string} detail - PostgreSQL error detail
 * @returns {string|null}
 */
function extractDuplicateMessage(detail) {
    if (!detail) return null

    const match = detail.match(/Key \((.+?)\)=\((.+?)\) already exists/)
    if (match) {
        return `${match[1]} "${match[2]}" already exists`
    }
    return null
}

/**
 * 404 handler for unknown routes
 */
export function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.path}`
    })
}
