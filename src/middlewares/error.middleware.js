const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log for development
    if (process.env.NODE_ENV !== 'test') {
        console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found with id: ${err.value}`;
        error = new ApiError(404, message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        const message = `Duplicate value entered for ${field}`;
        error = new ApiError(400, message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(400, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid authentication token');
    }
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Authentication token expired');
    }

    res.status(error.statusCode || 500).json({
        success: false,
        statusCode: error.statusCode || 500,
        message: error.message || 'Internal Server Error',
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    });
};

const notFound = (req, res, next) => {
    next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
