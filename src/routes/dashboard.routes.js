const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/stats', protect, authorize('admin', 'manager'), getDashboardStats);

module.exports = router;
