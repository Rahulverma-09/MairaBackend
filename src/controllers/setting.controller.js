const Setting = require('../models/Setting.model');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get store settings / contact info
// @route   GET /api/v1/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create({
                storeName: 'Maira Jewels',
                address: 'Sandton City / Hyde Park, Johannesburg, South Africa',
                phone: '083 922 8383',
                email: 'mairajewels.za@gmail.com',
                hours: 'Mon – Sat: 09:00 – 18:00 | Sun: 10:00 – 15:00'
            });
        }

        res.status(200).json(
            new ApiResponse(200, { settings }, 'Store settings retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update store settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
    try {
        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            settings = await Setting.findByIdAndUpdate(settings._id, req.body, {
                new: true,
                runValidators: true
            });
        }

        res.status(200).json(
            new ApiResponse(200, { settings }, 'Store settings updated successfully')
        );
    } catch (error) {
        next(error);
    }
};
