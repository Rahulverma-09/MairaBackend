const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin', 'manager'), upload.single('image'), createCategory);

router.route('/:id')
    .get(getCategoryById)
    .put(protect, authorize('admin', 'manager'), upload.single('image'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
