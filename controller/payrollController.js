const Employee = require('../models/Employee');
const EmployeePaymentSetting = require('../models/EmployeePaymentSetting');
const EmployeeSchedule = require('../models/EmployeeSchedule');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const PayrollPayment = require('../models/PayrollPayment');
const PayrollAdjustment = require('../models/PayrollAdjustment');
const DoctorWorkLog = require('../models/DoctorLog');
const Leave = require('../models/Leave');
const PreDefinedProcedure = require('../models/PreDefinedProcedure');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

// Helper: check if a payroll is frozen (confirmed, partially_paid, or paid)
const isFrozen = (status) => ['confirmed', 'partially_paid', 'paid'].includes(status);

// Helper: count how many days in a date range fall on given dayOfWeek values
const countScheduledDaysInRange = (rangeStart, rangeEnd, scheduledDaySet) => {
  let count = 0;
  const current = moment(rangeStart);
  const end = moment(rangeEnd);
  while (current.isSameOrBefore(end, 'day')) {
    if (scheduledDaySet.has(current.day())) {
      count++;
    }
    current.add(1, 'day');
  }
  return count;
};

// Calculation core helper — always recalculates from live data
const calculateSalaryBreakdown = async (employeeId, month) => {
  const employee = await Employee.findByPk(employeeId, {
    include: [{ model: EmployeePaymentSetting }],
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

  // Load employee schedule (if any)
  const scheduleEntries = await EmployeeSchedule.findAll({ where: { employeeId } });
  const hasSchedule = scheduleEntries.length > 0;
  const scheduledDaySet = new Set(scheduleEntries.map(s => s.dayOfWeek));

  // Month starts and ends: e.g. YYYY-MM
  const startOfMonth = moment(month, 'YYYY-MM').startOf('month');
  const endOfMonth = moment(month, 'YYYY-MM').endOf('month');
  const isCurrentMonth = startOfMonth.isSame(moment(), 'month');

  let fixedSalaryEarned = 0;
  let hourlySalaryEarned = 0;
  let commissionEarned = 0;
  let bonusEarned = 0;

  const logs = [];

  // Find all attendance rows for this employee this month
  const attendances = await Attendance.findAll({
    where: {
      employeeId,
      date: {
        [Op.between]: [startOfMonth.format('YYYY-MM-DD'), endOfMonth.format('YYYY-MM-DD')],
      }
    }
  });

  // Query approved leaves for this month
  const approvedLeaves = await Leave.findAll({
    where: {
      employeeId,
      status: 'approved',
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [startOfMonth.format('YYYY-MM-DD'), endOfMonth.format('YYYY-MM-DD')]
          }
        },
        {
          endDate: {
            [Op.between]: [startOfMonth.format('YYYY-MM-DD'), endOfMonth.format('YYYY-MM-DD')]
          }
        }
      ]
    }
  });

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;

  approvedLeaves.forEach(l => {
    const leaveStart = moment.max(moment(l.startDate), startOfMonth);
    const leaveEnd = moment.min(moment(l.endDate), endOfMonth);
    const paidPct = parseFloat(l.paidPercentage) || 100;

    if (l.type === 'unpaid') {
      // Unpaid leaves: count work days to dock from salary
      if (l.paidDays !== null && l.paidDays !== undefined) {
        unpaidLeaveDays += parseFloat(l.paidDays);
      } else if (hasSchedule) {
        unpaidLeaveDays += countScheduledDaysInRange(leaveStart, leaveEnd, scheduledDaySet);
      } else {
        const days = leaveEnd.diff(leaveStart, 'days') + 1;
        if (days > 0) unpaidLeaveDays += days;
      }
    } else {
      // Paid leaves: count effective paid days considering paidPercentage
      let effectiveDays = 0;
      if (l.paidDays !== null && l.paidDays !== undefined) {
        effectiveDays = parseFloat(l.paidDays) * (paidPct / 100);
      } else if (hasSchedule) {
        const scheduledDays = countScheduledDaysInRange(leaveStart, leaveEnd, scheduledDaySet);
        effectiveDays = scheduledDays * (paidPct / 100);
      } else {
        const days = leaveEnd.diff(leaveStart, 'days') + 1;
        if (days > 0) effectiveDays = days * (paidPct / 100);
      }
      paidLeaveDays += effectiveDays;
    }
  });

  if (paidLeaveDays > 0) {
    logs.push(`Approved Paid Leaves: ${paidLeaveDays.toFixed(1)} effective days (after paidPercentage)`);
  }
  if (unpaidLeaveDays > 0) {
    logs.push(`Approved Unpaid Leaves: ${unpaidLeaveDays} days (Salary docked)`);
  }
  if (hasSchedule) {
    logs.push(`Schedule: works on [${[...scheduledDaySet].sort().map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}]`);
  }

  // Pre-load consultation procedure IDs
  const consultationProcs = await PreDefinedProcedure.findAll({
    attributes: ['id'],
    where: { type: 'Consultation normal' },
  });
  const consultationProcIds = consultationProcs.map(p => p.id);

  for (const setting of employee.employee_payment_settings) {
    const { type, value, procedureId } = setting;
    const numericValue = parseFloat(value) || 0;

    if (type === 'fixed_monthly') {
      const startDay = moment(employee.startDate, 'YYYY-MM-DD');
      const customExpectedDays = setting.expectedDays || 30;

      let baselineDays;

      if (hasSchedule) {
        // === SCHEDULE-BASED BASELINE ===
        const effectiveStart = startDay.isAfter(startOfMonth) ? startDay : startOfMonth;
        const effectiveEnd = isCurrentMonth ? moment() : endOfMonth;
        if (effectiveStart.isAfter(effectiveEnd)) {
          baselineDays = 0;
        } else {
          baselineDays = countScheduledDaysInRange(effectiveStart, effectiveEnd, scheduledDaySet);
        }
      } else {
        // === OLD expectedDays LOGIC (unchanged) ===
        baselineDays = customExpectedDays;
        if (startDay.isSame(startOfMonth, 'month')) {
          const fullMonthFraction = (30 - startDay.date() + 1) / 30;
          baselineDays = Math.round(fullMonthFraction * customExpectedDays);
          if (isCurrentMonth) {
            const currentMonthFraction = Math.min(30 - startDay.date() + 1, moment().date() - startDay.date() + 1) / 30;
            baselineDays = Math.round(currentMonthFraction * customExpectedDays);
          }
        } else if (startDay.isAfter(endOfMonth)) {
          baselineDays = 0;
        } else if (isCurrentMonth) {
          const currentMonthFraction = Math.min(30, moment().date()) / 30;
          baselineDays = Math.round(currentMonthFraction * customExpectedDays);
        }

        if (baselineDays === 0 && startDay.isSame(startOfMonth, 'month')) {
          const hasStarted = !isCurrentMonth || startDay.date() <= moment().date();
          if (hasStarted) baselineDays = 1;
        }
      }

      if (baselineDays < 0) baselineDays = 0;

      // Daily rate: for schedule-based, use total scheduled days in full month; for expectedDays, use expectedDays
      let dailyRate;
      if (hasSchedule) {
        const fullMonthScheduledDays = countScheduledDaysInRange(startOfMonth, endOfMonth, scheduledDaySet);
        dailyRate = fullMonthScheduledDays > 0 ? numericValue / fullMonthScheduledDays : 0;
      } else {
        dailyRate = numericValue / customExpectedDays;
      }

      // Add paidLeaveDays to presentDays to count them as worked/excused
      const presentDays = attendances.filter(a => a.status === 'present').length + paidLeaveDays;
      
      // Unpaid leaves dock baseline days
      let adjustedBaseline = Math.max(0, baselineDays - unpaidLeaveDays);
      const absencesCount = Math.max(0, adjustedBaseline - presentDays);
      const workedDays = Math.max(0, adjustedBaseline - absencesCount);

      const earned = workedDays * dailyRate;

      fixedSalaryEarned += earned;
      logs.push(`Fixed Monthly: Worked days=${workedDays} (Base=${baselineDays}, Adjusted=${adjustedBaseline}, PaidLeaves=${paidLeaveDays.toFixed(1)}, Absences=${absencesCount}), DailyRate=${dailyRate.toFixed(2)}, Earned=${earned.toFixed(2)} [${hasSchedule ? 'schedule' : 'expectedDays'}]`);
    }

    if (type === 'hourly') {
      let totalHours = 0;
      attendances.forEach(a => {
        if (a.hoursWorked > 0) totalHours += parseFloat(a.hoursWorked);
      });
      const earned = totalHours * numericValue;
      hourlySalaryEarned += earned;
      logs.push(`Hourly Wage: Total hours=${totalHours}, Hourly rate=${numericValue}, Earned=${earned.toFixed(2)}`);
    }

    if ((type === 'patient_consultation_percentage' || type === 'consultation_percentage') && employee.doctorId) {
      const whereClause = {
        doctorID: employee.doctorId,
        date: {
          [Op.between]: [startOfMonth.format('YYYY-MM-DD 00:00:00'), endOfMonth.format('YYYY-MM-DD 23:59:59')],
        },
        procedureID: { [Op.in]: consultationProcIds },
      };

      const doctorLogs = await DoctorWorkLog.findAll({ where: whereClause });

      let totalCost = 0;
      doctorLogs.forEach(l => {
        if (l.procedureCost > 0) totalCost += parseFloat(l.procedureCost);
      });

      const earned = numericValue <= 100 ? (numericValue / 100) * totalCost : doctorLogs.length * numericValue;
      commissionEarned += earned;

      logs.push(`Patient Consultations: Count=${doctorLogs.length}, Total Cost=${totalCost}, Calculation=${numericValue <= 100 ? numericValue + '%' : numericValue + ' DZD per patient'}, Earned=${earned.toFixed(2)}`);
    }

    if (type === 'procedure_percentage' && employee.doctorId) {
      const whereClause = {
        doctorID: employee.doctorId,
        date: {
          [Op.between]: [startOfMonth.format('YYYY-MM-DD 00:00:00'), endOfMonth.format('YYYY-MM-DD 23:59:59')],
        },
        procedureID: { [Op.notIn]: consultationProcIds },
      };
      if (procedureId) {
        whereClause.procedureID = procedureId;
      }

      const doctorLogs = await DoctorWorkLog.findAll({ where: whereClause });

      let totalProcedureCost = 0;
      doctorLogs.forEach(l => {
        if (l.procedureCost > 0) totalProcedureCost += parseFloat(l.procedureCost);
      });

      const earned = numericValue <= 100 ? (numericValue / 100) * totalProcedureCost : doctorLogs.length * numericValue;
      commissionEarned += earned;

      logs.push(`Procedure ID=${procedureId || 'All'}: Count=${doctorLogs.length}, Total Cost=${totalProcedureCost}, Calculation=${numericValue <= 100 ? numericValue + '%' : numericValue + ' DZD per procedure'}, Earned=${earned.toFixed(2)}`);
    }

    // Only recurring bonuses are calculated from settings.
    // 'non_fixed_bonus' should NOT be here — use PayrollAdjustment for one-time bonuses.
    if (type === 'fixed_extra_bonus') {
      bonusEarned += numericValue;
      logs.push(`Recurring Bonus (${type}): Amount=${numericValue}`);
    }
  }

  // Get one-time adjustments for this employee and month
  let adjustmentsSum = 0;
  const existingPayrollRecord = await Payroll.findOne({
    where: { employeeId, month },
    include: ['adjustments']
  });
  if (existingPayrollRecord && Array.isArray(existingPayrollRecord.adjustments)) {
    existingPayrollRecord.adjustments.forEach(adj => {
      adjustmentsSum += parseFloat(adj.amount) || 0;
      logs.push(`One-time Adjustment: Amount=${adj.amount} DZD, Reason="${adj.description}"`);
    });
  }

  bonusEarned += adjustmentsSum;

  const totalEarned = fixedSalaryEarned + hourlySalaryEarned + commissionEarned + bonusEarned;

  return {
    fixedSalaryEarned: Math.round(fixedSalaryEarned),
    hourlySalaryEarned: Math.round(hourlySalaryEarned),
    commissionEarned: Math.round(commissionEarned),
    bonusEarned: Math.round(bonusEarned),
    totalEarned: Math.round(totalEarned),
    logs,
  };
};

// Helper: get the breakdown for a payroll — uses frozen values if confirmed, live calculation if draft
const getPayrollBreakdown = async (employeeId, month) => {
  const existingPayroll = await Payroll.findOne({
    where: { employeeId, month },
    include: ['payments', 'adjustments']
  });

  // If payroll is frozen (confirmed/partially_paid/paid), return saved values
  if (existingPayroll && isFrozen(existingPayroll.status)) {
    return {
      breakdown: {
        fixedSalaryEarned: Math.round(parseFloat(existingPayroll.fixedSalaryEarned) || 0),
        hourlySalaryEarned: Math.round(parseFloat(existingPayroll.hourlySalaryEarned) || 0),
        commissionEarned: Math.round(parseFloat(existingPayroll.commissionEarned) || 0),
        bonusEarned: Math.round(parseFloat(existingPayroll.bonusEarned) || 0),
        totalEarned: Math.round(parseFloat(existingPayroll.totalEarned) || 0),
        logs: existingPayroll.details && existingPayroll.details.logs ? existingPayroll.details.logs : ['Confirmed payroll — frozen values']
      },
      payroll: existingPayroll,
      frozen: true
    };
  }

  // Otherwise recalculate live
  const breakdown = await calculateSalaryBreakdown(employeeId, month);
  return { breakdown, payroll: existingPayroll, frozen: false };
};

exports.calculateAndGetSalarySummary = catchAsync(async (req, res, next) => {
  const { month } = req.query; // YYYY-MM
  if (!month) {
    return next(new AppError('Please provide a month in query parameter, e.g., ?month=2026-05', 400));
  }

  const employees = await Employee.findAll({
    where: { status: { [Op.ne]: 'deleted' } },
    include: [{ model: EmployeePaymentSetting }],
  });

  const payrollSummaries = [];

  for (const emp of employees) {
    const { breakdown, payroll: existingPayroll, frozen } = await getPayrollBreakdown(emp.id, month);

    const startOfMonth = moment(month, 'YYYY-MM').startOf('month');
    const start = startOfMonth.format('YYYY-MM-DD');
    const end = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');

    const presentDays = await Attendance.count({
      where: {
        employeeId: emp.id,
        status: 'present',
        date: { [Op.between]: [start, end] }
      }
    });

    const fixedSetting = emp.employee_payment_settings.find(s => s.type === 'fixed_monthly');
    const customExpectedDays = fixedSetting ? (fixedSetting.expectedDays || 30) : 30;

    const startDay = moment(emp.startDate, 'YYYY-MM-DD');
    let baselineDays = customExpectedDays;
    const isCurrentMonth = startOfMonth.isSame(moment(), 'month');

    if (startDay.isSame(startOfMonth, 'month')) {
      const fullMonthFraction = (30 - startDay.date() + 1) / 30;
      baselineDays = Math.round(fullMonthFraction * customExpectedDays);
      if (isCurrentMonth) {
        const currentMonthFraction = Math.min(30 - startDay.date() + 1, moment().date() - startDay.date() + 1) / 30;
        baselineDays = Math.round(currentMonthFraction * customExpectedDays);
      }
    } else if (startDay.isAfter(moment(month, 'YYYY-MM').endOf('month'))) {
      baselineDays = 0;
    } else if (isCurrentMonth) {
      const currentMonthFraction = Math.min(30, moment().date()) / 30;
      baselineDays = Math.round(currentMonthFraction * customExpectedDays);
    }

    if (baselineDays === 0 && startDay.isSame(startOfMonth, 'month')) {
      const hasStarted = !isCurrentMonth || startDay.date() <= moment().date();
      if (hasStarted) baselineDays = 1;
    }

    if (baselineDays < 0) baselineDays = 0;
    const absences = Math.max(0, baselineDays - presentDays);

    // Auto-sync draft payroll records with real-time calculated breakdown
    if (existingPayroll && !frozen) {
      existingPayroll.fixedSalaryEarned = breakdown.fixedSalaryEarned;
      existingPayroll.hourlySalaryEarned = breakdown.hourlySalaryEarned;
      existingPayroll.commissionEarned = breakdown.commissionEarned;
      existingPayroll.bonusEarned = breakdown.bonusEarned;
      existingPayroll.totalEarned = breakdown.totalEarned;
      existingPayroll.status = parseFloat(existingPayroll.totalPaid) >= breakdown.totalEarned && parseFloat(existingPayroll.totalPaid) > 0
        ? 'paid'
        : (parseFloat(existingPayroll.totalPaid) > 0 ? 'partially_paid' : 'draft');
      
      const details = existingPayroll.details || {};
      details.logs = breakdown.logs;
      existingPayroll.details = details;
      
      await existingPayroll.save();
    }

    payrollSummaries.push({
      employeeId: emp.id,
      fullName: emp.fullName,
      startDate: emp.startDate,
      absences,
      presentDays,
      breakdown,
      frozen,
      paymentArchive: existingPayroll ? {
        totalPaid: parseFloat(existingPayroll.totalPaid) || 0,
        status: existingPayroll.status,
        confirmedAt: existingPayroll.confirmedAt || null,
        payments: existingPayroll.payments || [],
        adjustments: existingPayroll.adjustments || []
      } : { totalPaid: 0, status: 'draft', confirmedAt: null, payments: [], adjustments: [] }
    });
  }

  res.status(200).json({
    status: 'success',
    data: { month, summaries: payrollSummaries },
  });
});

exports.getEmployeePayrollHistory = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const payrolls = await Payroll.findAll({
    where: { employeeId },
    include: ['payments', 'adjustments'],
    order: [['month', 'DESC']]
  });

  const history = payrolls.map(p => ({
    id: p.id,
    month: p.month,
    fixedSalaryEarned: parseFloat(p.fixedSalaryEarned) || 0,
    hourlySalaryEarned: parseFloat(p.hourlySalaryEarned) || 0,
    commissionEarned: parseFloat(p.commissionEarned) || 0,
    bonusEarned: parseFloat(p.bonusEarned) || 0,
    totalEarned: parseFloat(p.totalEarned) || 0,
    totalPaid: parseFloat(p.totalPaid) || 0,
    status: p.status,
    confirmedAt: p.confirmedAt || null,
    settingsSnapshot: p.settingsSnapshot || null,
    payments: p.payments || [],
    adjustments: p.adjustments || [],
    logs: p.details && p.details.logs ? p.details.logs : []
  }));

  res.status(200).json({
    status: 'success',
    data: {
      employee: {
        id: employee.id,
        fullName: employee.fullName
      },
      history
    }
  });
});

// Confirm payroll — freezes the calculated values so future setting changes don't affect them
exports.confirmPayroll = catchAsync(async (req, res, next) => {
  const { employeeId, month } = req.body;

  if (!month) {
    return next(new AppError('Please provide a month (e.g., "2026-06")', 400));
  }

  // If employeeId is provided, confirm single employee. Otherwise, confirm all.
  const employeeIds = [];
  if (employeeId) {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return next(new AppError('Employee not found', 404));
    }
    employeeIds.push(employeeId);
  } else {
    // Bulk confirm: get all active employees
    const employees = await Employee.findAll({
      where: { status: { [Op.ne]: 'deleted' } },
      attributes: ['id']
    });
    employees.forEach(e => employeeIds.push(e.id));
  }

  const confirmed = [];
  const skipped = [];

  for (const empId of employeeIds) {
    // Check if payroll already exists and is frozen
    let payroll = await Payroll.findOne({
      where: { employeeId: empId, month },
      include: ['payments', 'adjustments']
    });

    if (payroll && isFrozen(payroll.status)) {
      skipped.push({ employeeId: empId, reason: `Already ${payroll.status}` });
      continue;
    }

    // Calculate final breakdown
    const breakdown = await calculateSalaryBreakdown(empId, month);

    // Get the current payment settings to snapshot
    const settings = await EmployeePaymentSetting.findAll({ where: { employeeId: empId } });
    const settingsSnapshot = settings.map(s => ({
      type: s.type,
      value: s.value,
      procedureId: s.procedureId,
      description: s.description,
      expectedDays: s.expectedDays
    }));

    if (!payroll) {
      // Create new confirmed payroll
      payroll = await Payroll.create({
        employeeId: empId,
        month,
        fixedSalaryEarned: breakdown.fixedSalaryEarned,
        hourlySalaryEarned: breakdown.hourlySalaryEarned,
        commissionEarned: breakdown.commissionEarned,
        bonusEarned: breakdown.bonusEarned,
        totalEarned: breakdown.totalEarned,
        totalPaid: 0,
        status: 'confirmed',
        confirmedAt: new Date(),

        settingsSnapshot,
        details: { logs: breakdown.logs }
      });
    } else {
      // Update existing draft payroll to confirmed
      payroll.fixedSalaryEarned = breakdown.fixedSalaryEarned;
      payroll.hourlySalaryEarned = breakdown.hourlySalaryEarned;
      payroll.commissionEarned = breakdown.commissionEarned;
      payroll.bonusEarned = breakdown.bonusEarned;
      payroll.totalEarned = breakdown.totalEarned;
      payroll.status = 'confirmed';
      payroll.confirmedAt = new Date();

      payroll.settingsSnapshot = settingsSnapshot;
      payroll.details = { logs: breakdown.logs };
      await payroll.save();
    }

    confirmed.push({
      employeeId: empId,
      payrollId: payroll.id,
      totalEarned: breakdown.totalEarned
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      month,
      confirmed,
      skipped,
      message: `Confirmed ${confirmed.length} payroll(s), skipped ${skipped.length}`
    }
  });
});

// Unlock payroll — reverts a confirmed payroll back to draft for corrections
exports.unlockPayroll = catchAsync(async (req, res, next) => {
  const { employeeId, month } = req.body;

  if (!employeeId || !month) {
    return next(new AppError('Please provide employeeId and month', 400));
  }

  const payroll = await Payroll.findOne({
    where: { employeeId, month }
  });

  if (!payroll) {
    return next(new AppError('Payroll record not found', 404));
  }

  if (payroll.status === 'paid' || payroll.status === 'partially_paid') {
    return next(new AppError('Cannot unlock a payroll that has payments. Status: ' + payroll.status, 400));
  }

  if (payroll.status === 'draft') {
    return next(new AppError('Payroll is already in draft status', 400));
  }

  // Revert to draft
  payroll.status = 'draft';
  payroll.confirmedAt = null;

  payroll.settingsSnapshot = null;
  await payroll.save();

  res.status(200).json({
    status: 'success',
    data: { payroll },
    message: 'Payroll unlocked and reverted to draft. It will now recalculate from current settings.'
  });
});

exports.payEmployee = catchAsync(async (req, res, next) => {
  const { employeeId, month, paymentAmount, notes } = req.body;

  if (!employeeId || !month || paymentAmount === undefined) {
    return next(new AppError('Please provide employeeId, month, and paymentAmount', 400));
  }

  const breakdown = await calculateSalaryBreakdown(employeeId, month);

  let payroll = await Payroll.findOne({ where: { employeeId, month } });

  // Get settings snapshot for auto-confirm
  const settings = await EmployeePaymentSetting.findAll({ where: { employeeId } });
  const settingsSnapshot = settings.map(s => ({
    type: s.type,
    value: s.value,
    procedureId: s.procedureId,
    description: s.description,
    expectedDays: s.expectedDays
  }));

  if (!payroll) {
    // Auto-confirm on first payment: create as confirmed with the payment
    const newTotalPaid = parseFloat(paymentAmount);
    payroll = await Payroll.create({
      employeeId,
      month,
      fixedSalaryEarned: breakdown.fixedSalaryEarned,
      hourlySalaryEarned: breakdown.hourlySalaryEarned,
      commissionEarned: breakdown.commissionEarned,
      bonusEarned: breakdown.bonusEarned,
      totalEarned: breakdown.totalEarned,
      totalPaid: newTotalPaid,
      status: newTotalPaid >= breakdown.totalEarned ? 'paid' : 'partially_paid',
      confirmedAt: new Date(),

      settingsSnapshot,
      details: { logs: breakdown.logs }
    });
  } else {
    // If still draft, auto-confirm before accepting payment
    if (payroll.status === 'draft') {
      payroll.fixedSalaryEarned = breakdown.fixedSalaryEarned;
      payroll.hourlySalaryEarned = breakdown.hourlySalaryEarned;
      payroll.commissionEarned = breakdown.commissionEarned;
      payroll.bonusEarned = breakdown.bonusEarned;
      payroll.totalEarned = breakdown.totalEarned;
      payroll.confirmedAt = new Date();
      payroll.settingsSnapshot = settingsSnapshot;
    }

    payroll.totalPaid = parseFloat(payroll.totalPaid) + parseFloat(paymentAmount);
    payroll.status = payroll.totalPaid >= parseFloat(payroll.totalEarned) ? 'paid' : (payroll.totalPaid > 0 ? 'partially_paid' : 'confirmed');
    payroll.details = { logs: breakdown.logs };
    await payroll.save();
  }

  const payment = await PayrollPayment.create({
    payrollId: payroll.id,
    amount: parseFloat(paymentAmount),
    date: new Date(),
    notes: notes || ''
  });

  res.status(200).json({
    status: 'success',
    data: { payroll, payment },
  });
});

exports.addAdjustment = catchAsync(async (req, res, next) => {
  const { employeeId, month, amount, description } = req.body;

  if (!employeeId || !month || amount === undefined) {
    return next(new AppError('Please provide employeeId, month, and amount', 400));
  }

  let payroll = await Payroll.findOne({ where: { employeeId, month } });

  // Don't allow adjustments on frozen payrolls (must unlock first)
  if (payroll && isFrozen(payroll.status)) {
    return next(new AppError(`Cannot add adjustment to a ${payroll.status} payroll. Unlock it first.`, 400));
  }

  const breakdown = await calculateSalaryBreakdown(employeeId, month);

  if (!payroll) {
    const updatedBonus = breakdown.bonusEarned + parseFloat(amount);
    const updatedTotal = breakdown.totalEarned + parseFloat(amount);

    payroll = await Payroll.create({
      employeeId,
      month,
      fixedSalaryEarned: breakdown.fixedSalaryEarned,
      hourlySalaryEarned: breakdown.hourlySalaryEarned,
      commissionEarned: breakdown.commissionEarned,
      bonusEarned: updatedBonus,
      totalEarned: updatedTotal,
      totalPaid: 0,
      status: 'draft',
      details: { logs: breakdown.logs }
    });
  } else {
    payroll.bonusEarned = parseFloat(payroll.bonusEarned) + parseFloat(amount);
    payroll.totalEarned = parseFloat(payroll.totalEarned) + parseFloat(amount);
    payroll.details = { logs: breakdown.logs };
    await payroll.save();
  }

  const adjustment = await PayrollAdjustment.create({
    payrollId: payroll.id,
    amount: parseFloat(amount),
    description: description || 'One-time adjustment',
    date: new Date()
  });

  res.status(200).json({
    status: 'success',
    data: { payroll, adjustment }
  });
});
