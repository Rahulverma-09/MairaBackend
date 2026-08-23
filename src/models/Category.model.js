const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    customId: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isActive: {
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

CategorySchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (!this.customId && this.name) {
        const clean = this.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = clean.length >= 3 ? clean.substring(0, 3) : (clean + 'CAT').substring(0, 3);
        const randNum = Math.floor(100 + Math.random() * 900);
        this.customId = `CAT-${prefix}-${randNum}`;
    }
});

CategorySchema.index({ customId: 1 });

module.exports = mongoose.model('Category', CategorySchema);
