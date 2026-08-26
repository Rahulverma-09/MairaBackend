const Product = require('../models/Product.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const { category, metal, gem, badge, minPrice, maxPrice, search, sort, page = 1, limit = 50 } = req.query;

        let query = {};

        if (category && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (metal && metal !== 'All') {
            query.metal = { $regex: new RegExp(metal, 'i') };
        }
        if (gem && gem !== 'All') {
            query.gem = { $regex: new RegExp(gem, 'i') };
        }
        if (badge) {
            query.badge = badge.toUpperCase();
        }
        if (minPrice || maxPrice) {
            query.priceNum = {};
            if (minPrice) query.priceNum.$gte = parseFloat(minPrice);
            if (maxPrice) query.priceNum.$lte = parseFloat(maxPrice);
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { customId: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { details: { $regex: search, $options: 'i' } },
                { specs: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { badge: { $regex: search, $options: 'i' } },
                { color: { $regex: search, $options: 'i' } },
                { sizes: { $regex: search, $options: 'i' } }
            ];
        }

        // Sorting
        let sortBy = '-_id'; // Default: use _id index — avoids 32MB in-memory sort limit
        if (sort === 'price-asc') sortBy = 'priceNum';
        if (sort === 'price-desc') sortBy = '-priceNum';
        if (sort === 'name-asc') sortBy = 'name';
        if (sort === 'name-desc') sortBy = '-name';
        if (sort === 'rating') sortBy = '-rating';

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortBy)
            .skip(skip)
            .limit(limitNum)
            .allowDiskUse(true); // Prevents MongoDB 32MB in-memory sort limit crash

        res.status(200).json(
            new ApiResponse(200, {
                total,
                count: products.length,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                products
            }, 'Products retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// Helper to find product by either MongoDB _id or customId
const findProductByIdOrCustomId = async (id) => {
    if (!id) return null;
    let product = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id);
    }
    if (!product) {
        product = await Product.findOne({
            $or: [{ customId: id }, { customId: id.toUpperCase() }]
        });
    }
    return product;
};

// @desc    Get single product by ID or customId
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProductById = async (req, res, next) => {
    try {
        const product = await findProductByIdOrCustomId(req.params.id);

        if (!product) {
            return next(new ApiError(404, `Product not found with id ${req.params.id}`));
        }

        // Related products in the same category
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);

        res.status(200).json(
            new ApiResponse(200, { product, related }, 'Product details retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        const {
            id,
            customId,
            name,
            category,
            price,
            priceNum,
            metal,
            gem,
            specs,
            color,
            colour,
            sizes,
            availableSizes,
            badge,
            image,
            images,
            thumbs,
            description,
            details,
            stock,
            countInStock,
            stockQty,
            inStock,
            featured
        } = req.body;

        if (!name || !category || (price === undefined && priceNum === undefined)) {
            return next(new ApiError(400, 'Please provide name, category, and price'));
        }

        const calculatedPriceNum = priceNum !== undefined ? Number(priceNum) : parseFloat(String(price).replace(/[^0-9.]/g, '')) || 0;
        const formattedPrice = price || `R ${calculatedPriceNum.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const resolvedImages = (images && images.length > 0)
            ? images
            : (thumbs && thumbs.length > 0 ? thumbs : (image ? [image] : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80']));

        // Auto-derive metal and gemstone from specs if not directly specified
        let resolvedMetal = metal || '';
        let resolvedGem = gem || '';
        const specsText = (specs || '') + ' ' + (description || '') + ' ' + (details || '') + ' ' + (name || '');

        if (!resolvedMetal) {
            if (/24K/i.test(specsText)) resolvedMetal = '24K Gold';
            else if (/Rose\s*Gold/i.test(specsText)) resolvedMetal = 'Rose Gold';
            else if (/White\s*Gold/i.test(specsText)) resolvedMetal = '18K White Gold';
            else if (/Platinum/i.test(specsText)) resolvedMetal = 'Platinum';
            else resolvedMetal = '18K Gold';
        }

        if (!resolvedGem) {
            if (/Emerald/i.test(specsText)) resolvedGem = 'Emerald';
            else if (/Sapphire/i.test(specsText)) resolvedGem = 'Sapphire';
            else if (/Ruby/i.test(specsText)) resolvedGem = 'Ruby';
            else if (/Pearl/i.test(specsText)) resolvedGem = 'Pearl';
            else resolvedGem = 'Diamond';
        }

        const resolvedStock = stock !== undefined
            ? Number(stock)
            : (countInStock !== undefined
                ? Number(countInStock)
                : (stockQty !== undefined ? Number(stockQty) : 10));

        const resolvedColor = color !== undefined ? color : (colour !== undefined ? colour : '');
        const resolvedSizes = sizes !== undefined ? sizes : (availableSizes !== undefined ? availableSizes : '');

        const product = await Product.create({
            customId: customId || id,
            name,
            category,
            price: formattedPrice,
            priceNum: calculatedPriceNum,
            metal: resolvedMetal,
            gem: resolvedGem,
            specs: specs || '',
            color: resolvedColor,
            sizes: resolvedSizes,
            badge: badge || '',
            image: resolvedImages[0],
            images: resolvedImages,
            thumbs: resolvedImages,
            description: description || '',
            details: details || '',
            stock: resolvedStock,
            countInStock: resolvedStock,
            stockQty: resolvedStock,
            inStock: inStock !== undefined ? inStock : (resolvedStock > 0),
            featured: featured || false
        });

        res.status(201).json(
            new ApiResponse(201, { product }, 'Product created successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        let updateData = { ...req.body };

        if (updateData.colour !== undefined && updateData.color === undefined) {
            updateData.color = updateData.colour;
        }
        if (updateData.availableSizes !== undefined && updateData.sizes === undefined) {
            updateData.sizes = updateData.availableSizes;
        }

        if (updateData.stock !== undefined || updateData.countInStock !== undefined || updateData.stockQty !== undefined) {
            const resolvedStock = updateData.stock !== undefined
                ? Number(updateData.stock)
                : (updateData.countInStock !== undefined
                    ? Number(updateData.countInStock)
                    : Number(updateData.stockQty));
            updateData.stock = resolvedStock;
            updateData.countInStock = resolvedStock;
            updateData.stockQty = resolvedStock;
            if (updateData.inStock === undefined) {
                updateData.inStock = resolvedStock > 0;
            }
        }

        if (updateData.priceNum !== undefined && !updateData.price) {
            updateData.price = `R ${Number(updateData.priceNum).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        if (updateData.images && updateData.images.length > 0) {
            updateData.image = updateData.images[0];
            updateData.thumbs = updateData.images;
        } else if (updateData.thumbs && updateData.thumbs.length > 0) {
            updateData.image = updateData.thumbs[0];
            updateData.images = updateData.thumbs;
        }

        // Auto-derive metal/gem if specs are updated
        if (updateData.specs || updateData.description || updateData.details || updateData.name) {
            const specsText = `${updateData.specs || ''} ${updateData.description || ''} ${updateData.details || ''} ${updateData.name || ''}`;
            if (!updateData.metal) {
                if (/24K/i.test(specsText)) updateData.metal = '24K Gold';
                else if (/Rose\s*Gold/i.test(specsText)) updateData.metal = 'Rose Gold';
                else if (/White\s*Gold/i.test(specsText)) updateData.metal = '18K White Gold';
                else if (/Platinum/i.test(specsText)) updateData.metal = 'Platinum';
            }
            if (!updateData.gem) {
                if (/Emerald/i.test(specsText)) updateData.gem = 'Emerald';
                else if (/Sapphire/i.test(specsText)) updateData.gem = 'Sapphire';
                else if (/Ruby/i.test(specsText)) updateData.gem = 'Ruby';
                else if (/Pearl/i.test(specsText)) updateData.gem = 'Pearl';
            }
        }

        let product = await findProductByIdOrCustomId(req.params.id);

        if (!product) {
            return next(new ApiError(404, `Product not found with id ${req.params.id}`));
        }

        product = await Product.findByIdAndUpdate(product._id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json(
            new ApiResponse(200, { product }, 'Product updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await findProductByIdOrCustomId(req.params.id);

        if (!product) {
            return next(new ApiError(404, `Product not found with id ${req.params.id}`));
        }

        await Product.findByIdAndDelete(product._id);

        res.status(200).json(
            new ApiResponse(200, {}, 'Product deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};
