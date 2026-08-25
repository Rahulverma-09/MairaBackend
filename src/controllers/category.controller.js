const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Helper to find category by either _id or customId or name
const findCategoryByIdOrCustomId = async (id) => {
    if (!id) return null;
    let category = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        category = await Category.findById(id);
    }
    if (!category) {
        category = await Category.findOne({
            $or: [{ customId: id }, { customId: id.toUpperCase() }, { name: new RegExp(`^${id}$`, 'i') }]
        });
    }
    return category;
};

// @desc    Get all categories with product counts
// @route   GET /api/v1/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ order: 1, _id: 1 }) // _id as tiebreaker keeps sort partially indexed
            .allowDiskUse(true); // Prevents MongoDB 32MB in-memory sort limit

        // Fetch counts in parallel
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({
                    category: { $regex: new RegExp(`^${cat.name}$`, 'i') }
                });
                return {
                    ...cat.toObject(),
                    id: cat.customId || cat._id,
                    productCount: count
                };
            })
        );

        res.status(200).json(
            new ApiResponse(200, { categories: categoriesWithCount }, 'Categories retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await findCategoryByIdOrCustomId(req.params.id);

        if (!category) {
            return next(new ApiError(404, `Category not found with id ${req.params.id}`));
        }

        const products = await Product.find({
            category: { $regex: new RegExp(`^${category.name}$`, 'i') }
        });

        res.status(200).json(
            new ApiResponse(200, { category, products }, 'Category details retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
    try {
        const { id, customId, name, description, order } = req.body;
        let image = req.body.image || '';
        if (req.file) {
            image = `/uploads/${req.file.filename}`;
        }

        if (!name) {
            return next(new ApiError(400, 'Please provide category name'));
        }

        const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return next(new ApiError(400, 'Category with this name already exists'));
        }

        const category = await Category.create({
            customId: customId || id,
            name,
            description: description || '',
            image: image || '',
            order: order || 0
        });

        res.status(201).json(
            new ApiResponse(201, { category }, 'Category created successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
    try {
        const category = await findCategoryByIdOrCustomId(req.params.id);

        if (!category) {
            return next(new ApiError(404, `Category not found with id ${req.params.id}`));
        }

        if (req.file) req.body.image = `/uploads/${req.file.filename}`;
        const updated = await Category.findByIdAndUpdate(category._id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json(
            new ApiResponse(200, { category: updated }, 'Category updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await findCategoryByIdOrCustomId(req.params.id);

        if (!category) {
            return next(new ApiError(404, `Category not found with id ${req.params.id}`));
        }

        await Category.findByIdAndDelete(category._id);

        res.status(200).json(
            new ApiResponse(200, {}, 'Category deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

