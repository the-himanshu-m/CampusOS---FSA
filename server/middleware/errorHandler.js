const errorHandler = (error, req, res, next) => {
    // Avoid console spam during expected client validation errors
    if (!error.statusCode || error.statusCode >= 500) {
        console.error("Internal Server Error:", error);
    }

    // Mongoose CastError (e.g., malformed ObjectId)
    if (error.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ID format for field '${error.path}'`
        });
    }

    // Mongoose ValidationError
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(", ")
        });
    }

    // MongoDB Duplicate Key Error (Code 11000)
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0] || "Field";
        return res.status(409).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT verification errors
    if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

    if (error.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired"
        });
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";

    return res.status(statusCode).json({
        success: false,
        message: statusCode === 500 && process.env.NODE_ENV === "production"
            ? "Internal server error"
            : message
    });
};

export default errorHandler;