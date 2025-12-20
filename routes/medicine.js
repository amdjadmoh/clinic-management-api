const express = require("express");
const medicineController = require("../controller/medicineController");

const router = express.Router();

router
  .route("/")
  .get(medicineController.getAllMedicines)
  .post(medicineController.createMedicine);
router.route("/search").get(medicineController.searchMedicine);
router
  .route("/:id")
  .get(medicineController.getMedicine)
  .patch(medicineController.updateMedicine)
  .delete(medicineController.deleteMedicine);

module.exports = router;
