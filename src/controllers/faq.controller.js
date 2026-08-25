const FAQ = require('../models/FAQ.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

// Helper to find FAQ by _id or customId
const findFaqByIdOrCustomId = async (id) => {
    if (!id) return null;
    let faq = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        faq = await FAQ.findById(id);
    }
    if (!faq) {
        faq = await FAQ.findOne({
            $or: [{ customId: id }, { customId: id.toUpperCase() }]
        });
    }
    return faq;
};

// @desc    Get all FAQs
// @route   GET /api/v1/faqs
// @access  Public
exports.getFaqs = async (req, res, next) => {
    try {
        const { category, status, search } = req.query;

        let query = {};
        if (category && category !== 'All' && category !== 'all') {
            query.category = category;
        }
        if (status && status !== 'All' && status !== 'all') {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { question: { $regex: search, $options: 'i' } },
                { answer: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const faqs = await FAQ.find(query)
            .sort({ order: 1, _id: 1 }) // _id as tiebreaker keeps sort partially indexed
            .allowDiskUse(true); // Prevents MongoDB 32MB in-memory sort limit

        const formattedFaqs = faqs.map(f => ({
            ...f.toObject(),
            id: f.customId || f._id,
            isApproved: f.isApproved !== undefined ? f.isApproved : (f.status === 'approved' || f.status === 'active')
        }));

        res.status(200).json(
            new ApiResponse(200, { count: formattedFaqs.length, faqs: formattedFaqs }, 'FAQs retrieved')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Create FAQ
// @route   POST /api/v1/faqs
// @access  Private/Admin
exports.createFaq = async (req, res, next) => {
    try {
        const { id, customId, question, answer, category, status, isApproved, order } = req.body;

        if (!question || !answer) {
            return next(new ApiError(400, 'Please provide question and answer'));
        }

        const resolvedStatus = status || (isApproved ? 'approved' : 'pending');

        const faq = await FAQ.create({
            customId: customId || id,
            question,
            answer,
            category: category || 'General',
            status: resolvedStatus,
            isApproved: isApproved !== undefined ? isApproved : (resolvedStatus === 'approved' || resolvedStatus === 'active'),
            order: order || 0
        });

        res.status(201).json(
            new ApiResponse(201, { faq }, 'FAQ created successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Update FAQ
// @route   PUT /api/v1/faqs/:id
// @access  Private/Admin
exports.updateFaq = async (req, res, next) => {
    try {
        const faq = await findFaqByIdOrCustomId(req.params.id);

        if (!faq) {
            return next(new ApiError(404, `FAQ not found with id ${req.params.id}`));
        }

        let updateData = { ...req.body };
        if (updateData.status) {
            updateData.isApproved = (updateData.status === 'approved' || updateData.status === 'active');
        }

        const updated = await FAQ.findByIdAndUpdate(faq._id, updateData, {
            new: true,
            runValidators: true
        });

        res.status(200).json(
            new ApiResponse(200, { faq: updated }, 'FAQ updated successfully')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Reply to and approve FAQ
// @route   PATCH /api/v1/faqs/:id/reply
// @access  Private/Admin
exports.replyFaq = async (req, res, next) => {
    try {
        const { answer, status, isApproved } = req.body;

        const faq = await findFaqByIdOrCustomId(req.params.id);

        if (!faq) {
            return next(new ApiError(404, `FAQ not found with id ${req.params.id}`));
        }

        const resolvedStatus = status || (isApproved ? 'approved' : 'pending');

        const updated = await FAQ.findByIdAndUpdate(
            faq._id,
            {
                answer: answer || faq.answer,
                status: resolvedStatus,
                isApproved: isApproved !== undefined ? isApproved : true
            },
            { new: true, runValidators: true }
        );

        res.status(200).json(
            new ApiResponse(200, { faq: updated }, 'FAQ reply published')
        );
    } catch (error) {
        next(error);
    }
};

// @desc    Delete FAQ
// @route   DELETE /api/v1/faqs/:id
// @access  Private/Admin
exports.deleteFaq = async (req, res, next) => {
    try {
        const faq = await findFaqByIdOrCustomId(req.params.id);

        if (!faq) {
            return next(new ApiError(404, `FAQ not found with id ${req.params.id}`));
        }

        await FAQ.findByIdAndDelete(faq._id);

        res.status(200).json(
            new ApiResponse(200, {}, 'FAQ deleted successfully')
        );
    } catch (error) {
        next(error);
    }
};

