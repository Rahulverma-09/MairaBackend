const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { uploadSingle, uploadMultiple } = require('../controllers/upload.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.post('/single', protect, authorize('admin', 'manager'), upload.single('image'), uploadSingle);
router.post('/multiple', protect, authorize('admin', 'manager'), upload.array('images', 8), uploadMultiple);

module.exports = router;
