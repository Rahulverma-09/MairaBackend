const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin', 'manager'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('admin', 'manager'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
