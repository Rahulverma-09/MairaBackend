const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

// @desc    Upload single file
// @route   POST /api/v1/upload/single
// @access  Private/Admin
exports.uploadSingle = (req, res, next) => {
    if (!req.file) {
        return next(new ApiError(400, 'Please upload a valid image file'));
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json(
        new ApiResponse(200, {
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            url: fileUrl,
            size: req.file.size
        }, 'Image uploaded successfully')
    );
};

// @desc    Upload multiple files (gallery)
// @route   POST /api/v1/upload/multiple
// @access  Private/Admin
exports.uploadMultiple = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new ApiError(400, 'Please select images to upload'));
    }

    const host = req.get('host');
    const protocol = req.protocol;

    const filesData = req.files.map(file => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        url: `${protocol}://${host}/uploads/${file.filename}`,
        size: file.size
    }));

    res.status(200).json(
        new ApiResponse(200, {
            count: filesData.length,
            files: filesData
        }, 'Images uploaded successfully')
    );
};
