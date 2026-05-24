const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Request a leave
exports.createLeaveRequest = catchAsync(async (req, res, next) => {
  const { employeeId, startDate, endDate, type, reason } = req.body;

  if (!employeeId || !startDate || !endDate) {
    return next(new AppError('Please provide employeeId, startDate, and endDate', 400));
  }

  // Check if employee exists
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const newLeave = await Leave.create({
    employeeId,
    startDate,
    endDate,
    type: type || 'annual',
    status: 'pending',
    reason
  });

  res.status(201).json({
    status: 'success',
    data: {
      leave: newLeave
    }
  });
});

// List all leave requests
exports.getAllLeaveRequests = catchAsync(async (req, res, next) => {
  const { status, employeeId } = req.query;
  const whereClause = {};

  if (status) whereClause.status = status;
  if (employeeId) whereClause.employeeId = employeeId;

  const leaves = await Leave.findAll({
    where: whereClause,
    include: [{
      model: Employee,
      attributes: ['id', 'fullName']
    }],
    order: [['startDate', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: leaves.length,
    data: {
      leaves
    }
  });
});

// List leaves for a specific employee
exports.getEmployeeLeaves = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const leaves = await Leave.findAll({
    where: { employeeId },
    order: [['startDate', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: leaves.length,
    data: {
      leaves
    }
  });
});

// Update leave request status (Approve/Reject)
exports.updateLeaveStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return next(new AppError('Please provide a valid status: pending, approved, or rejected', 400));
  }

  const leave = await Leave.findByPk(id);
  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  leave.status = status;
  await leave.save();

  res.status(200).json({
    status: 'success',
    data: {
      leave
    }
  });
});
