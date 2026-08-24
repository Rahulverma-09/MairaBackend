require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User.model');
const Category = require('../models/Category.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');
const Payment = require('../models/Payment.model');
const FAQ = require('../models/FAQ.model');
const Setting = require('../models/Setting.model');
const Inquiry = require('../models/Inquiry.model');

const seedCategories = [
    { name: 'Rings', description: 'Elegant rings crafted with precision and luxury.', order: 1 },
    { name: 'Earrings', description: 'Statement earrings for every occasion.', order: 2 },
    { name: 'Necklaces', description: 'Timeless necklaces and pendants.', order: 3 },
    { name: 'Bracelets', description: 'Refined bracelets and bangles.', order: 4 }
];

const seedProducts = [
    {
        name: 'Eternal Solitaire Ring', category: 'Rings', price: 'R 2,450.00', priceNum: 2450,
        metal: '18K White Gold', gem: 'Diamond', specs: '18K White Gold • 1.5 Carat Diamond', badge: 'NEW',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 15,
        featured: true,
        description: 'A timeless solitaire ring featuring an ethically sourced 1.5 carat round brilliant cut diamond.'
    },
    {
        name: 'Aurelia Gold Band', category: 'Rings', price: 'R 1,890.00', priceNum: 1890,
        metal: '24K Gold', gem: 'Diamond', specs: '24K Pure Gold • Solitaire Diamond Accent', badge: '',
        image: 'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 8,
        description: 'Impeccably hammered 24K solid gold band, understated elegance designed for everyday luxury.'
    },
    {
        name: 'Rosée Promise Ring', category: 'Rings', price: 'R 3,200.00', priceNum: 3200,
        metal: 'Rose Gold', gem: 'Diamond', specs: 'Rose Gold • Pink Diamond Halo', badge: 'BESTSELLER',
        image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 5,
        featured: true,
        description: 'Handcrafted rose gold engagement ring wrapped in a delicate pink diamond halo.'
    },
    {
        name: 'Emerald Royal Ring', category: 'Rings', price: 'R 1,133.00', priceNum: 1133,
        metal: '18K Gold', gem: 'Emerald', specs: '18K Yellow Gold • Royal Emerald Cut', badge: '',
        image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 12
    },
    {
        name: 'Sunburst Fan Earrings', category: 'Earrings', price: 'R 448.00', priceNum: 448,
        metal: '18K Gold', gem: 'Diamond', specs: '18K Yellow Gold • 11.2gm Diamond Drops', badge: 'NEW',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 20
    },
    {
        name: 'Tree Of Life Drops', category: 'Earrings', price: 'R 333.00', priceNum: 333,
        metal: '18K Gold', gem: 'Diamond', specs: '18K Gold • 7.2gm Filigree', badge: '',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 18
    },
    {
        name: 'Golden Crescent Moons', category: 'Earrings', price: 'R 558.00', priceNum: 558,
        metal: '18K Gold', gem: 'Diamond', specs: '18K Gold • Celestial Diamond Inlay', badge: '',
        image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 14
    },
    {
        name: 'Sapphire Heirloom Ring', category: 'Rings', price: 'R 5,400.00', priceNum: 5400,
        metal: '18K Gold', gem: 'Sapphire', specs: '18K Gold • Ceylon Royal Sapphire', badge: 'LIMITED',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
        thumbs: [
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80'
        ],
        stockQty: 3,
        featured: true
    }
];

const seedFaqs = [
    {
        question: 'Are your gemstones natural and certified?',
        answer: 'All our diamonds and precious gemstones come certified by GIA, IGI, or equivalent international gemological authorities with complete provenance.',
        category: 'Product Care',
        status: 'active',
        order: 1
    },
    {
        question: 'What is your bespoke / custom design process?',
        answer: 'We offer bespoke jewellery services starting from initial hand sketches and 3D CAD renders to personal casting in pure gold or platinum.',
        category: 'General',
        status: 'active',
        order: 2
    },
    {
        question: 'How should I care for my fine jewellery?',
        answer: 'Keep your jewellery away from perfume, lotion, water, sweat, chemicals, and cleaners. Store in a dry place and handle with care.',
        category: 'Product Care',
        status: 'active',
        order: 3
    },
    {
        question: 'Are your pieces waterproof and tarnish-free?',
        answer: 'Yes! All our pieces are 18K Plated and 316L Premium Steel, meaning they are completely Tarnish Free, Hypoallergenic, and Waterproof.',
        category: 'Product Care',
        status: 'active',
        order: 4
    },
    {
        question: 'How long does delivery take?',
        answer: 'We use Courier Guy for delivery, which takes 3–4 working days. Locker deliveries also take 4–5 working days to reach the selected locker.',
        category: 'Shipping & Delivery',
        status: 'active',
        order: 5
    }
];

const seedData = async () => {
    try {
        await connectDB();

        console.log('[Seeder] Clearing old collections...');
        await Promise.all([
            User.deleteMany(),
            Category.deleteMany(),
            Product.deleteMany(),
            FAQ.deleteMany(),
            Setting.deleteMany(),
            Inquiry.deleteMany()
        ]);

        console.log('[Seeder] Creating Admin Account...');
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@mirajewels.com',
            password: 'admin123',
            role: 'admin',
            phone: '083 922 8383',
            avatar: 'A'
        });

        console.log('[Seeder] Creating Demo Customer Account...');
        await User.create({
            name: 'Maira Khan',
            email: 'client@example.com',
            password: 'password123',
            role: 'customer',
            phone: '082 123 4567'
        });

        console.log('[Seeder] Seeding Categories...');
        await Category.insertMany(seedCategories);

        console.log('[Seeder] Seeding Products...');
        await Product.insertMany(seedProducts);

        console.log('[Seeder] Seeding FAQs...');
        await FAQ.insertMany(seedFaqs);

        console.log('[Seeder] Seeding Store Settings...');
        await Setting.create({
            storeName: 'Maira Jewels',
            tagline: 'Timeless Elegance & High Fine Jewellery',
            email: 'mairajewels.za@gmail.com',
            phone: '083 922 8383',
            address: 'Sandton City / Hyde Park, Johannesburg, South Africa',
            hours: 'Mon – Sat: 09:00 – 18:00 | Sun: 10:00 – 15:00',
            currency: 'ZAR',
            currencySymbol: 'R'
        });

        console.log('✅ Database successfully seeded with Maira Jewels catalog and credentials!');
        process.exit(0);
    } catch (error) {
        console.error(`[Seeder Error]: ${error.message}`);
        process.exit(1);
    }
};

seedData();
