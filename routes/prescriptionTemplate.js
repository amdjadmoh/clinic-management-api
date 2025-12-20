const express = require('express');
const prescriptionController = require('../controller/prescriptionController');
const router = express.Router();

router
    .route('/')
    .get(prescriptionController.getAllPrescriptionTemplates)
    .post(prescriptionController.createPrescriptionTemplate);

router

    .route('/:id')
    .get(prescriptionController.getPrescriptionTemplate)
    .patch(prescriptionController.updatePrescriptionTemplate)
    .delete(prescriptionController.deletePrescriptionTemplate);

module.exports = router;