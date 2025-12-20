const express = require('express');
const prescriptionController = require('../controller/prescriptionController');
const router = express.Router();

router
    .route('/')
    .get(prescriptionController.getAllPrescriptions)
    .post(prescriptionController.createPrescription);

router
    .route('/:id')
    .get(prescriptionController.getPrescription)
    .patch(prescriptionController.updatePrescription)
    .delete(prescriptionController.deletePrescription);

router
    .route('/patient/:patientID')
    .get(prescriptionController.getPrescriptionsByPatient);

router
    .route('/doctor/:doctorID')
    .get(prescriptionController.getPrescriptionsByDoctor);

module.exports = router;