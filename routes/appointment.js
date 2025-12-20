const express = require('express');
const appointmentController = require('../controller/appointmentController');

const router = express.Router();

router
    .route('/')
    .get(appointmentController.getAllAppointments)
    .post(appointmentController.createAppointment);

router
    .route('/:id')
    .get(appointmentController.getAppointment)
    .patch(appointmentController.updateAppointment)
    .delete(appointmentController.deleteAppointment);

router
    .route('/patient/:id')
    .get(appointmentController.getAppointmentByPatient);

router
    .route('/doctor/:id')
    .get(appointmentController.getAppointmentByDoctor);

router
    .route('/department/:id')
    .get(appointmentController.getAppointmentByDepartment);

router
    .route('/date/:date')
    .get(appointmentController.getAppointmentByDate);

router
    .route('/status/:status')
    .get(appointmentController.getAppointmentByStatus);

module.exports = router;