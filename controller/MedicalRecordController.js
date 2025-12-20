const MedicalRecord = require('../models/MedicalRecord');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {Doctors} = require('../models/Doctors');

// Get all medical records
exports.getAllMedicalRecords = catchAsync(async (req, res, next) => {
    const medicalRecords = await MedicalRecord.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            medicalRecords,
        },
    });
});

// Get a single medical record by ID
exports.getMedicalRecord = catchAsync(async (req, res, next) => {
    const medicalRecord = await MedicalRecord.findByPk(req.params.id);
    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            medicalRecord,
        },
    });
});

// Create a new medical record
exports.createMedicalRecord = catchAsync(async (req, res, next) => {
    const doctor = await Doctors.findByPk(req.body.doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }
    req.body={...req.body,doctorName:doctor.name,specialty:doctor.specialty};
    const medicalRecord = await MedicalRecord.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            medicalRecord,
        },
    });
});

// Update a medical record by ID
exports.updateMedicalRecord = catchAsync(async (req, res, next) => {
    const medicalRecord = await MedicalRecord.findByPk(req.params.id);
    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404));
    }
    await medicalRecord.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            medicalRecord,
        },
    });
});

// Delete a medical record by ID
exports.deleteMedicalRecord = catchAsync(async (req, res, next) => {
    const medicalRecord = await MedicalRecord.findByPk(req.params.id);
    if (!medicalRecord) {
        return next(new AppError('Medical record not found', 404));
    }
    await medicalRecord.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

// Get all medical records of a patient
exports.getMedicalRecordByPatient = catchAsync(async (req, res, next) => {
    const medicalRecords = await MedicalRecord.findAll({
        where: {
            patientID: req.params.id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
            medicalRecords,
        },
    });
});

exports.getMedicalRecordByPatientAndStatus = catchAsync(async (req, res, next) => {
    const medicalRecords = await MedicalRecord.findAll({
        where: {
            patientID: req.params.id,
            status: req.params.status,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
            medicalRecords,
        },
    });
});
