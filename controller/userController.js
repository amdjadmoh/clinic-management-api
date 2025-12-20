const User = require('../models/Users');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users= await User.findAll();
    res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
// Get user by ID
exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
// Create a new user
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// Update user by ID
exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  const updatedUser = await user.update(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Delete user by ID
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findByPk(req.params.id);
    if (!user) {
    return next(new AppError('User not found', 404));
  }
  await user.destroy();
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

