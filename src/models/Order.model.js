const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    id: { type: String }, // Legacy item id support (e.g. item-1)
    name: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Mixed, required: true },
    priceNum: { type: Number },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: { type: String, default: '' },
    colour: { type: String, default: '' },
    size: { type: String, default: '' },
    sizes: { type: String, default: '' },
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
        phone: { type: String, default: '' },
        address: { type: String, default: '' }
    },
    shippingAddress: {
        street: { type: String, default: 'N/A' },
        city: { type: String, default: 'N/A' },
        province: { type: String, default: 'Gauteng' },
        postalCode: { type: String, default: '0000' },
        country: { type: String, default: 'South Africa' },
        deliveryMethod: { type: String, default: 'Standard Delivery' }
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
        default: 'Credit Card'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Refunded', 'paid', 'pending', 'failed', 'refunded'],
        default: 'Paid'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'],
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field aliases
OrderSchema.virtual('total')
    .get(function() { return this.totalAmount; })
    .set(function(v) { this.totalAmount = Number(v); });

OrderSchema.virtual('status')
    .get(function() { return (this.orderStatus || 'processing').toLowerCase(); })
    .set(function(v) { this.orderStatus = v; });

// Indexes for order lookup and filtering
OrderSchema.index({ 'customer.email': 1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
