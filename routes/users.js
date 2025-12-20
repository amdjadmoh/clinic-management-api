const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');
 
const router = express.Router();

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

  router 
  .route('/login')
    .post(authController.login);
    
module.exports = router;