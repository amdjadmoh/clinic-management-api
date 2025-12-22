const express = require('express');
const prescriptionController = require('../controller/prescriptionController');
const router = express.Router();

router
    .route('/:doctorID')
    .post(prescriptionController.createPrescriptionTemplateDetails);
    
router
    .route('/:doctorID/:detailID')
    .patch(prescriptionController.updateTemplatePrescriptionDetail)
    .delete(prescriptionController.deletePrescriptionTemplateDetails);
router
    .route('/bytemplate/:doctorID/:templateID')
    .get(prescriptionController.getPrescriptionTemplateDetails)

module.exports = router;