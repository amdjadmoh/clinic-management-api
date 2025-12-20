const express = require('express');
const bloodTestController = require('../controller/bloodTestController');

const router = express.Router();
// Protect all routes after this middleware

// Routes that all authorized users can access
router.route('/')
    .get(bloodTestController.getAllBloodTests)
    .post(bloodTestController.createBloodTest);

router.route('/pending')
    .get(bloodTestController.getPendingBloodTests);

router.route('/date-range')
    .get(bloodTestController.getBloodTestsByDateRange);

router.route('/:id')
    .get(bloodTestController.getBloodTest)
    .patch(bloodTestController.updateBloodTest)
    .delete(bloodTestController.deleteBloodTest);

router.route('/:id/complete')
    .patch(bloodTestController.completeBloodTest);

router.route('/:id/cancel')
    .patch(bloodTestController.cancelBloodTest);

router.route('/patient/:patientId')
    .get(bloodTestController.getPatientBloodTests);

module.exports = router;
