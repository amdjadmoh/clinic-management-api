const express = require('express');
const payrollController = require('../controller/payrollController');

const router = express.Router();

router.route('/')
  .get(payrollController.calculateAndGetSalarySummary);
router.route('/pay')
  .post(payrollController.payEmployee);
router.route('/adjustment')
  .post(payrollController.addAdjustment);
router.route('/confirm')
  .post(payrollController.confirmPayroll);
router.route('/unlock')
  .post(payrollController.unlockPayroll);

router.route('/history/:employeeId')
  .get(payrollController.getEmployeePayrollHistory);

module.exports = router;
