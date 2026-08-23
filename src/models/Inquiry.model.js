const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    customId: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    subject: {
        type: String,
        trim: true,
        default: 'General Inquiry'
    },
    message: {
        type: String,
        required: [true, 'Please provide your message'],
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'unread', 'read', 'replied'],
        default: 'new'
    },
    replyNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

InquirySchema.pre('save', function () {
    if (!this.customId && this.name) {
        const rand = Math.floor(100 + Math.random() * 900);
        this.customId = `INQ-${rand}`;
    }
});

InquirySchema.index({ customId: 1 });
InquirySchema.index({ status: 1 });
InquirySchema.index({ email: 1 });

module.exports = mongoose.model('Inquiry', InquirySchema);
