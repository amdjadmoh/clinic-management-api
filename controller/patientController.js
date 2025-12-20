const Patient = require('../models/Patient');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');

exports.searchPatient = catchAsync(async (req, res, next) => {
    const patients = await Patient.findAll({
        where: {
           name:{ [Op.iLike]: `%${req.query.name}%`},
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        patients,
        },
    });
    }
);
exports.searchByID = catchAsync(async (req, res, next) => {
    const patients = await Patient.findAll({
        where: Sequelize.where(
            Sequelize.cast(Sequelize.col('id'), 'TEXT'),
            {
                [Op.like]: `${req.query.id}%`
            }
        )
    });
    res.status(200).json({
        status: 'success',
        data: {
        patients,
        },
    });
    }

);
exports.getAllPatients = catchAsync(async (req, res, next) => {
    const patients = await Patient.findAll();
    res.status(200).json({
        status: 'success',
        data: {
        patients,
        },
    });
    }
);

exports.getPatient = catchAsync(async (req, res, next) => {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
        return next(new appError('Patient not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
        patient,
        },
    });
    }
);
function sortWords(str) {
    return str.split(' ').sort().join(' ');
}
exports.createPatient = catchAsync(async (req, res, next) => {
    const sortedName = sortWords(req.body.name);
    const patients = await Patient.findAll({
        where: {
            birthdate: req.body.birthdate
        }
    });
    const patient = patients.find(p => sortWords(p.name) === sortedName);

    if(patient){
        return next(new appError('ce patient existe déjà', 400
        ));
    }
    const newPatient = await Patient.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
        patient: newPatient,
        },
    });
    }
);

exports.updatePatient = catchAsync(async (req, res, next) => {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
        return next(new appError('Patient not found', 404));
    }
    const updatedPatient = await patient.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
        patient: updatedPatient,
        },
    });
    }
);

exports.deletePatient = catchAsync(async (req, res, next) => {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
        return next(new appError('Patient not found', 404));
    }
    await patient.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
    }

);

