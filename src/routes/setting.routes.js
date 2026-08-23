const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/setting.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', getSettings);
router.put('/', protect, authorize('admin', 'manager'), updateSettings);

module.exports = router;
