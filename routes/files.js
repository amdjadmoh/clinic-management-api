const express = require('express');
const router = express.Router();
const filesController = require('../controller/files');

router.post('/upload', filesController.upload, filesController.createFile);

router.get('/', filesController.getAllFiles);


router.get('/:id/download', filesController.downloadFile);
router.delete('/:id',  filesController.deleteFile);

module.exports = router;