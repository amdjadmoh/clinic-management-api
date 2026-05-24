const express = require('express');
const employeeController = require('../controller/employeeController');
const leaveController = require('../controller/leaveController');

const router = express.Router();

router.route('/jobs')
  .post(employeeController.createJob)
  .get(employeeController.getJobs);

router.route('/jobs/:id')
  .get(employeeController.getJob)
  .put(employeeController.updateJob)
  .delete(employeeController.deleteJob);

router.route('/leaves')
  .post(leaveController.createLeaveRequest)
  .get(leaveController.getAllLeaveRequests);

router.route('/leaves/:id')
  .put(leaveController.updateLeaveStatus);

router.route('/')
  .post(employeeController.createEmployee)
  .get(employeeController.getEmployees);

router.route('/:id')
  .get(employeeController.getEmployee)
  .put(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

router.route('/:id/attendance')
  .get(employeeController.getEmployeeAttendance);

router.route('/:id/leaves')
  .get(leaveController.getEmployeeLeaves);

router.route('/:id/files')
  .get(employeeController.getEmployeeFiles);

router.route('/:employeeId/payment-settings')
  .put(employeeController.updateEmployeePaymentSettings);

router.route('/attendance')
  .post(employeeController.recordAttendance);

module.exports = router;
