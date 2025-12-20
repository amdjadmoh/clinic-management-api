const express = require('express');
const hrController = require('../controller/hrController');

const router = express.Router();

router.route('/visitsPerDepInDateRange').get(hrController.getVisitsPerDepInDateRange);

module.exports=router;