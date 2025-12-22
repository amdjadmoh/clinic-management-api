const express = require('express');
const prescriptionController = require('../controller/prescriptionController');
const router = express.Router();

router
    .route('/:doctorID')
    .get(prescriptionController.getPrescriptionTemplatesByDoctor)
    .post(prescriptionController.createPrescriptionTemplate);

router
    .route('/:doctorID/:id')
    .get(prescriptionController.getPrescriptionTemplate)
    .patch(prescriptionController.updatePrescriptionTemplate)
    .delete(prescriptionController.deletePrescriptionTemplate);

module.exports = router;