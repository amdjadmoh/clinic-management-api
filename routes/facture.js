const factureController = require('../controller/factureController');
const express = require('express');
const router = express.Router();

router

    .route('/')
    .get(factureController.getAllFactures)  
    .post(factureController.createFacture);
    router.route('/procedure/:id')
    .patch(factureController.updateProcedureFromFacture)
    .delete(factureController.deleteProcedureFromFacture);
    router
    .route('/procedure/add/:factureID')
       .post(factureController.addProcedureToFacture);
       
    router
    .route('/byPatient/:patientID')
    .get(factureController.getPatientFactures);
    module.exports = router;
    router
    .route('/byCoverage/:coverageType')
    .get(factureController.getFactureBycoverageType);

router

    .route('/:id')
    .get(factureController.getFacture)
    .patch(factureController.updateFacture)
    .delete(factureController.deleteFacture); 
