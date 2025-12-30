const express = require('express');
const proceduresRequestController = require('../controller/proecuresRequest');
const router = express.Router();

// Procedures Requests routes
router
    .route('/')
    .get(proceduresRequestController.getAllProceduresRequests)
    .post(proceduresRequestController.createProceduresRequest);
router
.route('/pending')
.get(proceduresRequestController.getPendingProceduresRequests);
router
.route('/CompletedInPeriod')
.get(proceduresRequestController.getCompletedRequestsInPeriod );    

router
    .route('/:id')
    .get(proceduresRequestController.getProceduresRequest)
    .patch(proceduresRequestController.updateProceduresRequest)
    .delete(proceduresRequestController.deleteProceduresRequest);

router
    .route('/:id/confirm')
    .patch(proceduresRequestController.confirmProceduresRequest);

router
    .route('/patient/:patientID')
    .get(proceduresRequestController.getProceduresRequestsByPatient);

// Procedures Request Items routes
router
    .route('/items')
    .post(proceduresRequestController.createProceduresRequestItem);

router
    .route('/items/:id')
    .delete(proceduresRequestController.deleteProceduresRequestItem);

module.exports = router;