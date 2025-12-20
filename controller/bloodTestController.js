const BloodTest = require('../models/BloodTest');
const Patient = require('../models/Patient');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const { Op } = require('sequelize');

// Get all blood tests
exports.getAllBloodTests = catchAsync(async (req, res) => {
    const bloodTests = await BloodTest.findAll({
        include: [{
            model: Patient,
            attributes: ['name', 'birthdate', 'phone1']
        }]
    });

    res.status(200).json({
        status: 'success',
        results: bloodTests.length,
        data: {
            bloodTests
        }
    });
});

// Get a single blood test by ID
exports.getBloodTest = catchAsync(async (req, res, next) => {
    const bloodTest = await BloodTest.findByPk(req.params.id, {
        include: [{
            model: Patient,
            attributes: ['name', 'birthdate', 'phone1', 'address', 'gender']
        }]
    });

    if (!bloodTest) {
        return next(new appError('No blood test found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            bloodTest
        }
    });
});

// Create a new blood test
exports.createBloodTest = catchAsync(async (req, res) => {
    const newBloodTest = await BloodTest.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            bloodTest: newBloodTest
        }
    });
});

// Update a blood test
exports.updateBloodTest = catchAsync(async (req, res, next) => {
    const bloodTest = await BloodTest.findByPk(req.params.id);

    if (!bloodTest) {
        return next(new appError('No blood test found with that ID', 404));
    }

    await bloodTest.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            bloodTest
        }
    });
});

// Delete a blood test
exports.deleteBloodTest = catchAsync(async (req, res, next) => {
    const bloodTest = await BloodTest.findByPk(req.params.id);

    if (!bloodTest) {
        return next(new appError('No blood test found with that ID', 404));
    }

    await bloodTest.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get all blood tests for a specific patient
exports.getPatientBloodTests = catchAsync(async (req, res) => {
    const bloodTests = await BloodTest.findAll({
        where: {
            patientId: req.params.patientId
        },
        include: [{
            model: Patient,
            attributes: ['name', 'birthdate', 'phone1']
        }]
    });

    res.status(200).json({
        status: 'success',
        results: bloodTests.length,
        data: {
            bloodTests
        }
    });
});

// Get pending blood tests
exports.getPendingBloodTests = catchAsync(async (req, res) => {
    const bloodTests = await BloodTest.findAll({
        where: {
            testStatus: 'pending'
        },
        include: [{
            model: Patient,
            attributes: ['name', 'birthdate', 'phone1']
        }]
    });

    res.status(200).json({
        status: 'success',
        results: bloodTests.length,
        data: {
            bloodTests
        }
    });
});

// Update blood test status to completed and add results
exports.completeBloodTest = catchAsync(async (req, res, next) => {
    const bloodTest = await BloodTest.findByPk(req.params.id);

    if (!bloodTest) {
        return next(new appError('No blood test found with that ID', 404));
    }

    // Update status and add test result
    await bloodTest.update({
        testStatus: 'completed',
        testResult: req.body.testResult
    });

    res.status(200).json({
        status: 'success',
        data: {
            bloodTest
        }
    });
});

// Cancel blood test
exports.cancelBloodTest = catchAsync(async (req, res, next) => {
    const bloodTest = await BloodTest.findByPk(req.params.id);

    if (!bloodTest) {
        return next(new appError('No blood test found with that ID', 404));
    }

    await bloodTest.update({
        testStatus: 'cancelled'
    });

    res.status(200).json({
        status: 'success',
        data: {
            bloodTest
        }
    });
});

// Get blood tests by date range
exports.getBloodTestsByDateRange = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
        return next(new appError('Please provide start and end dates', 400));
    }

    const bloodTests = await BloodTest.findAll({
        where: {
            testDate: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        },
        include: [{
            model: Patient,
            attributes: ['name', 'birthdate', 'phone1']
        }]
    });

    res.status(200).json({
        status: 'success',
        results: bloodTests.length,
        data: {
            bloodTests
        }
    });
});
