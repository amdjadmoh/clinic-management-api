const Employee = require('../models/Employee');
const Job = require('../models/Job');
const EmployeePaymentSetting = require('../models/EmployeePaymentSetting');
const EmployeeSchedule = require('../models/EmployeeSchedule');
const Attendance = require('../models/Attendance');
const Dep = require('../models/Dep');
const File = require('../models/Files');
const EmployeeFile = require('../models/EmployeeFile');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const uploadDirRoot = process.env.FILE_UPLOAD_DIR 
  ? process.env.FILE_UPLOAD_DIR.trim().replace(/^"(.*)"$/, '$1')
  : __dirname;

const employeeUploadStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(uploadDirRoot, 'uploads', 'employee_documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

exports.uploadEmployeeFileMiddleware = multer({
  storage: employeeUploadStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}).single('file');

// Jobs
exports.createJob = catchAsync(async (req, res, next) => {
  const { name, description, defaultSettings } = req.body;
  const newJob = await Job.create({ name, description, defaultSettings });

  res.status(201).json({
    status: 'success',
    data: { job: newJob },
  });
});

exports.getJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.findAll();
  res.status(200).json({
    status: 'success',
    data: { jobs },
  });
});

exports.getJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { job },
  });
});

exports.updateJob = catchAsync(async (req, res, next) => {
  const { name, description, defaultSettings } = req.body;
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }
  job.name = name !== undefined ? name : job.name;
  job.description = description !== undefined ? description : job.description;
  job.defaultSettings = defaultSettings !== undefined ? defaultSettings : job.defaultSettings;
  await job.save();

  res.status(200).json({
    status: 'success',
    data: { job },
  });
});

exports.deleteJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return next(new AppError('Job not found', 404));
  }
  await job.destroy();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Employees
exports.createEmployee = catchAsync(async (req, res, next) => {
  const { fullName, userId, doctorId, jobId, startDate, status, zktecoId, phoneNumber, depId, bankAccountNumber, socialSecurityNumber } = req.body;
  const employee = await Employee.create({ fullName, userId, doctorId, jobId, startDate, status, zktecoId, phoneNumber, depId, bankAccountNumber, socialSecurityNumber });

  // If a jobId is provided, find the job to get its default settings
  if (jobId) {
    const job = await Job.findByPk(jobId);
    if (job && job.defaultSettings && Array.isArray(job.defaultSettings)) {
      // Add job defaultSettings into EmployeePaymentSetting for this employee
      for (const setting of job.defaultSettings) {
        await EmployeePaymentSetting.create({
          employeeId: employee.id,
          type: setting.type,
          value: setting.value || 0,
          procedureId: setting.procedureId || null,
          description: setting.description || '',
          expectedDays: setting.expectedDays || 30,
        });
      }
    }
  }

  res.status(201).json({
    status: 'success',
    data: { employee },
  });
});

exports.getEmployees = catchAsync(async (req, res, next) => {
  const employees = await Employee.findAll({
    where: {
      status: { [Op.ne]: 'deleted' }
    },
    include: [
      { model: Job },
      { model: EmployeePaymentSetting },
      { model: Dep }
    ],
  });
  res.status(200).json({
    status: 'success',
    data: { employees },
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id, {
    include: [
      { model: Job },
      { model: EmployeePaymentSetting },
      { model: Dep }
    ],
  });
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { employee },
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const { fullName, userId, doctorId, jobId, startDate, status, zktecoId, phoneNumber, depId, bankAccountNumber, socialSecurityNumber } = req.body;
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const oldJobId = employee.jobId;

  employee.fullName = fullName !== undefined ? fullName : employee.fullName;
  employee.userId = userId !== undefined ? userId : employee.userId;
  employee.doctorId = doctorId !== undefined ? doctorId : employee.doctorId;
  employee.jobId = jobId !== undefined ? jobId : employee.jobId;
  employee.startDate = startDate !== undefined ? startDate : employee.startDate;
  employee.status = status !== undefined ? status : employee.status;
  employee.zktecoId = zktecoId !== undefined ? zktecoId : employee.zktecoId;
  employee.phoneNumber = phoneNumber !== undefined ? phoneNumber : employee.phoneNumber;
  employee.depId = depId !== undefined ? depId : employee.depId;
  employee.bankAccountNumber = bankAccountNumber !== undefined ? bankAccountNumber : employee.bankAccountNumber;
  employee.socialSecurityNumber = socialSecurityNumber !== undefined ? socialSecurityNumber : employee.socialSecurityNumber;
  await employee.save();

  // If jobId changed, fetch new job defaultSettings and override employee settings
  if (jobId && jobId !== oldJobId) {
    const job = await Job.findByPk(jobId);
    if (job && job.defaultSettings && Array.isArray(job.defaultSettings)) {
      // Clear existing settings
      await EmployeePaymentSetting.destroy({ where: { employeeId: employee.id } });

      // Add job defaultSettings into EmployeePaymentSetting for this employee
      for (const setting of job.defaultSettings) {
        await EmployeePaymentSetting.create({
          employeeId: employee.id,
          type: setting.type,
          value: setting.value || 0,
          procedureId: setting.procedureId || null,
          description: setting.description || '',
          expectedDays: setting.expectedDays || 30,
        });
      }
    }
  }

  res.status(200).json({
    status: 'success',
    data: { employee },
  });
});

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }
  employee.status = 'deleted';
  await employee.save();
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getEmployeeFiles = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const files = await EmployeeFile.findAll({
    where: { employeeId },
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: files.length,
    data: {
      files
    }
  });
});

exports.uploadEmployeeFile = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;
  const { documentType, description } = req.body;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return next(new AppError('Employee not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please provide a file to upload', 400));
  }

  const employeeFile = await EmployeeFile.create({
    employeeId,
    filename: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    documentType: documentType || 'other',
    description: description || null
  });

  res.status(201).json({
    status: 'success',
    data: {
      file: employeeFile
    }
  });
});

exports.downloadEmployeeFile = catchAsync(async (req, res, next) => {
  const { id, fileId } = req.params;

  const employeeFile = await EmployeeFile.findOne({
    where: {
      id: fileId,
      employeeId: id
    }
  });

  if (!employeeFile) {
    return next(new AppError('Employee file not found', 404));
  }

  if (!fs.existsSync(employeeFile.filePath)) {
    return next(new AppError('Physical file not found on the server', 404));
  }

  res.setHeader('Content-Disposition', `attachment; filename="${employeeFile.filename}"`);
  res.setHeader('Content-Type', employeeFile.fileType);

  const fileStream = fs.createReadStream(employeeFile.filePath);
  fileStream.pipe(res);
});

exports.deleteEmployeeFile = catchAsync(async (req, res, next) => {
  const { id, fileId } = req.params;

  const employeeFile = await EmployeeFile.findOne({
    where: {
      id: fileId,
      employeeId: id
    }
  });

  if (!employeeFile) {
    return next(new AppError('Employee file not found', 404));
  }

  await employeeFile.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Overriding / configuring specific employee payment settings
exports.updateEmployeePaymentSettings = catchAsync(async (req, res, next) => {
  const { employeeId } = req.params;
  const { settings } = req.body;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  // Clear existing settings
  await EmployeePaymentSetting.destroy({ where: { employeeId } });

  // Bulk create new ones
  if (settings && Array.isArray(settings)) {
    for (const s of settings) {
      await EmployeePaymentSetting.create({
        employeeId,
        type: s.type,
        value: s.value,
        procedureId: s.procedureId || null,
        description: s.description || null,
        expectedDays: s.expectedDays || 30,
      });
    }
  }

  const updatedSettings = await EmployeePaymentSetting.findAll({ where: { employeeId } });

  res.status(200).json({
    status: 'success',
    data: { settings: updatedSettings },
  });
});

// Attendance tracking
exports.recordAttendance = catchAsync(async (req, res, next) => {
  const { employeeId, date, clockIn, clockOut, status } = req.body;

  let attendance = await Attendance.findOne({ where: { employeeId, date } });

  let hoursWorked = 0;
  if (clockIn && clockOut) {
    const checkInTime = moment(`${date} ${clockIn}`, 'YYYY-MM-DD HH:mm:ss');
    const checkOutTime = moment(`${date} ${clockOut}`, 'YYYY-MM-DD HH:mm:ss');
    const duration = moment.duration(checkOutTime.diff(checkInTime));
    hoursWorked = duration.asHours();
    if (hoursWorked < 0) hoursWorked = 0;
  }

  if (attendance) {
    attendance.clockIn = clockIn || attendance.clockIn;
    attendance.clockOut = clockOut || attendance.clockOut;
    attendance.status = status || attendance.status;
    attendance.hoursWorked = hoursWorked || attendance.hoursWorked;
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      employeeId,
      date,
      clockIn,
      clockOut,
      status: status || 'present',
      hoursWorked,
    });
  }

  res.status(200).json({
    status: 'success',
    data: { attendance },
  });
});

exports.getEmployeeAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { startDate, endDate, month } = req.query;
  const { Op } = require('sequelize');

  const whereClause = { employeeId: id };

  if (month) {
    const start = moment(month, 'YYYY-MM').startOf('month').format('YYYY-MM-DD');
    const end = moment(month, 'YYYY-MM').endOf('month').format('YYYY-MM-DD');
    whereClause.date = { [Op.between]: [start, end] };
  } else if (startDate && endDate) {
    whereClause.date = { [Op.between]: [startDate, endDate] };
  }

  const attendances = await Attendance.findAll({
    where: whereClause,
    order: [['date', 'DESC']],
  });

  res.status(200).json({
    status: 'success',
    data: { attendances },
  });
});

// Schedule CRUD
exports.getSchedule = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  const schedule = await EmployeeSchedule.findAll({
    where: { employeeId },
    order: [['dayOfWeek', 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    data: { schedule }
  });
});

exports.setSchedule = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;
  const { schedule } = req.body; // array of { dayOfWeek, startTime, endTime }

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  if (!schedule || !Array.isArray(schedule)) {
    return next(new AppError('Please provide a schedule array with { dayOfWeek, startTime, endTime } objects', 400));
  }

  // Validate entries
  for (const entry of schedule) {
    if (entry.dayOfWeek === undefined || !entry.startTime || !entry.endTime) {
      return next(new AppError('Each schedule entry must have dayOfWeek (0-6), startTime, and endTime', 400));
    }
    if (entry.dayOfWeek < 0 || entry.dayOfWeek > 6) {
      return next(new AppError('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)', 400));
    }
  }

  // Replace existing schedule
  await EmployeeSchedule.destroy({ where: { employeeId } });

  const created = [];
  for (const entry of schedule) {
    const row = await EmployeeSchedule.create({
      employeeId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime
    });
    created.push(row);
  }

  res.status(200).json({
    status: 'success',
    data: { schedule: created }
  });
});

exports.deleteSchedule = catchAsync(async (req, res, next) => {
  const employeeId = req.params.id;

  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    return next(new AppError('Employee not found', 404));
  }

  await EmployeeSchedule.destroy({ where: { employeeId } });

  res.status(204).json({
    status: 'success',
    data: null
  });
});
