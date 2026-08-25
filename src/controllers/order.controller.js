const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const Product = require('../models/Product.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Helper to locate product for an order item
const findProductForItem = async (item) => {
    if (!item) return null;
    const targetId = item.product || item.productId || item.id || item._id;
    if (targetId && typeof targetId === 'string' && targetId.match(/^[0-9a-fA-F]{24}$/)) {
        const prod = await Product.findById(targetId);
        if (prod) return prod;
    }
    if (targetId) {
        const prod = await Product.findOne({ customId: targetId.toString().toUpperCase() });
        if (prod) return prod;
    }
    if (item.name) {
        const prod = await Product.findOne({ name: { $regex: new RegExp(`^${item.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        if (prod) return prod;
    }
    return null;
};

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MJ-${timestamp}-${random}`;
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Public / Protected (Optional token)
exports.createOrder = async (req, res, next) => {
    try {
        const {
            customer,
            shippingAddress,
            items,
            subtotal,
            shippingFee = 0,
            discount = 0,
            totalAmount,
            paymentMethod = 'Credit Card',
            notes
        } = req.body;

        if (!items || items.length === 0) {
            return next(new ApiError(400, 'Cannot place order with empty items'));
        }

        if (!customer || !customer.name || !customer.email) {
            return next(new ApiError(400, 'Customer name and email are required'));
        }

        if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
            return next(new ApiError(400, 'Valid shipping address is required'));
        }

        // 1. Validate stock availability for all items before placing order
        const productsToDeduct = [];
        for (const item of items) {
            const qtyNeeded = Math.max(1, Number(item.quantity) || 1);
            const product = await findProductForItem(item);

            if (product) {
                const currentStock = product.stock !== undefined
                    ? Number(product.stock)
                    : (product.countInStock !== undefined
                        ? Number(product.countInStock)
                        : (product.stockQty !== undefined ? Number(product.stockQty) : 0));

                if (currentStock < qtyNeeded) {
                    return next(
                        new ApiError(
                            400,
                            `Insufficient stock for "${product.name}". Required: ${qtyNeeded}, Available: ${currentStock}`
                        )
                    );
                }

                productsToDeduct.push({ product, qtyNeeded, currentStock });
            }
        }

        const orderNumber = generateOrderNumber();

        const order = await Order.create({
            orderNumber,
            user: req.user ? req.user.id : null,
            customer,
            shippingAddress,
            items,
            subtotal: Number(subtotal) || items.reduce((acc, i) => acc + (i.priceNum * i.quantity), 0),
            shippingFee: Number(shippingFee),
            discount: Number(discount),
            totalAmount: Number(totalAmount) || (Number(subtotal) + Number(shippingFee) - Number(discount)),
            paymentMethod,
            paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
            orderStatus: 'Processing',
            notes: notes || ''
        });

        // 2. Accurately deduct stock from inventory
        for (const { product, qtyNeeded, currentStock } of productsToDeduct) {
            const newStock = Math.max(0, currentStock - qtyNeeded);
            await Product.findByIdAndUpdate(product._id, {
                stock: newStock,
                countInStock: newStock,
                stockQty: newStock,
                inStock: newStock > 0
            });
        }

        // Automatically generate payment record
        await Payment.create({
            transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            order: order._id,
            orderNumber: order.orderNumber,
            customerName: customer.name,
            customerEmail: customer.email,
            amount: order.totalAmount,
            currency: 'ZAR',
            method: paymentMethod,
            status: order.paymentStatus
        });

        res.status(201).json(
            new ApiResponse(201, { order }, 'Order placed successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get current user orders
// @route   GET /api/v1/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            $or: [
                { user: req.user.id },
                { 'customer.email': req.user.email }
            ]
        })
        .sort('-_id') // _id is always indexed — avoids 32MB in-memory sort limit
        .allowDiskUse(true); // belt-and-suspenders fallback

        res.status(200).json(
            new ApiResponse(200, { count: orders.length, orders }, 'My orders retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders (Admin)
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
    try {
        const { status, paymentStatus, search, page = 1, limit = 50 } = req.query;

        let query = {};

        if (status && status !== 'All') {
            query.orderStatus = status;
        }

        if (paymentStatus && paymentStatus !== 'All') {
            query.paymentStatus = paymentStatus;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .sort('-_id') // _id is always indexed — avoids 32MB in-memory sort limit
            .skip(skip)
            .limit(limitNum)
            .allowDiskUse(true); // Prevents MongoDB sort memory crash for any field-based sort

        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            id: order.orderNumber || order._id,
            total: order.totalAmount,
            status: (order.orderStatus || 'processing').toLowerCase(),
            date: order.createdAt
        }));

        res.status(200).json(
            new ApiResponse(200, {
                total,
                count: formattedOrders.length,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                orders: formattedOrders
            }, 'Orders retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// Helper to find order by _id or orderNumber
const findOrderByIdOrNumber = async (id) => {
    if (!id) return null;
    let order = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(id);
    }
    if (!order) {
        order = await Order.findOne({
            $or: [{ orderNumber: id }, { orderNumber: id.toUpperCase() }]
        });
    }
    return order;
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await findOrderByIdOrNumber(req.params.id);

        if (!order) {
            return next(new ApiError(404, `Order not found with id ${req.params.id}`));
        }

        // Authorize check if regular customer is trying to see someone else's order
        if (req.user && req.user.role === 'customer' && order.user && order.user.toString() !== req.user.id && order.customer.email !== req.user.email) {
            return next(new ApiError(403, 'Unauthorized to view this order'));
        }

        res.status(200).json(
            new ApiResponse(200, { order }, 'Order retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Admin)
// @route   PATCH /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, status, trackingNumber, paymentStatus } = req.body;

        const resolvedStatus = orderStatus || status;
        const updateData = {};
        if (resolvedStatus) updateData.orderStatus = resolvedStatus;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        let order = await findOrderByIdOrNumber(req.params.id);

        if (!order) {
            return next(new ApiError(404, `Order not found with id ${req.params.id}`));
        }

        // If order is being cancelled, restore stock to products
        if (resolvedStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
            for (const item of order.items) {
                const qtyToRestore = Math.max(1, Number(item.quantity) || 1);
                const product = await findProductForItem(item);
                if (product) {
                    const currentStock = product.stock !== undefined
                        ? Number(product.stock)
                        : (product.countInStock !== undefined
                            ? Number(product.countInStock)
                            : (product.stockQty !== undefined ? Number(product.stockQty) : 0));
                    const newStock = currentStock + qtyToRestore;
                    await Product.findByIdAndUpdate(product._id, {
                        stock: newStock,
                        countInStock: newStock,
                        stockQty: newStock,
                        inStock: newStock > 0
                    });
                }
            }
        }

        order = await Order.findByIdAndUpdate(order._id, updateData, {
            new: true,
            runValidators: true
        });

        // Keep payment record synced if paymentStatus changed
        if (paymentStatus) {
            await Payment.updateMany({ orderNumber: order.orderNumber }, { status: paymentStatus });
        }

        res.status(200).json(
            new ApiResponse(200, { order }, 'Order status updated')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order (Admin)
// @route   DELETE /api/v1/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res, next) => {
    try {
        const order = await findOrderByIdOrNumber(req.params.id);

        if (!order) {
            return next(new ApiError(404, `Order not found with id ${req.params.id}`));
        }

        await Order.findByIdAndDelete(order._id);

        res.status(200).json(
            new ApiResponse(200, {}, 'Order deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

