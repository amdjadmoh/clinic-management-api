const queueController = require("../controller/queueController");
const express = require("express");
const router = express.Router();

router
  .route("/")
  .get(queueController.getAllQueues)
  .post(queueController.addToQueue);

router
  .route("/:id")
  .get(queueController.getQueue)
  .patch(queueController.updateQueue)
  .delete(queueController.deleteQueue);

router.route("/department/:depID").get(queueController.getQueueByDep);

router.route("/patient/:patientID").get(queueController.getQueueByPatient);

router.route("/status/:status").get(queueController.getQueueByStatus);

router.route("/number/:queueNumber").get(queueController.getQueueByNumber);
router;
router.route("/date/:date").get(queueController.getQueueByDate);
router.route("/doctor/:doctorID").get(queueController.getQueueByDoctor);
router
  .route("/doctor/:doctorID/date/:date")
  .get(queueController.getQueueByDoctorDate);
router
  .route("/doctor/:doctorID/status/:status")
  .get(queueController.getQueueByDoctorStatus);
router
  .route("/doctor/:doctorID/number/:queueNumber")
  .get(queueController.getQueueByDoctorNumber);
router
  .route("/date/:date/status/:status")
  .get(queueController.getQueueByDateStatus);
router
  .route("/dep/:depID/date/:date/number/:queueNumber")
  .get(queueController.getQueueByDepDateNumber);
router
  .route("/dep/:depID/date/:date/status/:status")
  .get(queueController.getQueueByDepDateStatus);
router
  .route("/date/:date/number/:queueNumber")
  .get(queueController.getQueueByDateNumber);

router
  .route("/dep/:depID/status/:status")
  .get(queueController.getQueueByDepStatus);

router
  .route("/dep/:depID/number/:queueNumber")
  .get(queueController.getQueueByDepNumber);
router
  .route("/dep/:depID/date/:date")
  .get(queueController.getQueueByDepDate);

module.exports = router;
