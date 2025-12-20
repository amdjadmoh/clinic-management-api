const express = require('express');
const laboPricesController = require('../controller/LaboPrices');

const router = express.Router();


// Routes
router
  .route('/')
  .get(laboPricesController.getAllLaboPrices)

router
  .route('/:id')
  .get(laboPricesController.getLaboPrice)
  .patch(laboPricesController.updateLaboPrice)

module.exports = router;
