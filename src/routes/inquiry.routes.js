const express = require('express');
const router = express.Router();
const {
    createInquiry,
    getInquiries,
    updateInquiry,
    deleteInquiry
} = require('../controllers/inquiry.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.route('/')
    .post(createInquiry)
    .get(protect, authorize('admin', 'manager'), getInquiries);

router.route('/:id')
    .patch(protect, authorize('admin', 'manager'), updateInquiry)
    .delete(protect, authorize('admin'), deleteInquiry);

router.patch('/:id/status', protect, authorize('admin', 'manager'), updateInquiry);

module.exports = router;
