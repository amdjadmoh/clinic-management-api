const express = require('express');
const zktecoController = require('../controller/zktecoController');

const router = express.Router();

router.route('/sync')
  .post(zktecoController.syncZktecoLogs);

module.exports = router;
