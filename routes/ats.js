const express = require('express');
const atsController = require('../controller/atsController');

const router = express.Router();

router.route('/')
  .post(atsController.createAts)
  .get(atsController.getAllAts);

router.route('/:id')
  .get(atsController.getAts)
  .put(atsController.updateAts)
  .delete(atsController.deleteAts);

module.exports = router;
