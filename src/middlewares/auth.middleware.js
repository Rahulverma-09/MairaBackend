const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const User = require('../models/User.model');

// Protect routes - verifies Bearer token
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError(401, 'Not authorized to access this route, token missing'));
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'maira_jewels_super_secret_jwt_key_2026_luxury_secure'
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new ApiError(401, 'User belonging to this token no longer exists'));
        }

        req.user = user;
        next();
    } catch (err) {
        return next(new ApiError(401, 'Not authorized to access this route, invalid token'));
    }
};

// Grant access to specific roles (e.g. 'admin', 'manager')
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    403,
                    `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this resource`
                )
            );
        }
        next();
    };
};

module.exports = { protect, authorize };
