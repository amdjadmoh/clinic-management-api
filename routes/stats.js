const statsController = require('../controller/statsController');
const express = require('express');
const router = express.Router();

router.get('/numberOfPatients', statsController.numberOfPatients);
router.get('/numberOfVisitsInLastMonth', statsController.numberOfVisitsInLastMonth);
router.get('/numberOfVisitsByDepartmentInDateRange', statsController.numberOfVisitsByDepartmentInDateRange);
router.get('/numberOfOperationsInLastMonth', statsController.numberOfOperationsInLastMonth);
router.get('/listOfOperations', statsController.listOfOperations);
router.get('/totalRevenueInRangeCompared', statsController.totalRevenueInRangeCompared);
module.exports = router;