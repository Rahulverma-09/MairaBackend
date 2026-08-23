const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    id: { type: String }, // Legacy item id support (e.g. item-1)
    name: { type: String, required: true },
    price: { type: String, required: true },
    priceNum: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    image: { type: String, default: '' },
    specs: { type: String, default: '' }
});

const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customer: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, default: '' }
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, default: 'Gauteng' },
        postalCode: { type: String, required: true },
        country: { type: String, default: 'South Africa' },
        deliveryMethod: { type: String, default: 'Courier Guy (3-4 Days)' }
    },
    items: [OrderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Instant EFT', 'PayFlex', 'Cash on Delivery'],
        default: 'Credit Card'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
        default: 'Paid'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Processing'
    },
    trackingNumber: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for order lookup and filtering
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
