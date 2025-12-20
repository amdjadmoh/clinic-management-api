const prescriptionController= require('../controller/prescriptionController');
const express = require('express');
const router = express.Router();

router 
.route('/')
.get(prescriptionController.getAllPrescriptionDetails)
.post(prescriptionController.createPrescriptionDetail);    
router
    .route('/:id')
    .get(prescriptionController.getPrescriptionDetail)
    .patch(prescriptionController.updatePrescriptionDetail)
    .delete(prescriptionController.deletePrescriptionDetail);

router
    .route('/byprescriptionID/:prescriptionID')
    .get(prescriptionController.getPrescriptionDetailsByPrescription)
    .delete(prescriptionController.deletePrescriptionDetailsByPrescription);

module.exports = router;