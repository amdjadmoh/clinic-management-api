const fs = require('fs');
const path = require('path');
const ZKLib = require('node-zklib');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment-timezone');
const { Op } = require('sequelize');

exports.syncZktecoLogsFunction = async (deviceIp = '192.168.1.55', port = 4370) => {
  let logs = [];

  // Determine fallback startDate: '2026-01-01' if very first data sync, else today
  const hasAttendanceLogs = await Attendance.count();
  const defaultStartDate = hasAttendanceLogs === 0 ? '2026-01-01' : moment().format('YYYY-MM-DD');

  if (process.env.NODE_ENV !== 'production') {
    // ----------------------------------------------------
    // DEVELOPMENT MODE: Use local files to sync
    // ----------------------------------------------------
    
    // 1. Auto-import Users from USERINFO.csv into Employees if they don't exist
    const userinfoPath = path.join(__dirname, '../mdb_exports/USERINFO.csv');
    if (fs.existsSync(userinfoPath)) {
      const userInfoContent = fs.readFileSync(userinfoPath, 'utf8');
      const userRows = userInfoContent.split('\n').map(r => r.trim()).filter(Boolean);

      for (let i = 1; i < userRows.length; i++) {
        const cols = userRows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 4) {
          const userId = cols[0];
          const name = cols[3].replace(/"/g, '');

          if (!name || name === userId) continue;

          const existing = await Employee.findOne({ where: { zktecoId: String(userId) } });
          if (!existing) {
            const hiredDayRaw = cols[8] ? cols[8].replace(/"/g, '') : null;
            let startDate = defaultStartDate;

            if (hiredDayRaw) {
              const parsedHired = moment(hiredDayRaw, 'MM/DD/YY');
              if (parsedHired.isValid()) {
                startDate = parsedHired.format('YYYY-MM-DD');
              }
            }

            await Employee.create({
              fullName: name,
              zktecoId: String(userId),
              startDate,
              status: 'active'
            });
            console.log(`✔ Auto-Created Employee during sync: ${name} (zktecoId: ${userId})`);
          }
        }
      }
    }

    // 2. Read logs from CHECKINOUT.csv
    const checkinoutPath = path.join(__dirname, '../mdb_exports/CHECKINOUT.csv');
    if (fs.existsSync(checkinoutPath)) {
      const checkinoutContent = fs.readFileSync(checkinoutPath, 'utf8');
      const rows = checkinoutContent.split('\n').map(r => r.trim()).filter(Boolean);

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 2) {
          const userId = cols[0];
          const rawTime = cols[1].replace(/"/g, ''); // e.g. "02/05/25 11:55:28"
          
          let checkTime = moment(rawTime, 'MM/DD/YY HH:mm:ss');
          if (!checkTime.isValid()) {
            checkTime = moment(rawTime, 'MM/DD/YYYY HH:mm:ss');
          }

          if (checkTime.isValid()) {
            logs.push({
              deviceUserId: String(userId),
              recordTime: checkTime.format('YYYY-MM-DD HH:mm:ss')
            });
          }
        }
      }
      console.log(`✔ Read ${logs.length} attendance records from CHECKINOUT.csv`);
    } else {
      console.log(`✖ CSV File not found at: ${checkinoutPath}`);
    }

  } else {
    // ----------------------------------------------------
    // PRODUCTION MODE: Connect to actual ZKTeco device IP
    // ----------------------------------------------------
    const zkInstance = new ZKLib(deviceIp, port, 4000, 4000);
    try {
      await zkInstance.createSocket();
      
      // Auto-import Users from ZKTeco device into Employees if they don't exist
      const users = await zkInstance.getUsers();
      if (users && users.length > 0) {
        for (const user of users) {
          const userId = user.userId || user.uid;
          const name = user.name;
          if (!name || !userId) continue;

          const existing = await Employee.findOne({ where: { zktecoId: String(userId) } });
          if (!existing) {
            await Employee.create({
              fullName: name,
              zktecoId: String(userId),
              startDate: defaultStartDate,
              status: 'active'
            });
            console.log(`✔ Auto-Created Employee from device during sync: ${name} (zktecoId: ${userId})`);
          }
        }
      }

      logs = await zkInstance.getAttendances();
      await zkInstance.disconnect();
    } catch (error) {
      console.error('Error connecting to ZKTeco device:', error);
      throw error;
    }
  }

  if (!logs || logs.length === 0) {
    return 0;
  }

  // Iterate over logs and map them to our employees via zktecoId
  const groupedLogs = {}; // e.g. { "empId_YYYY-MM-DD": [scan times...] }

  const employees = await Employee.findAll({
    where: {
      zktecoId: { [Op.ne]: null }
    }
  });

  if (employees.length === 0) {
    return 0;
  }

  logs.forEach(log => {
    const zktecoId = log.deviceUserId || log.uid;
    const employee = employees.find(e => e.zktecoId === String(zktecoId));
    if (employee) {
      const logTime = moment(log.recordTime);
      const dateStr = logTime.format('YYYY-MM-DD');
      const key = `${employee.id}_${dateStr}`;
      
      if (!groupedLogs[key]) {
        groupedLogs[key] = {
          employeeId: employee.id,
          date: dateStr,
          scans: []
        };
      }
      groupedLogs[key].scans.push(logTime);
    }
  });

  let syncedCount = 0;

  for (const key in groupedLogs) {
    const { employeeId, date, scans } = groupedLogs[key];
    
    scans.sort((a, b) => a.diff(b));
    const firstScan = scans[0];
    const lastScan = scans[scans.length - 1];

    const clockInStr = firstScan.format('HH:mm:ss');
    const clockOutStr = scans.length > 1 ? lastScan.format('HH:mm:ss') : null;

    let hoursWorked = 0;
    if (scans.length > 1) {
      const duration = moment.duration(lastScan.diff(firstScan));
      hoursWorked = parseFloat(duration.asHours().toFixed(2));
      if (hoursWorked < 0) hoursWorked = 0;
    }

    let attendance = await Attendance.findOne({ where: { employeeId, date } });

    if (attendance) {
      attendance.clockIn = attendance.clockIn || clockInStr;
      attendance.clockOut = clockOutStr || attendance.clockOut;
      attendance.hoursWorked = hoursWorked > 0 ? hoursWorked : attendance.hoursWorked;
      await attendance.save();
    } else {
      await Attendance.create({
        employeeId,
        date,
        clockIn: clockInStr,
        clockOut: clockOutStr,
        status: 'present',
        hoursWorked,
      });
    }
    syncedCount++;
  }

  return syncedCount;
};

exports.syncZktecoLogs = catchAsync(async (req, res, next) => {
  const deviceIp = req && req.body && req.body.deviceIp ? req.body.deviceIp : '192.168.1.55';
  const port = req && req.body && req.body.port ? req.body.port : 4370;

  try {
    const syncedCount = await exports.syncZktecoLogsFunction(deviceIp, port);
    res.status(200).json({
      status: 'success',
      message: `Attendance logs synchronized successfully (Dev: CSV, Prod: IP 192.168.1.55).`,
      data: { syncedCount }
    });
  } catch (err) {
    return next(new AppError(`Error fetching logs from ZKTeco device: ${err.message}`, 500));
  }
});
