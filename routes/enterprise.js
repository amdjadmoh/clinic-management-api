const express = require("express");
const router = express.Router();
const enterpriseController = require("../controller/enterpriseController");

router
  .route("/")
  .get(enterpriseController.getAllEnterprises)
  .post(enterpriseController.createEnterprise);
router
  .route("/:id")
  .get(enterpriseController.getEnterprise)
  .patch(enterpriseController.updateEnterprise)
  .delete(enterpriseController.deleteEnterprise);

module.exports = router;
