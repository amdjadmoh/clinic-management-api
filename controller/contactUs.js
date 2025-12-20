const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ContactMessage = require('../models/ContactMessage'); // Adjust the path as needed

exports.contactUs = catchAsync(async (req, res, next) => {
    const { name, email, phone, message } = req.body;
    
    if (!name || !email || !phone || !message) {
        return next(new AppError('Please provide name, email, phone, and message', 400));
    }

    // Save the contact message to the database
    const newMessage = await ContactMessage.create({
        name,
        email,
        phone,
        message
    });

    res.status(200).json({
        status: 'success',
        message: 'Your message has been received successfully!',
        data: newMessage
    });
});

exports.setRead = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
        return next(new AppError('Message not found', 404));
    }

    message.read = true;
    await message.save();

    res.status(200).json({
        status: 'success',
        message: 'Message has been marked as read'
    });
});

exports.getAllMessages = catchAsync(async (req, res, next) => {
    const messages = await ContactMessage.findAll();

    res.status(200).json({
        status: 'success',
        data: {
            messages
        }
    });
});

exports.getMessage = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
        return next(new AppError('Message not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            message
        }
    });
});

exports.deleteMessage = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
        return next(new AppError('Message not found', 404));
    }

    await message.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getUnreadMessages = catchAsync(async (req, res, next) => {
    const messages = await ContactMessage.findAll({
        where: {
            read: false
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            messages
        }
    });
});



