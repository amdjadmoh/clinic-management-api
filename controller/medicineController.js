const Medicine = require('../models/Medicine');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

// Get all medicines
exports.getAllMedicines = catchAsync(async (req, res, next) => {
    const medicines = await Medicine.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            medicines,
        },
    });
});

// Get a single medicine by ID
exports.getMedicine = catchAsync(async (req, res, next) => {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) {
        return next(new AppError('Medicine not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            medicine,
        },
    });
});

// Create a new medicine
exports.createMedicine = catchAsync(async (req, res, next) => {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            medicine,
        },
    });
});

// Update a medicine by ID
exports.updateMedicine = catchAsync(async (req, res, next) => {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) {
        return next(new AppError('Medicine not found', 404));
    }
    await medicine.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            medicine,
        },
    });
});

// Delete a medicine by ID
exports.deleteMedicine = catchAsync(async (req, res, next) => {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) {
        return next(new AppError('Medicine not found', 404));
    }
    await medicine.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.searchMedicine = catchAsync(async (req, res, next) => {
    const medicines = await Medicine.findAll({
        where: {
            medicineComName: { [Op.iLike]: `%${req.query.name}%`, },
    }});
    res.status(200).json({
        status: 'success',
        data: {
            medicines,
        },
    });
}
);