const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const User = require('../models/User.model');
const Inquiry = require('../models/Inquiry.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get admin dashboard analytical stats
// @route   GET /api/v1/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalProducts,
            totalOrders,
            totalCustomers,
            unreadInquiries,
            recentOrders,
            allPaidOrders
        ] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments({ role: 'customer' }),
            Inquiry.countDocuments({ status: 'unread' }),
            Order.find().sort('-createdAt').limit(6),
            Order.find({ paymentStatus: 'Paid' })
        ]);

        const totalRevenue = allPaidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['Pending', 'Processing'] } });

        // Category distribution
        const categoryStats = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Monthly revenue trend (last 6 months)
        const monthlyTrend = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(
            new ApiResponse(200, {
                metrics: {
                    totalRevenue,
                    formattedRevenue: `R ${totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    totalOrders,
                    pendingOrders,
                    totalProducts,
                    totalCustomers,
                    unreadInquiries
                },
                categoryStats,
                monthlyTrend,
                recentOrders
            }, 'Dashboard stats computed')
        );
    } catch (error) {
        next(error);
    }
};
