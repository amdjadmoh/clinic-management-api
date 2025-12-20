const db = require('../config/database');
const sequelize = require('sequelize');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { ChronicDisease, Patient } = require('../models/PatientChronicDiseases');

exports.getAllChronicDiseases = catchAsync(async (req, res, next) => {
    const chronicDiseases = await ChronicDisease.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            chronicDiseases
        }
    });
}
);

exports.getChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findByPk(req.params.id);
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            chronicDisease
        }
    });
}
);

exports.createChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            chronicDisease
        }
    });
}
);

exports.updateChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findByPk(req.params.id);
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that ID', 404));
    }
    await chronicDisease.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            chronicDisease
        }
    });
}
);

exports.deleteChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findByPk(req.params.id);
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that ID', 404));
    }
    await chronicDisease.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);

exports.searchChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findAll({
        where: {
            diseaseName: {
                [sequelize.Op.iLike]: `%${req.query.diseaseName}%`
            }
        }
    });
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that name', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            chronicDisease
        }
    });
}
);

exports.assignChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findByPk(req.params.id);
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that ID', 404));
    }
    await chronicDisease.addPatients(req.body.patientID);
    res.status(200).json({
        status: 'success',
        data: {
            chronicDisease
        }
    });
}
);

exports.unassignChronicDisease = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findByPk(req.params.id);
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that ID', 404));
    }
    await chronicDisease.removePatients(req.body.patientID);
    res.status(200).json({
        status: 'success'
    });
}
);

exports.getPatients = catchAsync(async (req, res, next) => {
    const chronicDisease = await ChronicDisease.findByPk(req.params.id);
    if (!chronicDisease) {
        return next(new AppError('No chronic disease found with that ID', 404));
    }
    const patients = await chronicDisease.getPatients();
    res.status(200).json({
        status: 'success',
        data: {
            patients
        }
    });
}
);

exports.getPatientChronicDiseases = catchAsync(async (req, res, next) => {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
        return next(new AppError('No patient found with that ID', 404));
    }
    const chronicDisease = await patient.getChronicdiseases();
    res.status(200).json({
        status: 'success',
        data: {
            chronicDisease
        }
    });
}
);