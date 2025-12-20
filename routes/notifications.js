const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');


// Create notification route
router.post('/', notificationController.createNotification);

// Get notifications for a user
router.get('/', notificationController.getNotifications);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);
// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
