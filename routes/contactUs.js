const express = require('express');

const contactUsController = require('../controller/contactUs');

const router = express.Router();
router.get('/', contactUsController.getAllMessages);
router.post('/', contactUsController.contactUs);
router.get('/unread', contactUsController.getUnreadMessages);

router.get('/:id', contactUsController.getMessage);
router.patch('/:id', contactUsController.setRead);
router.delete('/:id', contactUsController.deleteMessage);


module.exports = router;