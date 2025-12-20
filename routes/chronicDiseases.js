const express = require("express");
const router = express.Router();
const ChronicDiseases = require("../controller/chronicDiseases");

router
  .route("/")
  .get(ChronicDiseases.getAllChronicDiseases)
  .post(ChronicDiseases.createChronicDisease);
router
  .route("/:id/assign")
  .post(ChronicDiseases.assignChronicDisease)

  .delete(ChronicDiseases.unassignChronicDisease);

router.get("/:id/patients", ChronicDiseases.getPatients);
router.route("/patient/:id")
.get(ChronicDiseases.getPatientChronicDiseases);
router.route("/search").get(ChronicDiseases.searchChronicDisease);
router
  .route("/:id")
  .get(ChronicDiseases.getChronicDisease)
  .patch(ChronicDiseases.updateChronicDisease)
  .delete(ChronicDiseases.deleteChronicDisease);

module.exports = router;
