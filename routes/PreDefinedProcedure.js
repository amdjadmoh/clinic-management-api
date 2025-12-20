const express = require('express');
const router = express.Router();
const PreDefinedProcedureController = require('../controller/PreDefinedProcedure');

router.route('/')
    .get(PreDefinedProcedureController.getAllPreDefinedProcedures)
    .post(PreDefinedProcedureController.createPreDefinedProcedure);
router.route('/search')
    .get(PreDefinedProcedureController.searchPreDefinedProcedure);

router.route('/byType')
    .get(PreDefinedProcedureController.getAllPreDefinedProceduresByType);

router.route('/searchByType')
    .get(PreDefinedProcedureController.searchPreDefinedProcedureByType);
    
router.route('/:id')
    .get(PreDefinedProcedureController.getPreDefinedProcedure)
    .patch(PreDefinedProcedureController.updatePreDefinedProcedure)
    .delete(PreDefinedProcedureController.deletePreDefinedProcedure);

module.exports = router;