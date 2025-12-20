const express = require('express');
const patientProcedureController = require('../controller/patientProcedure');

const router = express.Router();

router
    .route('/')
    .get(patientProcedureController.getAllpatientProcedures)
    .post(patientProcedureController.createpatientProcedure);

router
    .route('/:id')
    .get(patientProcedureController.getpatientProcedure)
    .patch(patientProcedureController.updatepatientProcedure)
    .delete(patientProcedureController.deletepatientProcedure);

router
    .route('/patient/:patientID')
    .get(patientProcedureController.getpatientProceduresBypatientID);

router
    .route('/procedure/:procedureID')
    .get(patientProcedureController.getpatientProceduresByProcedureID);

router
    .route('/patient/:patientID/procedure/:procedureID')
    .get(patientProcedureController.getpatientProceduresBypatientIDAndProcedureID);

module.exports = router;