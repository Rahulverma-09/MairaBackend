const Inquiry = require('../models/Inquiry.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Helper to find Inquiry by _id or customId
const findInquiryByIdOrCustomId = async (id) => {
    if (!id) return null;
    let inquiry = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        inquiry = await Inquiry.findById(id);
    }
    if (!inquiry) {
        inquiry = await Inquiry.findOne({
            $or: [{ customId: id }, { customId: id.toUpperCase() }]
        });
    }
    return inquiry;
};

// @desc    Submit contact message / inquiry
// @route   POST /api/v1/inquiries or /api/v1/contacts
// @access  Public
exports.createInquiry = async (req, res, next) => {
    try {
        const { id, customId, name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return next(new ApiError(400, 'Please provide name, email, and message'));
        }

        const inquiry = await Inquiry.create({
            customId: customId || id,
            name,
            email,
            phone: phone || '',
            subject: subject || 'General Inquiry',
            message,
            status: 'new'
        });

        res.status(201).json(
            new ApiResponse(201, {
                inquiry: {
                    ...inquiry.toObject(),
                    id: inquiry.customId || inquiry._id,
                    date: inquiry.createdAt
                }
            }, 'Your message has been sent to Maira Jewels concierge.')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Get all inquiries / contact messages
// @route   GET /api/v1/inquiries or /api/v1/contacts
// @access  Private/Admin
exports.getInquiries = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        let query = {};
        if (status && status !== 'All' && status !== 'all') {
            if (status === 'new' || status === 'unread') {
                query.status = { $in: ['new', 'unread'] };
            } else if (status === 'read' || status === 'replied') {
                query.status = { $in: ['read', 'replied'] };
            } else {
                query.status = status;
            }
        }
        if (search) {
            query.$or = [
                { customId: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const inquiries = await Inquiry.find(query).sort('-createdAt');

        const formattedInquiries = inquiries.map(inq => ({
            ...inq.toObject(),
            id: inq.customId || inq._id,
            date: inq.createdAt
        }));

        res.status(200).json(
            new ApiResponse(200, {
                count: formattedInquiries.length,
                messages: formattedInquiries,
                inquiries: formattedInquiries
            }, 'Inquiries retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update inquiry status or reply notes
// @route   PATCH /api/v1/inquiries/:id or /api/v1/contacts/:id/status
// @access  Private/Admin
exports.updateInquiry = async (req, res, next) => {
    try {
        const { status, replyNotes } = req.body;

        const inquiry = await findInquiryByIdOrCustomId(req.params.id);

        if (!inquiry) {
            return next(new ApiError(404, `Inquiry not found with id ${req.params.id}`));
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (replyNotes !== undefined) updateData.replyNotes = replyNotes;

        const updated = await Inquiry.findByIdAndUpdate(
            inquiry._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json(
            new ApiResponse(200, { inquiry: updated }, 'Inquiry updated')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete inquiry
// @route   DELETE /api/v1/inquiries/:id or /api/v1/contacts/:id
// @access  Private/Admin
exports.deleteInquiry = async (req, res, next) => {
    try {
        const inquiry = await findInquiryByIdOrCustomId(req.params.id);

        if (!inquiry) {
            return next(new ApiError(404, `Inquiry not found with id ${req.params.id}`));
        }

        await Inquiry.findByIdAndDelete(inquiry._id);

        res.status(200).json(
            new ApiResponse(200, {}, 'Inquiry deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};
