const User = require('../models/User.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Register a new customer
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone, newsletter } = req.body;

        if (!name || !email || !password) {
            return next(new ApiError(400, 'Please provide name, email, and password'));
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return next(new ApiError(400, 'An account with this email already exists'));
        }

        const customerCount = await User.countDocuments({ role: "customer" });
        const customerId = `CUST-${String(customerCount + 1).padStart(3, "0")}`;

        const user = await User.create({
            customerId,
            name,
            email: email.toLowerCase(),
            password,
            phone: phone || '',
            role: 'customer',
            newsletter: newsletter !== undefined ? newsletter : true
        });

        const token = user.getSignedJwtToken();

        res.status(201).json(
            new ApiResponse(201, {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar
                },
                token
            }, 'User registered successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Login user (Customer or Admin)
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ApiError(400, 'Please provide an email and password'));
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return next(new ApiError(401, 'Invalid email or password credentials'));
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new ApiError(401, 'Invalid email or password credentials'));
        }

        const token = user.getSignedJwtToken();

        res.status(200).json(
            new ApiResponse(200, {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    address: user.address
                },
                token
            }, 'Login successful')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Dedicated Admin Login
// @route   POST /api/v1/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ApiError(400, 'Please provide admin email and password'));
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return next(new ApiError(401, 'Invalid admin credentials'));
        }

        if (user.role !== 'admin' && user.role !== 'manager') {
            return next(new ApiError(403, 'Access denied. You do not have administrator permissions'));
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new ApiError(401, 'Invalid admin credentials'));
        }

        const token = user.getSignedJwtToken();

        res.status(200).json(
            new ApiResponse(200, {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar || 'A'
                },
                token
            }, 'Admin authenticated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me or GET /api/v1/auth/profile
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new ApiError(404, 'User profile not found'));
        }
        const userObj = user.toObject();
        res.status(200).json(
            new ApiResponse(200, { user: userObj, ...userObj }, 'User profile retrieved')
        );
    } catch (error) {
        next(error);
    }
};

exports.getProfile = exports.getMe;

// @desc    Update user details
// @route   PUT /api/v1/auth/profile or POST /api/v1/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            email: req.body.email ? req.body.email.toLowerCase() : undefined,
            phone: req.body.phone,
            avatar: req.body.avatar,
            role: req.body.role,
            address: req.body.address
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]);

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        const userObj = user.toObject();
        res.status(200).json(
            new ApiResponse(200, { user: userObj, ...userObj }, 'Profile updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return next(new ApiError(400, 'Please provide current and new password'));
        }

        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return next(new ApiError(400, 'Incorrect current password'));
        }

        user.password = newPassword;
        await user.save();

        const token = user.getSignedJwtToken();

        res.status(200).json(
            new ApiResponse(200, { token }, 'Password updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear session
// @route   GET/POST /api/v1/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
    try {
        res.status(200).json(
            new ApiResponse(200, null, 'Logged out successfully')
        );
    } catch (error) {
        next(error);
    }
};

