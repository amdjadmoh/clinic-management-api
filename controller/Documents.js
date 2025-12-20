const { 
    Consent_certificate, 
    Birth_notice, 
    BirthDeclaration, 
    OperationCostDeclaration 
} = require('../models/Documents');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const { Op } = require('sequelize');

exports.createConsentCertificate = catchAsync(async (req, res) => {
    const newCertificate = await Consent_certificate.create({
        fullName: req.body.fullName,
        NIN: req.body.NIN,
        idReleaseDate: req.body.idReleaseDate,
        idReleasedFrom: req.body.idReleasedFrom,
        date: req.body.date,
        relationToPatient: req.body.relationToPatient,
        patientName: req.body.patientName,
        patientNIN: req.body.patientNIN,
        patientIdReleasedFrom: req.body.patientIdReleasedFrom,
        patientIdReleaseDate: req.body.patientIdReleaseDate
    });

    res.status(201).json({
        status: 'success',
        data: {
            certificate: newCertificate
        }
    });
});

exports.createBirthNotice = catchAsync(async (req, res) => {
    const newBirthNotice = await Birth_notice.create({
        DirectorfullName: req.body.DirectorfullName,
        mairieName: req.body.mairieName,
        mairieEtatCivil: req.body.mairieEtatCivil,
        date: req.body.date,
        hour: req.body.hour,
        sex: req.body.sex,
        childName: req.body.childName,
        fatherName: req.body.fatherName,
        fatherJob: req.body.fatherJob,
        fatherDateOfBirth: req.body.fatherDateOfBirth,
        fatherPlaceOfBirth: req.body.fatherPlaceOfBirth,
        MotherName: req.body.MotherName,
        MotherJob: req.body.MotherJob,
        MotherDateOfBirth: req.body.MotherDateOfBirth,
        MotherPlaceOfBirth: req.body.MotherPlaceOfBirth,
        address: req.body.address,
        dateOfMarriage: req.body.dateOfMarriage,
        StateInLaw: req.body.StateInLaw,
        firstMarriage: req.body.firstMarriage,
        childrenNumber: req.body.childrenNumber,
        nameInLatin: req.body.nameInLatin,
        childNIN: req.body.childNIN
    });

    res.status(201).json({
        status: 'success',
        data: {
            birthNotice: newBirthNotice
        }
    });
});

exports.createBirthDeclaration = catchAsync(async (req, res) => {
    const newBirthDeclaration = await BirthDeclaration.create({
        declarantName: req.body.declarantName,
        motherName: req.body.motherName,
        motherDateOfBirth: req.body.motherDateOfBirth,
        motherPlaceOfBirth: req.body.motherPlaceOfBirth,
        fatherFirstName: req.body.fatherFirstName,
        fatherLastName: req.body.fatherLastName,
        fatherPlaceOfBirth: req.body.fatherPlaceOfBirth,
        fatherDateOfBirth: req.body.fatherDateOfBirth,
        address: req.body.address,
        childBrithDate: req.body.childBrithDate,
        childBrithHour: req.body.childBrithHour,
        gender: req.body.gender,
        weightKg: req.body.weightKg,
        arabicName: req.body.arabicName,
        nom: req.body.nom,
        prenoms: req.body.prenoms
    });

    res.status(201).json({
        status: 'success',
        data: {
            birthDeclaration: newBirthDeclaration
        }
    });
});

exports.createOperationCostDeclaration = catchAsync(async (req, res) => {
    const newOperationCostDeclaration = await OperationCostDeclaration.create({
        patientName: req.body.patientName,
        patientNIN: req.body.patientNIN,
        patientIdReleaseDate: req.body.patientIdReleaseDate,
        patientIdReleasedFrom: req.body.patientIdReleasedFrom,
        date: req.body.date,
        delcaration: req.body.delcaration
    });

    res.status(201).json({
        status: 'success',
        data: {
            operationCostDeclaration: newOperationCostDeclaration
        }
    });
});

// Consent Certificate
exports.getAllConsentCertificatesByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const certificates = await Consent_certificate.findAll({
        where: {
            id: {
                [Op.like]: `${year}/%`
            }
        },
        order: [['id', 'ASC']]
    });

    res.status(200).json({
        status: 'success',
        results: certificates.length,
        data: {
            certificates
        }
    });
});

exports.getConsentCertificateById = catchAsync(async (req, res, next) => {
    const certificate = await Consent_certificate.findByPk(req.params.id);
    
    if (!certificate) {
        return next(new appError('No certificate found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            certificate
        }
    });
});

// Birth Notice
exports.getAllBirthNoticesByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const notices = await Birth_notice.findAll({
        where: {
            id: {
                [Op.like]: `${year}/%`
            }
        },
        order: [['id', 'ASC']]
    });

    res.status(200).json({
        status: 'success',
        results: notices.length,
        data: {
            notices
        }
    });
});

exports.getBirthNoticeById = catchAsync(async (req, res, next) => {
    const notice = await Birth_notice.findByPk(req.params.id);
    
    if (!notice) {
        return next(new appError('No birth notice found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            notice
        }
    });
});

// Birth Declaration
exports.getAllBirthDeclarationsByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const declarations = await BirthDeclaration.findAll({
        where: {
            id: {
                [Op.like]: `${year}/%`
            }
        },
        order: [['id', 'ASC']]
    });

    res.status(200).json({
        status: 'success',
        results: declarations.length,
        data: {
            declarations
        }
    });
});

exports.getBirthDeclarationById = catchAsync(async (req, res, next) => {
    const declaration = await BirthDeclaration.findByPk(req.params.id);
    
    if (!declaration) {
        return next(new appError('No birth declaration found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            declaration
        }
    });
});

// Operation Cost Declaration
exports.getAllOperationCostDeclarationsByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const declarations = await OperationCostDeclaration.findAll({
        where: {
            id: {
                [Op.like]: `${year}/%`
            }
        },
        order: [['id', 'ASC']]
    });

    res.status(200).json({
        status: 'success',
        results: declarations.length,
        data: {
            declarations
        }
    });
});

exports.getOperationCostDeclarationById = catchAsync(async (req, res, next) => {
    const declaration = await OperationCostDeclaration.findByPk(req.params.id);
    
    if (!declaration) {
        return next(new appError('No operation cost declaration found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            declaration
        }
    });
});