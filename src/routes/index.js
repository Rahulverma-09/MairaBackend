const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const paymentRoutes = require('./payment.routes');
const inquiryRoutes = require('./inquiry.routes');
const faqRoutes = require('./faq.routes');
const settingRoutes = require('./setting.routes');
const dashboardRoutes = require('./dashboard.routes');
const uploadRoutes = require('./upload.routes');

// Healthcheck
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'online',
        service: 'Maira Jewels E-Commerce & Admin API',
        timestamp: new Date().toISOString()
    });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/contacts', inquiryRoutes);
router.use('/faqs', faqRoutes);
router.use('/settings', settingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);


const { protect, authorize } = require('../middlewares/auth.middleware');
const User = require('../models/User.model');

// @route GET /api/v1/customers & /api/v1/users
// @access Private/Admin
const getCustomersHandler = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'customer' }).sort('-createdAt');
        const customers = users.map((user, idx) => {
            const formattedId = user.customerId || `CUST-${String(idx + 1).padStart(3, '0')}`;
            return {
                id: formattedId,
                _id: user._id,
                customerId: formattedId,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                createdAt: user.createdAt
            };
        });
        res.status(200).json({
            success: true,
            statusCode: 200,
            data: { count: customers.length, customers, users: customers },
            message: 'Customers retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

router.get('/customers', protect, authorize('admin', 'manager'), getCustomersHandler);
router.get('/users', protect, authorize('admin', 'manager'), getCustomersHandler);

module.exports = router;

