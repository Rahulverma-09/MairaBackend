const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    storeName: {
        type: String,
        default: 'Maira Jewels'
    },
    tagline: {
        type: String,
        default: 'Timeless Elegance & High Fine Jewellery'
    },
    email: {
        type: String,
        default: 'mairajewels.za@gmail.com'
    },
    phone: {
        type: String,
        default: '083 922 8383'
    },
    address: {
        type: String,
        default: 'Sandton City / Hyde Park, Johannesburg, South Africa'
    },
    hours: {
        type: String,
        default: 'Mon – Sat: 09:00 – 18:00 | Sun: 10:00 – 15:00'
    },
    currency: {
        type: String,
        default: 'ZAR'
    },
    currencySymbol: {
        type: String,
        default: 'R'
    },
    socialLinks: {
        instagram: { type: String, default: 'https://instagram.com/mairajewels' },
        facebook: { type: String, default: 'https://facebook.com/mairajewels' },
        pinterest: { type: String, default: 'https://pinterest.com/mairajewels' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', SettingSchema);
