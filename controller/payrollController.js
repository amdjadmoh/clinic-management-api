const Employee = require('../models/Employee');
const EmployeePaymentSetting = require('../models/EmployeePaymentSetting');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const PayrollPayment = require('../models/PayrollPayment');
const PayrollAdjustment = require('../models/PayrollAdjustment');
const DoctorWorkLog = require('../models/DoctorLog');
const Leave = require('../models/Leave');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

// Calculation core helper
const calculateSalaryBreakdown = async (employeeId, month) => {
  const employee = await Employee.findByPk(employeeId, {
    include: [{ model: EmployeePaymentSetting }],
  });

  if (!employee) {
    throw new Error('Employee not found');
  }

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
    const days = leaveEnd.diff(leaveStart, 'days') + 1;
    if (days > 0) {
      if (l.type === 'unpaid') {
        unpaidLeaveDays += days;
      } else {
        paidLeaveDays += days;
      }
    }
  });

  if (paidLeaveDays > 0) {
    logs.push(`Approved Paid Leaves: ${paidLeaveDays} days (Excused and fully paid)`);
  }
  if (unpaidLeaveDays > 0) {
    logs.push(`Approved Unpaid Leaves: ${unpaidLeaveDays} days (Salary docked)`);
  }

  for (const setting of employee.employee_payment_settings) {
    const { type, value, procedureId } = setting;
    const numericValue = parseFloat(value) || 0;

    if (type === 'fixed_monthly') {
      const startDay = moment(employee.startDate, 'YYYY-MM-DD');
      const customExpectedDays = setting.expectedDays || 30;

      let baselineDays = customExpectedDays;
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

      if (baselineDays < 0) baselineDays = 0;

      // Add paidLeaveDays to presentDays to count them as worked/excused, and unpaid leaves dock baseline working days
      const presentDays = attendances.filter(a => a.status === 'present').length + paidLeaveDays;
      
      // Unpaid leaves dock baseline days
      let adjustedBaseline = Math.max(0, baselineDays - unpaidLeaveDays);
      const absencesCount = Math.max(0, adjustedBaseline - presentDays);
      const workedDays = Math.max(0, adjustedBaseline - absencesCount);

      const dailyRate = numericValue / customExpectedDays;
      const earned = workedDays * dailyRate;

      fixedSalaryEarned += earned;
      logs.push(`Fixed Monthly: Worked days=${workedDays} (Base=${baselineDays}, Adjusted Base=${adjustedBaseline}, Paid Leaves=${paidLeaveDays}, Absences=${absencesCount}), Daily Rate=${dailyRate.toFixed(2)}, Earned=${earned.toFixed(2)}`);
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
      const doctorLogs = await DoctorWorkLog.findAll({
        where: {
          doctorID: employee.doctorId,
          date: {
            [Op.between]: [startOfMonth.format('YYYY-MM-DD 00:00:00'), endOfMonth.format('YYYY-MM-DD 23:59:59')],
          }
        }
      });

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
        }
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

    if (type === 'fixed_extra_bonus' || type === 'non_fixed_bonus') {
      bonusEarned += numericValue;
      logs.push(`Bonus (${type}): Amount=${numericValue}`);
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

exports.calculateAndGetSalarySummary = catchAsync(async (req, res, next) => {
  const { month } = req.query; // YYYY-MM
  if (!month) {
    return next(new AppError('Please provide a month in query parameter, e.g., ?month=2026-05', 400));
  }

  const employees = await Employee.findAll({
    include: [{ model: EmployeePaymentSetting }],
  });

  const payrollSummaries = [];

  for (const emp of employees) {
    let breakdown = await calculateSalaryBreakdown(emp.id, month);

    const existingPayroll = await Payroll.findOne({
      where: { employeeId: emp.id, month },
      include: ['payments', 'adjustments']
    });

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

    if (existingPayroll && existingPayroll.status === 'paid' && !isCurrentMonth) {
      breakdown = {
        fixedSalaryEarned: Math.round(parseFloat(existingPayroll.fixedSalaryEarned) || 0),
        hourlySalaryEarned: Math.round(parseFloat(existingPayroll.hourlySalaryEarned) || 0),
        commissionEarned: Math.round(parseFloat(existingPayroll.commissionEarned) || 0),
        bonusEarned: Math.round(parseFloat(existingPayroll.bonusEarned) || 0),
        totalEarned: Math.round(parseFloat(existingPayroll.totalEarned) || 0),
        logs: existingPayroll.details && existingPayroll.details.logs ? existingPayroll.details.logs : ['Archived payroll']
      };
    }

    // Auto-sync existing active month payroll record with real-time calculated breakdown
    if (existingPayroll && isCurrentMonth) {
      existingPayroll.fixedSalaryEarned = breakdown.fixedSalaryEarned;
      existingPayroll.hourlySalaryEarned = breakdown.hourlySalaryEarned;
      existingPayroll.commissionEarned = breakdown.commissionEarned;
      existingPayroll.bonusEarned = breakdown.bonusEarned;
      existingPayroll.totalEarned = breakdown.totalEarned;
      existingPayroll.status = parseFloat(existingPayroll.totalPaid) >= breakdown.totalEarned ? 'paid' : (parseFloat(existingPayroll.totalPaid) > 0 ? 'partially_paid' : 'unpaid');
      
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
      paymentArchive: existingPayroll ? {
        totalPaid: parseFloat(existingPayroll.totalPaid) || 0,
        status: existingPayroll.status,
        payments: existingPayroll.payments || [],
        adjustments: existingPayroll.adjustments || []
      } : { totalPaid: 0, status: 'unpaid', payments: [], adjustments: [] }
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

exports.payEmployee = catchAsync(async (req, res, next) => {
  const { employeeId, month, paymentAmount, notes } = req.body;

  if (!employeeId || !month || paymentAmount === undefined) {
    return next(new AppError('Please provide employeeId, month, and paymentAmount', 400));
  }

  const breakdown = await calculateSalaryBreakdown(employeeId, month);

  let payroll = await Payroll.findOne({ where: { employeeId, month } });

  if (!payroll) {
    payroll = await Payroll.create({
      employeeId,
      month,
      fixedSalaryEarned: breakdown.fixedSalaryEarned,
      hourlySalaryEarned: breakdown.hourlySalaryEarned,
      commissionEarned: breakdown.commissionEarned,
      bonusEarned: breakdown.bonusEarned,
      totalEarned: breakdown.totalEarned,
      totalPaid: paymentAmount,
      status: paymentAmount >= breakdown.totalEarned ? 'paid' : (paymentAmount > 0 ? 'partially_paid' : 'unpaid'),
      details: { logs: breakdown.logs }
    });
  } else {
    payroll.totalPaid = parseFloat(payroll.totalPaid) + parseFloat(paymentAmount);
    payroll.status = payroll.totalPaid >= payroll.totalEarned ? 'paid' : (payroll.totalPaid > 0 ? 'partially_paid' : 'unpaid');
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
      status: 'unpaid',
      details: { logs: breakdown.logs }
    });
  } else {
    payroll.bonusEarned = parseFloat(payroll.bonusEarned) + parseFloat(amount);
    payroll.totalEarned = parseFloat(payroll.totalEarned) + parseFloat(amount);
    payroll.status = payroll.totalPaid >= payroll.totalEarned ? 'paid' : (payroll.totalPaid > 0 ? 'partially_paid' : 'unpaid');
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
    data: { payroll }
  });
});
