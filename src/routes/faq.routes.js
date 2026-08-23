const express = require('express');
const router = express.Router();
const {
    getFaqs,
    createFaq,
    updateFaq,
    replyFaq,
    deleteFaq
} = require('../controllers/faq.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.route('/')
    .get(getFaqs)
    .post(protect, authorize('admin', 'manager'), createFaq);

router.route('/:id')
    .put(protect, authorize('admin', 'manager'), updateFaq)
    .delete(protect, authorize('admin'), deleteFaq);

router.patch('/:id/reply', protect, authorize('admin', 'manager'), replyFaq);

module.exports = router;
