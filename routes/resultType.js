const express = require('express');
const resultTypeController = require('../controller/ResultType');
const resultTypeUrineController = require('../controller/ResultType');

const router = express.Router();

// Define routes for ResultType
router
.route('/')
.get(resultTypeController.getAllResultTypes)
.post(resultTypeController.createResultType);
router.route('/preset')
.get(resultTypeController.getAllAnalysisPreSets)
.post(resultTypeController.createAnalysisPreSet);
router
.route('/preset/:id')
.get(resultTypeController.getAnalysisPreSet)
.patch(resultTypeController.updateAnalysisPreSet)
.delete(resultTypeController.deleteAnalysisPreSet);

router
    .route('/urine')
    .get(resultTypeUrineController.getAllResultTypeUrines)
    .post(resultTypeUrineController.createResultTypeUrine);



router
    .route('/urine/:id')
    .get(resultTypeUrineController.getResultTypeUrine)
    .patch(resultTypeUrineController.updateResultTypeUrine)
    .delete(resultTypeUrineController.deleteResultTypeUrine);
    
router
.route('/:id')
.get(resultTypeController.getResultType)
.patch(resultTypeController.updateResultType)
.delete(resultTypeController.deleteResultType);




module.exports = router;

