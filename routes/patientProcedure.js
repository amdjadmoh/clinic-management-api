const express = require('express');
const patientProcedureController = require('../controller/patientProcedure');

const router = express.Router();

router
  .route('/:invoiceID')
  .get(patientProcedureController.getProceduresByInvoice);

router
  .route('/assign')
  .post(patientProcedureController.assignProcedureToInvoice);

router
  .route('/unassign')
  .post(patientProcedureController.unassignProcedureFromInvoice);
router
  .route('/assignResult')
  .post(patientProcedureController.assignResultToInvoice);
router
  .route('/unassignResult')
  .post(patientProcedureController.unassignResultFromInvoice);  

module.exports = router;