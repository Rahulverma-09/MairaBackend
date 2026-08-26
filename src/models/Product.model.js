const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    customId: {
        type: String,
        trim: true,
        uppercase: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a product title'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    category: {
        type: String,
        required: [true, 'Please assign a category'],
        trim: true
    },
    price: {
        type: String,
        default: 'R 0.00'
    },
    priceNum: {
        type: Number,
        required: [true, 'Please specify numeric price'],
        min: [0, 'Price must be greater than or equal to 0']
    },
    metal: {
        type: String,
        default: '18K Gold',
        trim: true
    },
    gem: {
        type: String,
        default: 'Diamond',
        trim: true
    },
    specs: {
        type: String,
        default: '',
        trim: true
    },
    color: {
        type: String,
        default: '',
        trim: true
    },
    sizes: {
        type: String,
        default: '',
        trim: true
    },
    badge: {
        type: String,
        default: '',
        trim: true
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
    },
    images: {
        type: [String],
        default: []
    },
    thumbs: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    inStock: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        default: 10,
        min: 0
    },
    countInStock: {
        type: Number,
        default: 10,
        min: 0
    },
    stockQty: {
        type: Number,
        default: 10,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 5.0,
        min: 1,
        max: 5
    },
    reviewsCount: {
        type: Number,
        default: 12
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Auto-generate customId if not provided (first 3 letters of name + 4 digit random number)
ProductSchema.pre('save', function() {
    if (!this.customId && this.name) {
        const clean = this.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const prefix = clean.length >= 3 ? clean.substring(0, 3) : (clean + 'PRD').substring(0, 3);
        const randNum = Math.floor(1000 + Math.random() * 9000);
        this.customId = `${prefix}-${randNum}`;
    }

    // Sync image arrays
    if (this.images && this.images.length > 0) {
        if (!this.image) this.image = this.images[0];
        if (!this.thumbs || this.thumbs.length === 0) this.thumbs = [...this.images];
    } else if (this.thumbs && this.thumbs.length > 0) {
        if (!this.image) this.image = this.thumbs[0];
        if (!this.images || this.images.length === 0) this.images = [...this.thumbs];
    } else if (this.image) {
        this.images = [this.image];
        this.thumbs = [this.image];
    }

    // Ensure formatted price
    if (!this.price && this.priceNum !== undefined) {
        this.price = `R ${Number(this.priceNum).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Sync stock fields (stock, countInStock, stockQty, inStock)
    const stockVal = this.stock !== undefined ? Number(this.stock) : (this.countInStock !== undefined ? Number(this.countInStock) : (this.stockQty !== undefined ? Number(this.stockQty) : 10));
    this.stock = stockVal;
    this.countInStock = stockVal;
    this.stockQty = stockVal;
    if (this.inStock === undefined) {
        this.inStock = stockVal > 0;
    }
});

// Virtual fields for colour and availableSizes aliases
ProductSchema.virtual('colour')
    .get(function() { return this.color; })
    .set(function(val) { this.color = val; });

ProductSchema.virtual('availableSizes')
    .get(function() { return this.sizes; })
    .set(function(val) { this.sizes = val; });

// Indexes for fast lookup & filtering
ProductSchema.index({ customId: 1 });
ProductSchema.index({ name: 'text', description: 'text', specs: 'text', color: 'text', sizes: 'text' });
ProductSchema.index({ category: 1, priceNum: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ badge: 1 });

module.exports = mongoose.model('Product', ProductSchema);
