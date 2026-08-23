const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Optional auth for checkout (allows guest or logged-in user)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next);
    }
    next();
};

router.route('/')
    .post(optionalAuth, createOrder)
    .get(protect, authorize('admin', 'manager'), getAllOrders);

router.get('/my-orders', protect, getMyOrders);

router.route('/:id')
    .get(optionalAuth, getOrderById)
    .delete(protect, authorize('admin'), deleteOrder);

router.patch('/:id/status', protect, authorize('admin', 'manager'), updateOrderStatus);

module.exports = router;
