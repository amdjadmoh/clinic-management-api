const Record= require('../models/Record');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {Doctors} = require('../models/Doctors');
const Patient = require('../models/Patient');

// Get All records
exports.getAllRecords = catchAsync(async (req, res, next) => {
    const records = await Record.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            records,
        },
    });
});

// Get a single record by ID
exports.getRecord = catchAsync(async (req, res, next) => {
    const record = await Record.findByPk(req.params.id);
    if (!record) {
        return next(new AppError('Record not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            record,
        },
    });
});

// Create a new record
exports.createRecord = catchAsync(async (req, res, next) => {
    const doctor = await Doctors.findByPk(req.body.doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }
    const patient = await Patient.findByPk(req.body.patientID);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }
    req.body={...req.body,doctorName:doctor.name,specialty:doctor.specialty,patientName:patient.name};
    const record = await Record.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            record,
        },
    });
});

// Update a record by ID
exports.updateRecord = catchAsync(async (req, res, next) => {
    const record = await Record.findByPk(req.params.id);
    if (!record) {
        return next(new AppError('Record not found', 404));
    }
    await record.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            record,
        },
    });
});

// Delete a record by ID
exports.deleteRecord = catchAsync(async (req, res, next) => {
    const record = await Record.findByPk(req.params.id);
    if (!record) {
        return next(new AppError('Record not found', 404));
    }
    await record.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

// Get all records of a patient
exports.getRecordByPatient = catchAsync(async (req, res, next) => {
    const records = await Record.findAll({
        where: {
            patientID: req.params.id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
            records,
        },
    });
});
