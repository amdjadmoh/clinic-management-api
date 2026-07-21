const fs = require('fs');
const path = require('path');
const ZKLib = require('node-zklib');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const moment = require('moment-timezone');
const { Op, fn, col, literal } = require('sequelize');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Two consecutive scans of the same type within this window are duplicates. */
const DUPLICATE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a moment object as "YYYY-MM-DD HH:mm:ss" for storage.
 * @param {moment.Moment} m
 * @returns {string}
 */
const fmtDatetime = (m) => m.format('YYYY-MM-DD HH:mm:ss');

/**
 * Upsert a single attendance shift record.
 *
 * Unique key: (employeeId, clockIn)
 *   - If clockIn is provided → use findOrCreate on (employeeId, clockIn).
 *     If the row already exists and clockOut changed, update it.
 *   - If clockIn is null (O without I) → always create a new row
 *     (no unique key can be formed; idempotency is handled upstream by the
 *      incremental watermark which skips already-seen logs).
 *
 * @param {number} employeeId
 * @param {moment.Moment|null} clockInMoment
 * @param {moment.Moment|null} clockOutMoment
 * @returns {Promise<void>}
 */
const upsertAttendance = async (employeeId, clockInMoment, clockOutMoment) => {
  const dateMoment = clockInMoment || clockOutMoment;
  const date = dateMoment.format('YYYY-MM-DD');

  const clockInStr = clockInMoment ? fmtDatetime(clockInMoment) : null;
  const clockOutStr = clockOutMoment ? fmtDatetime(clockOutMoment) : null;

  let hoursWorked = 0;
  if (clockInMoment && clockOutMoment) {
    const rawHours = clockOutMoment.diff(clockInMoment, 'hours', true);
    if (rawHours < 0) {
      // clockOut is before clockIn — data anomaly, log and set to 0
      console.warn(
        `  ⚠ hoursWorked < 0 for employee ${employeeId}: clockIn=${fmtDatetime(clockInMoment)} clockOut=${fmtDatetime(clockOutMoment)} — setting to 0`
      );
      hoursWorked = 0;
    } else {
      // DECIMAL(5,2) max = 999.99 — cap to avoid DB overflow
      hoursWorked = parseFloat(Math.min(rawHours, 999.99).toFixed(2));
    }
  }

  if (clockInStr) {
    // findOrCreate by (employeeId, clockIn)
    const [row, created] = await Attendance.findOrCreate({
      where: { employeeId, clockIn: clockInStr },
      defaults: {
        date,
        clockOut: clockOutStr,
        hoursWorked,
        status: 'present',
      },
    });

    if (!created) {
      // Row existed — update clockOut / hoursWorked if we now have better info
      let needsSave = false;
      if (clockOutStr && row.clockOut !== clockOutStr) {
        row.clockOut = clockOutStr;
        row.hoursWorked = hoursWorked;
        needsSave = true;
      }
      if (needsSave) await row.save();
    }
  } else {
    // O without matching I — create a standalone record.
    // We skip creation if an identical (employeeId, date, clockOut) already exists
    // to avoid re-inserting on repeated full syncs.
    const exists = await Attendance.findOne({
      where: { employeeId, date, clockOut: clockOutStr, clockIn: null },
    });
    if (!exists) {
      await Attendance.create({
        employeeId,
        date,
        clockIn: null,
        clockOut: clockOutStr,
        hoursWorked: 0,
        status: 'present',
      });
    }
  }
};

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------

/**
 * Sync ZKTeco attendance logs for all known employees.
 *
 * Algorithm (state machine per employee, sorted chronologically):
 *   openShift = null
 *   For each scan (checkType ∈ {'I','O'}, checkTime):
 *     1. Skip if same type as last processed AND within DUPLICATE_THRESHOLD_MS
 *     2. If type == 'I':
 *          If openShift open → save it as incomplete (missing clock-out)
 *          Start new openShift = { clockIn: checkTime }
 *     3. If type == 'O':
 *          If openShift open → save complete shift (clockIn + clockOut)
 *          Else              → save incomplete shift (missing clock-in, clockOut only)
 *   After loop:
 *     If openShift still open → save as incomplete (missing clock-out)
 *
 * Incremental sync:
 *   For each employee we determine a watermark = MAX(clockIn, clockOut) already
 *   in the DB.  Only scans AFTER that watermark are processed as new logs.
 *   Additionally, any existing open shift (clockOut IS NULL) from the DB is used
 *   as the initial openShift so an O arriving in a later batch correctly closes it.
 *
 * @param {string} deviceIp
 * @param {number} port
 * @returns {Promise<number>} Number of attendance records created or updated
 */
exports.syncZktecoLogsFunction = async (deviceIp = '192.168.1.55', port = 4370) => {
  /** @type {Array<{deviceUserId: string, checkTime: moment.Moment, checkType: 'I'|'O'}>} */
  let logs = [];

  // ------------------------------------------------------------------
  // Determine start date for first-ever sync fallback
  // ------------------------------------------------------------------
  const hasAttendanceLogs = await Attendance.count();
  const defaultStartDate =
    hasAttendanceLogs === 0 ? '2026-01-01' : moment().format('YYYY-MM-DD');

  if (process.env.NODE_ENV !== 'production') {
    // ----------------------------------------------------------------
    // DEVELOPMENT: Read from CSV files
    // ----------------------------------------------------------------

    // 1. Auto-import users from USERINFO.csv
    const userinfoPath = path.join(__dirname, '../mdb_exports/USERINFO.csv');
    if (fs.existsSync(userinfoPath)) {
      const userInfoContent = fs.readFileSync(userinfoPath, 'utf8');
      const userRows = userInfoContent
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

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
              if (parsedHired.isValid()) startDate = parsedHired.format('YYYY-MM-DD');
            }
            await Employee.create({
              fullName: name,
              zktecoId: String(userId),
              startDate,
              status: 'active',
            });
            console.log(`✔ Auto-Created Employee: ${name} (zktecoId: ${userId})`);
          }
        }
      }
    }

    // 2. Read CHECKINOUT.csv — parse USERID, CHECKTIME, CHECKTYPE
    const checkinoutPath = path.join(__dirname, '../mdb_exports/CHECKINOUT.csv');
    if (fs.existsSync(checkinoutPath)) {
      const checkinoutContent = fs.readFileSync(checkinoutPath, 'utf8');
      const rows = checkinoutContent
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 3) {
          const userId = cols[0];
          const rawTime = cols[1].replace(/"/g, ''); // e.g. "02/05/25 11:55:28"
          const rawType = cols[2].replace(/"/g, '').toUpperCase().trim(); // "I" or "O"

          let checkTime = moment(rawTime, 'MM/DD/YY HH:mm:ss');
          if (!checkTime.isValid()) checkTime = moment(rawTime, 'MM/DD/YYYY HH:mm:ss');

          // Only accept valid timestamps and known punch types
          if (!checkTime.isValid()) {
            console.warn(`⚠ Skipping invalid timestamp for user ${userId}: "${rawTime}"`);
            continue;
          }
          const checkType = rawType === 'O' ? 'O' : 'I'; // Default unknown types to I

          logs.push({ deviceUserId: String(userId), checkTime, checkType });
        }
      }
      console.log(`✔ Read ${logs.length} attendance records from CHECKINOUT.csv`);
    } else {
      console.log(`✖ CSV File not found at: ${checkinoutPath}`);
    }
  } else {
    // ----------------------------------------------------------------
    // PRODUCTION: Connect to ZKTeco device
    // ----------------------------------------------------------------
    const zkInstance = new ZKLib(deviceIp, port, 4000, 4000);
    try {
      await zkInstance.createSocket();

      // Auto-import users from device
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
              status: 'active',
            });
            console.log(`✔ Auto-Created Employee from device: ${name} (zktecoId: ${userId})`);
          }
        }
      }

      // Fetch raw attendance logs from device
      const rawLogs = await zkInstance.getAttendances();
      await zkInstance.disconnect();

      // Map device log format to our normalized shape.
      // ZKLib returns: { deviceUserId, recordTime, type }
      // Device type field: 0 = clock-in (I), 1 = clock-out (O)
      // NOTE: Some firmware variants use different mappings — verify against your device.
      for (const log of rawLogs.data || []) {
        const userId = log.deviceUserId || log.uid;
        const rawTime = log.recordTime;
        const checkTime = moment(rawTime);

        if (!checkTime.isValid()) {
          console.warn(`⚠ Skipping invalid device timestamp for user ${userId}: "${rawTime}"`);
          continue;
        }

        // type 1 (check-out), 2 (break-out), or 5 (overtime-out) → 'O', otherwise (0=check-in, 3=break-in, 4=overtime-in) → 'I'
        const checkType = (log.type === 1 || log.type === 2 || log.type === 5) ? 'O' : 'I';

        logs.push({ deviceUserId: String(userId), checkTime, checkType });
      }
    } catch (error) {
      console.error('Error connecting to ZKTeco device:', error);
      throw error;
    }
  }

  if (!logs || logs.length === 0) {
    console.log('ℹ No attendance logs to process.');
    return 0;
  }

  // ------------------------------------------------------------------
  // Load employees
  // ------------------------------------------------------------------
  const employees = await Employee.findAll({
    where: { zktecoId: { [Op.ne]: null } },
  });

  if (employees.length === 0) {
    console.log('ℹ No employees with zktecoId found — nothing to sync.');
    return 0;
  }

  // Build a lookup: zktecoId → employee
  const employeeByZkId = new Map();
  for (const emp of employees) {
    employeeByZkId.set(emp.zktecoId, emp);
  }

  // ------------------------------------------------------------------
  // Incremental watermark: latest seen datetime per employee
  // ------------------------------------------------------------------
  const watermarkRows = await Attendance.findAll({
    attributes: [
      'employeeId',
      [fn('MAX', col('clockIn')), 'lastClockIn'],
      [fn('MAX', col('clockOut')), 'lastClockOut'],
    ],
    group: ['employeeId'],
    raw: true,
  });

  const watermarkByEmployee = new Map();
  for (const row of watermarkRows) {
    const lastIn = row.lastClockIn ? moment(row.lastClockIn, 'YYYY-MM-DD HH:mm:ss') : null;
    const lastOut = row.lastClockOut ? moment(row.lastClockOut, 'YYYY-MM-DD HH:mm:ss') : null;

    let watermark = null;
    if (lastIn && lastOut) watermark = lastIn.isAfter(lastOut) ? lastIn : lastOut;
    else watermark = lastIn || lastOut;

    watermarkByEmployee.set(row.employeeId, watermark);
  }

  // ------------------------------------------------------------------
  // Load existing open shifts (clockOut IS NULL) to seed state machine
  // ------------------------------------------------------------------
  const openShiftRows = await Attendance.findAll({
    where: { clockOut: null, clockIn: { [Op.ne]: null } },
  });

  const openShiftByEmployee = new Map();
  for (const row of openShiftRows) {
    openShiftByEmployee.set(row.employeeId, row);
  }

  // ------------------------------------------------------------------
  // Group new logs by employee (filtering out already-processed scans)
  // ------------------------------------------------------------------
  const logsByEmployee = new Map();

  for (const log of logs) {
    const employee = employeeByZkId.get(log.deviceUserId);
    if (!employee) continue; // No matching employee record — skip

    const watermark = watermarkByEmployee.get(employee.id);
    if (watermark && !log.checkTime.isAfter(watermark)) {
      continue; // Already processed
    }

    if (!logsByEmployee.has(employee.id)) {
      logsByEmployee.set(employee.id, []);
    }
    logsByEmployee.get(employee.id).push(log);
  }

  // ------------------------------------------------------------------
  // State machine — process each employee's scans in chronological order
  // ------------------------------------------------------------------
  let syncedCount = 0;

  for (const [employeeId, scans] of logsByEmployee.entries()) {
    // Sort chronologically
    scans.sort((a, b) => a.checkTime.diff(b.checkTime));

    // Seed the in-memory open shift from the DB (if an open shift exists)
    const dbOpenShift = openShiftByEmployee.get(employeeId) || null;

    /**
     * In-memory open shift: either seeded from DB or started by a new 'I' scan.
     * Shape: { clockIn: moment, fromDb: boolean, dbRow?: Attendance }
     */
    let openShift = dbOpenShift
      ? {
          clockIn: moment(dbOpenShift.clockIn, 'YYYY-MM-DD HH:mm:ss'),
          fromDb: true,
          dbRow: dbOpenShift,
        }
      : null;

    let lastProcType = null;
    let lastProcTime = null;

    for (const scan of scans) {
      const { checkType, checkTime } = scan;

      // ---- Duplicate filter ----
      if (
        lastProcType === checkType &&
        lastProcTime !== null &&
        checkTime.diff(lastProcTime) < DUPLICATE_THRESHOLD_MS
      ) {
        console.log(
          `  ⟲ Duplicate ${checkType} skipped for employee ${employeeId} at ${fmtDatetime(checkTime)}`
        );
        continue;
      }

      if (checkType === 'I') {
        if (openShift) {
          // There's already an open shift — close it as missing clock-out
          console.warn(
            `  ⚠ Employee ${employeeId}: 'I' at ${fmtDatetime(checkTime)} found while shift was open (clockIn: ${fmtDatetime(openShift.clockIn)}) — saving as missing clock-out`
          );
          await upsertAttendance(employeeId, openShift.clockIn, null);
          syncedCount++;
        }
        // Start new open shift
        openShift = { clockIn: checkTime, fromDb: false };
      } else {
        // checkType === 'O'
        if (openShift) {
          // Normal case: close the open shift
          await upsertAttendance(employeeId, openShift.clockIn, checkTime);
          syncedCount++;
          openShift = null;
        } else {
          // O with no matching I — save standalone record
          console.warn(
            `  ⚠ Employee ${employeeId}: 'O' at ${fmtDatetime(checkTime)} has no matching clock-in — saving as missing clock-in`
          );
          await upsertAttendance(employeeId, null, checkTime);
          syncedCount++;
        }
      }

      lastProcType = checkType;
      lastProcTime = checkTime;
    }

    // After loop: if a shift is still open, save it as missing clock-out
    if (openShift) {
      await upsertAttendance(employeeId, openShift.clockIn, null);
      syncedCount++;
    }
  }

  console.log(`✔ Sync complete — ${syncedCount} attendance records created/updated.`);
  return syncedCount;
};

// ---------------------------------------------------------------------------
// HTTP controllers
// ---------------------------------------------------------------------------

exports.syncZktecoLogs = catchAsync(async (req, res, next) => {
  const deviceIp =
    req && req.body && req.body.deviceIp ? req.body.deviceIp : '192.168.1.55';
  const port = req && req.body && req.body.port ? req.body.port : 4370;

  try {
    const syncedCount = await exports.syncZktecoLogsFunction(deviceIp, port);
    res.status(200).json({
      status: 'success',
      message: `Attendance logs synchronized successfully.`,
      data: { syncedCount },
    });
  } catch (err) {
    return next(new AppError(`Error syncing ZKTeco logs: ${err.message}`, 500));
  }
});

exports.getDeviceUsers = catchAsync(async (req, res, next) => {
  const deviceIp =
    req && req.query && req.query.deviceIp ? req.query.deviceIp : '192.168.1.55';
  const port =
    req && req.query && req.query.port ? parseInt(req.query.port) : 4370;

  let deviceUsers = [];

  if (process.env.NODE_ENV !== 'production') {
    const userinfoPath = path.join(__dirname, '../mdb_exports/USERINFO.csv');
    if (fs.existsSync(userinfoPath)) {
      const userInfoContent = fs.readFileSync(userinfoPath, 'utf8');
      const userRows = userInfoContent
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean);

      for (let i = 1; i < userRows.length; i++) {
        const cols = userRows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 4) {
          const userId = cols[0];
          const name = cols[3].replace(/"/g, '');
          if (!name || name === userId) continue;
          deviceUsers.push({ zktecoId: String(userId), fullName: name });
        }
      }
    }
  } else {
    const zkInstance = new ZKLib(deviceIp, port, 4000, 4000);
    try {
      await zkInstance.createSocket();
      const result = await zkInstance.getUsers();
      const users = result && result.data ? result.data : [];
      for (const user of users) {
        const userId = user.userId || user.uid;
        const name = user.name;
        if (userId && name) {
          deviceUsers.push({ zktecoId: String(userId), fullName: name });
        }
      }
      await zkInstance.disconnect();
    } catch (err) {
      return next(new AppError(`Error connecting to ZKTeco device: ${err.message}`, 500));
    }
  }

  res.status(200).json({
    status: 'success',
    results: deviceUsers.length,
    data: { users: deviceUsers },
  });
});

exports.simulateScan = catchAsync(async (req, res, next) => {
  const { zktecoId, timestamp, punchType } = req.body;
  if (!zktecoId) {
    return next(new AppError('Please provide a zktecoId to simulate', 400));
  }

  const typeStr = punchType === 'O' ? 'O' : 'I';
  const time = timestamp ? moment(timestamp) : moment();
  const rawTime = time.format('MM/DD/YY HH:mm:ss');

  if (process.env.NODE_ENV !== 'production') {
    const checkinoutPath = path.join(__dirname, '../mdb_exports/CHECKINOUT.csv');
    if (fs.existsSync(checkinoutPath)) {
      // Append a new row matching the real ZKTeco CSV format exactly
      const csvLine = `\n${zktecoId},"${rawTime}","${typeStr}",1,"1",,"0","SIMULATED_DEV",1`;
      fs.appendFileSync(checkinoutPath, csvLine, 'utf8');

      res.status(200).json({
        status: 'success',
        message: 'Scan simulated successfully in development CSV',
        data: { zktecoId, timestamp: rawTime, punchType: typeStr },
      });
    } else {
      return next(
        new AppError('CSV file not found at ' + checkinoutPath + '. Cannot simulate.', 404)
      );
    }
  } else {
    return next(new AppError('Simulation is only supported in development mode', 400));
  }
});
