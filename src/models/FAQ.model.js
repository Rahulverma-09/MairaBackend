const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
    customId: {
        type: String,
        trim: true
    },
    question: {
        type: String,
        required: [true, 'Please provide FAQ question'],
        trim: true
    },
    answer: {
        type: String,
        required: [true, 'Please provide FAQ answer'],
        trim: true
    },
    category: {
        type: String,
        default: 'General',
        trim: true
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'active', 'inactive'],
        default: 'approved'
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

FAQSchema.pre('save', function () {
    if (!this.customId && this.question) {
        const rand = Math.floor(100 + Math.random() * 900);
        this.customId = `FAQ-${rand}`;
    }
    if (this.status === 'approved' || this.status === 'active') {
        this.isApproved = true;
    } else if (this.status === 'inactive' || this.status === 'pending') {
        this.isApproved = false;
    }
});

FAQSchema.index({ customId: 1 });
FAQSchema.index({ status: 1 });
FAQSchema.index({ category: 1 });

module.exports = mongoose.model('FAQ', FAQSchema);
