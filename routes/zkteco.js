const express = require('express');
const zktecoController = require('../controller/zktecoController');

const router = express.Router();

router.route('/sync')
  .post(zktecoController.syncZktecoLogs);

router.route('/device-users')
  .get(zktecoController.getDeviceUsers);

module.exports = router;
