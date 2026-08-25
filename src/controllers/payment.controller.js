const Payment = require('../models/Payment.model');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// @desc    Get all payment records
// @route   GET /api/v1/payments
// @access  Private/Admin
exports.getPayments = async (req, res, next) => {
    try {
        const { status, method, search, page = 1, limit = 50 } = req.query;

        let query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (method && method !== 'All') {
            query.method = method;
        }
        if (search) {
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
                { orderNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { customerEmail: { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await Payment.countDocuments(query);
        const payments = await Payment.find(query)
            .sort('-_id') // _id is always indexed — avoids 32MB in-memory sort limit
            .skip(skip)
            .limit(limitNum)
            .allowDiskUse(true); // Prevents MongoDB sort memory crash

        res.status(200).json(
            new ApiResponse(200, {
                total,
                count: payments.length,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                payments
            }, 'Payment records retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update payment status
// @route   PATCH /api/v1/payments/:id/status
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!payment) {
            return next(new ApiError(404, `Payment not found with id ${req.params.id}`));
        }

        res.status(200).json(
            new ApiResponse(200, { payment }, 'Payment status updated')
        );
    } catch (error) {
        next(error);
    }
};

