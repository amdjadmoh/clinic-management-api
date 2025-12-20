const Appointment = require('../models/Appointment');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Sequelize = require('sequelize');

exports.getAllAppointments = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.findAll();
    res.status(200).json({
        status: 'success',
        data: {
        appointments,
        },
    });
    }
);

exports.getAppointment = catchAsync(async (req, res, next) => {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
        return next(new appError('Appointment not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
        appointment,
        },
    });
    }
);

exports.createAppointment = catchAsync(async (req, res, next) => {
    const newAppointment = await Appointment.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
        appointment: newAppointment,
        },
    });
    }
);

exports.updateAppointment = catchAsync(async (req, res, next) => {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
        return next(new appError('Appointment not found', 404));
    }
    const updatedAppointment = await appointment.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
        appointment: updatedAppointment,
        },
    });
    }
);

exports.deleteAppointment = catchAsync(async (req, res, next) => {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
        return next(new appError('Appointment not found', 404));
    }
    await appointment.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
    }
);

exports.getAppointmentByPatient = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.findAll({
        where: {
            patientID: req.params.id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        appointments,
        },
    });
    }
);

exports.getAppointmentByDoctor = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.findAll({
        where: {
            doctorID: req.params.id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        appointments,
        },
    });
    }
);

exports.getAppointmentByDepartment = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.findAll({
        where: {
            depID: req.params.id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        appointments,
        },
    });
    }
);

exports.getAppointmentByDate = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.findAll({
        where: {
            date: req.params.date,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        appointments,
        },
    });
    }
);

exports.getAppointmentByStatus = catchAsync(async (req, res, next) => {
    const appointments = await Appointment.findAll({
        where: {
            status: req.params.status,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        appointments,
        },
    });
    }
);

