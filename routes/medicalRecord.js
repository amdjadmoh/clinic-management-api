const express = require('express');
const medicalRecordController = require('../controller/medicalRecordController');

const router = express.Router();

router
    .route('/')
    .get(medicalRecordController.getAllMedicalRecords)
    .post(medicalRecordController.createMedicalRecord);

router 
.route('/byStatusAndPatient/:id/:status')   
.get(medicalRecordController.getMedicalRecordByPatientAndStatus); 
router
    .route('/:id')
    .get(medicalRecordController.getMedicalRecord)
    .patch(medicalRecordController.updateMedicalRecord)
    .delete(medicalRecordController.deleteMedicalRecord);

router
    .route('/patient/:id')
    .get(medicalRecordController.getMedicalRecordByPatient);

module.exports = router;