const patientController = require('../controller/patientController');
const certificateController = require('../controller/certificateController');
const express = require('express');
const router = express.Router();

router
.get('/', patientController.getAllPatients)
.post('/', patientController.createPatient)
.get('/search', patientController.searchPatient)
.get('/searchByID', patientController.searchByID);

// Patient certificates routes
router
.post('/:patientID/certificates', certificateController.savePatientCertificate)
.get('/:patientID/certificates', certificateController.getPatientCertificates);

router
.get('/certificates/:id', certificateController.getPatientCertificateByID)
.patch('/certificates/:id', certificateController.updatePatientCertificate)
.delete('/certificates/:id', certificateController.deletePatientCertificate);

router
.get('/:id', patientController.getPatient)
.patch('/:id', patientController.updatePatient)
.delete('/:id', patientController.deletePatient);

module.exports = router;