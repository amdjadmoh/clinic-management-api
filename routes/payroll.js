const express = require('express');
const payrollController = require('../controller/payrollController');

const router = express.Router();

router.route('/')
  .get(payrollController.calculateAndGetSalarySummary);
router.route('/pay')
  .post(payrollController.payEmployee);

module.exports = router;
