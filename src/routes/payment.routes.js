const express = require('express');
const router = express.Router();
const { getPayments, updatePaymentStatus } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, authorize('admin', 'manager'), getPayments);
router.patch('/:id/status', protect, authorize('admin', 'manager'), updatePaymentStatus);

module.exports = router;
