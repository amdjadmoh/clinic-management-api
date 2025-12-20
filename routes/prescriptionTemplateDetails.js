const express = require('express');
const prescriptionController = require('../controller/prescriptionController');
const router = express.Router();

router
    .route('/')
    .post(prescriptionController.createPrescriptionTemplateDetails);
    
router
    .route('/:detailID')
    .patch(prescriptionController.updateTemplatePrescriptionDetail)
    .delete(prescriptionController.deletePrescriptionTemplateDetails);
router
    .route('/bytemplate/:templateID')
    .get(prescriptionController.getPrescriptionTemplateDetails)

module.exports = router;