const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    orderNumber: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'ZAR'
    },
    method: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Instant EFT', 'PayFlex', 'Bank Transfer', 'Cash on Delivery'],
        default: 'Credit Card'
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed', 'Refunded'],
        default: 'Paid'
    },
    gatewayResponse: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

PaymentSchema.index({ orderNumber: 1 });
PaymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
