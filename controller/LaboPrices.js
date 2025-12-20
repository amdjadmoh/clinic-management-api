const LaboPrices = require('../models/LaboPrices');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

// Get all labo prices
exports.getAllLaboPrices = catchAsync(async (req, res) => {
    const laboPrices = await LaboPrices.findAll();
    
    res.status(200).json({
        status: 'success',
        data: {
        laboPrices
        }
    });
    }
);

// Get a single labo price by ID
exports.getLaboPrice = catchAsync(async (req, res, next) => {
    const laboPrice = await LaboPrices.findByPk(req.params.id);
    
    if (!laboPrice) {
        return next(new appError('No labo price found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            laboPrice
        }
    });
}
);

// update a labo price

exports.updateLaboPrice = catchAsync(async (req, res, next) => {
    const laboPrice = await LaboPrices.findByPk(req.params.id);
    
    if (!laboPrice) {
        return next(new appError('No labo price found with that ID', 404));
    }
    
    await laboPrice.update(req.body);
    
    res.status(200).json({
        status: 'success',
        data: {
            laboPrice
        }
    });
});

