const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const EmployeeSchedule = require('../models/EmployeeSchedule');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment-timezone');

// Helper: count how many days in a date range fall on scheduled work days
const countScheduledDaysInRange = (startDate, endDate, scheduleDays) => {
  // scheduleDays is an array of dayOfWeek integers, e.g. [0, 1, 2, 3, 4]
  const scheduledDaySet = new Set(scheduleDays);
  let count = 0;
  const current = moment(startDate);
  const end = moment(endDate);

  while (current.isSameOrBefore(end, 'day')) {
    if (scheduledDaySet.has(current.day())) {
      count++;
    }
    current.add(1, 'day');
  }
  return count;
};

// Request a leave
exports.createLeaveRequest = catchAsync(async (req, res, next) => {
  const { employeeId, startDate, endDate, type, reason, paidPercentage } = req.body;

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
    reason,
    paidPercentage: paidPercentage !== undefined ? paidPercentage : 100,
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
// When approving:
//   - If employee has a schedule: auto-calculate paidDays (only work days in the leave range)
//   - If employee has no schedule: admin must provide paidDays manually
//   - paidPercentage can be updated (e.g. official holiday = 100, other = 50)
exports.updateLeaveStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, paidDays, paidPercentage } = req.body;

  if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
    return next(new AppError('Please provide a valid status: pending, approved, or rejected', 400));
  }

  const leave = await Leave.findByPk(id);
  if (!leave) {
    return next(new AppError('Leave request not found', 404));
  }

  // Update paidPercentage if provided
  if (paidPercentage !== undefined) {
    leave.paidPercentage = paidPercentage;
  }

  // When approving, handle paidDays calculation
  if (status === 'approved') {
    // Check if employee has a schedule
    const scheduleEntries = await EmployeeSchedule.findAll({
      where: { employeeId: leave.employeeId }
    });

    if (scheduleEntries.length > 0) {
      // Employee HAS a schedule — auto-calculate paidDays
      const scheduleDays = scheduleEntries.map(s => s.dayOfWeek);
      const calculatedPaidDays = countScheduledDaysInRange(leave.startDate, leave.endDate, scheduleDays);
      leave.paidDays = calculatedPaidDays;
    } else {
      // Employee has NO schedule — use manually provided paidDays
      if (paidDays !== undefined) {
        leave.paidDays = paidDays;
      }
      // If paidDays not provided and no schedule, leave it as null (backward compat: payroll will fall back to calendar days)
    }
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
