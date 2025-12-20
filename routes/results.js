const express = require('express');
const resultController = require('../controller/resultController');


const router = express.Router();

// Define routes for Result
router.get('/', resultController.getAllResults);
router.post('/', resultController.createResult);

router.get('/patient/:patientID', resultController.getResultByPatient);
router.get('/patient/:patientID/type/:resultTypeID', resultController.getResultByPatientAndType);
router.get('/patient/:patientID/dep/:depID', resultController.getResultByPatientAndDep);
router.get('/notConfirmed', resultController.getNotConfirmedResults);
router.get('/confirm/:id', resultController.confirmResult);
router.post('/doctorCreateResult', resultController.doctorCreateResult);
router.get('/doctor/:doctorID', resultController.getResultsByDoctor);
router.get('/:id', resultController.getResult);
router.patch('/:id', resultController.updateResult);
router.delete('/:id', resultController.deleteResult);
module.exports = router;