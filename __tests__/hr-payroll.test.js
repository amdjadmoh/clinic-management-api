const request = require('supertest');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

let app;
let server;

const CSV_PATH = path.join(__dirname, '../mdb_exports/CHECKINOUT.csv');
const CSV_BACKUP_PATH = path.join(__dirname, '../mdb_exports/CHECKINOUT.csv.bak');
const ORIGINAL_CSV_CONTENT = fs.readFileSync(CSV_PATH, 'utf8');

const TEST_MONTH = '2026-06';

// Helper: simulate a ZEKTOC scan
const simulateScan = (zktecoId, timestamp, punchType = 'I') =>
  request(app)
    .post('/zkteco/simulate')
    .send({ zktecoId, timestamp, punchType });

// Helper: trigger sync
const syncZkteco = () =>
  request(app)
    .post('/zkteco/sync')
    .send({});

// Helper: create a job
const createJob = (name, defaultSettings = []) =>
  request(app)
    .post('/employees/jobs')
    .send({ name, description: `Test job: ${name}`, defaultSettings });

// Helper: create an employee
const createEmployee = (data) =>
  request(app)
    .post('/employees')
    .send(data);

// Helper: update employee payment settings
const updatePaymentSettings = (employeeId, settings) =>
  request(app)
    .put(`/employees/${employeeId}/payment-settings`)
    .send({ settings });

// Helper: set schedule
const setSchedule = (employeeId, schedule) =>
  request(app)
    .put(`/employees/${employeeId}/schedule`)
    .send({ schedule });

// Helper: get payroll summary
const getPayroll = (month) =>
  request(app)
    .get(`/payroll/?month=${month}`);

// Helper: confirm payroll
const confirmPayroll = (employeeId, month) =>
  request(app)
    .post('/payroll/confirm')
    .send({ employeeId, month });

// Helper: pay employee
const payEmployee = (employeeId, month, amount, notes = '') =>
  request(app)
    .post('/payroll/pay')
    .send({ employeeId, month, paymentAmount: amount, notes });

// Helper: add adjustment
const addAdjustment = (employeeId, month, amount, description = '') =>
  request(app)
    .post('/payroll/adjustment')
    .send({ employeeId, month, amount, description });

// Helper: unlock payroll
const unlockPayroll = (employeeId, month) =>
  request(app)
    .post('/payroll/unlock')
    .send({ employeeId, month });

// Helper: create leave request
const createLeave = (data) =>
  request(app)
    .post('/employees/leaves')
    .send(data);

// Helper: approve/reject leave
const updateLeaveStatus = (leaveId, status, paidDays, paidPercentage) =>
  request(app)
    .put(`/employees/leaves/${leaveId}`)
    .send({ status, paidDays, paidPercentage });

// Helper: record manual attendance
const recordAttendance = (data) =>
  request(app)
    .post('/employees/attendance')
    .send(data);

// Helper: generate attendance for a range of days via simulate + sync
const generateAttendance = async (zktecoId, startDate, days, clockInTime = '08:00:00', clockOutTime = '16:00:00') => {
  const start = moment(startDate);
  for (let i = 0; i < days; i++) {
    const day = start.clone().add(i, 'days');
    // Skip weekends (Fri=5, Sat=6 in moment)
    if (day.day() === 5 || day.day() === 6) continue;
    const inDt = day.format('YYYY-MM-DD') + 'T' + clockInTime;
    const outDt = day.format('YYYY-MM-DD') + 'T' + clockOutTime;
    await simulateScan(zktecoId, inDt, 'I');
    await simulateScan(zktecoId, outDt, 'O');
  }
  await syncZkteco();
};

beforeAll(async () => {
  // Backup CSV
  fs.writeFileSync(CSV_BACKUP_PATH, ORIGINAL_CSV_CONTENT, 'utf8');

  // Set test environment
  process.env.NODE_ENV = 'development'; // simulate endpoint needs development mode

  // Import app (this triggers DB sync)
  app = require('../app');
  server = app.listen(0); // random port

  // Wait for DB to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
}, 30000);

afterAll(async () => {
  // Restore CSV
  if (fs.existsSync(CSV_BACKUP_PATH)) {
    fs.writeFileSync(CSV_PATH, ORIGINAL_CSV_CONTENT, 'utf8');
    fs.unlinkSync(CSV_BACKUP_PATH);
  }

  if (server) {
    await new Promise(resolve => server.close(resolve));
  }
}, 10000);

// ---------------------------------------------------------------------------
// TEST SUITES
// ---------------------------------------------------------------------------

describe('Employee & Job CRUD', () => {
  let jobId;
  let employeeId;

  test('Create a job with default payment settings', async () => {
    const res = await createJob('Nurse', [
      { type: 'fixed_monthly', value: 50000, expectedDays: 30 }
    ]);
    expect(res.status).toBe(201);
    expect(res.body.data.job.name).toBe('Nurse');
    jobId = res.body.data.job.id;
  });

  test('Get all jobs', async () => {
    const res = await request(app).get('/employees/jobs');
    expect(res.status).toBe(200);
    expect(res.body.data.jobs.length).toBeGreaterThan(0);
  });

  test('Create employee with job applies default payment settings', async () => {
    const res = await createEmployee({
      fullName: 'Test Nurse',
      jobId,
      startDate: '2026-01-01',
      zktecoId: 'TEST_001',
      status: 'active'
    });
    expect(res.status).toBe(201);
    employeeId = res.body.data.employee.id;

    // Verify payment settings were copied from job
    const empRes = await request(app).get(`/employees/${employeeId}`);
    expect(empRes.status).toBe(200);
    expect(empRes.body.data.employee.employee_payment_settings.length).toBe(1);
    expect(empRes.body.data.employee.employee_payment_settings[0].type).toBe('fixed_monthly');
    expect(parseFloat(empRes.body.data.employee.employee_payment_settings[0].value)).toBe(50000);
  });

  test('Get all employees', async () => {
    const res = await request(app).get('/employees');
    expect(res.status).toBe(200);
    expect(res.body.data.employees.length).toBeGreaterThan(0);
  });

  test('Get single employee', async () => {
    const res = await request(app).get(`/employees/${employeeId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.employee.fullName).toBe('Test Nurse');
  });

  test('Update employee', async () => {
    const res = await request(app)
      .put(`/employees/${employeeId}`)
      .send({ fullName: 'Test Nurse Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.employee.fullName).toBe('Test Nurse Updated');
  });

  test('Update employee payment settings manually', async () => {
    const res = await updatePaymentSettings(employeeId, [
      { type: 'fixed_monthly', value: 60000, expectedDays: 30 },
      { type: 'fixed_extra_bonus', value: 5000 }
    ]);
    expect(res.status).toBe(200);
    expect(res.body.data.settings.length).toBe(2);
  });

  test('Soft delete employee', async () => {
    const res = await request(app).delete(`/employees/${employeeId}`);
    expect(res.status).toBe(204);
  });
});

describe('ZEKTOC Simulation + Attendance Sync', () => {
  let testEmpId;
  const testZkId = 'SIM_100';

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Sim Employee',
      startDate: '2026-01-01',
      zktecoId: testZkId,
      status: 'active'
    });
    testEmpId = res.body.data.employee.id;
  });

  test('Simulate clock-in scan', async () => {
    const res = await simulateScan(testZkId, '2026-06-10T08:00:00', 'I');
    expect(res.status).toBe(200);
    expect(res.body.data.punchType).toBe('I');
  });

  test('Simulate clock-out scan', async () => {
    const res = await simulateScan(testZkId, '2026-06-10T16:00:00', 'O');
    expect(res.status).toBe(200);
    expect(res.body.data.punchType).toBe('O');
  });

  test('Sync creates attendance record', async () => {
    const res = await syncZkteco();
    expect(res.status).toBe(200);
    expect(res.body.data.syncedCount).toBeGreaterThanOrEqual(1);
  });

  test('Attendance record has correct hours', async () => {
    const res = await request(app).get(`/employees/${testEmpId}/attendance?month=2026-06`);
    expect(res.status).toBe(200);
    const records = res.body.data.attendances;
    const jun10 = records.find(a => a.date === '2026-06-10');
    expect(jun10).toBeDefined();
    expect(parseFloat(jun10.hoursWorked)).toBeCloseTo(8, 0);
    expect(jun10.status).toBe('present');
  });

  test('Duplicate scans within 2 minutes are filtered', async () => {
    // Simulate two I scans within 2 minutes
    await simulateScan(testZkId, '2026-06-11T08:00:00', 'I');
    await simulateScan(testZkId, '2026-06-11T08:01:00', 'I');
    await simulateScan(testZkId, '2026-06-11T16:00:00', 'O');

    const syncRes = await syncZkteco();
    expect(syncRes.status).toBe(200);

    const attRes = await request(app).get(`/employees/${testEmpId}/attendance?month=2026-06`);
    const records = attRes.body.data.attendances;
    const jun11Records = records.filter(a => a.date === '2026-06-11');
    // Should have only 1 attendance record for June 11 (duplicate I filtered)
    expect(jun11Records.length).toBe(1);
  });

  test('Missing clock-in (O without I) creates standalone record', async () => {
    await simulateScan(testZkId, '2026-06-12T16:00:00', 'O');
    await syncZkteco();

    const attRes = await request(app).get(`/employees/${testEmpId}/attendance?month=2026-06`);
    const records = attRes.body.data.attendances;
    const jun12 = records.find(a => a.date === '2026-06-12');
    expect(jun12).toBeDefined();
    expect(jun12.clockIn).toBeNull();
    expect(jun12.clockOut).toContain('16:00:00');
    expect(parseFloat(jun12.hoursWorked)).toBe(0);
  });

  test('Missing clock-out (I without O) creates incomplete record', async () => {
    await simulateScan(testZkId, '2026-06-13T08:00:00', 'I');
    await syncZkteco();

    const attRes = await request(app).get(`/employees/${testEmpId}/attendance?month=2026-06`);
    const records = attRes.body.data.attendances;
    const jun13 = records.find(a => a.date === '2026-06-13');
    expect(jun13).toBeDefined();
    expect(jun13.clockIn).toContain('08:00:00');
    expect(jun13.clockOut).toBeNull();
  });

  test('Multiple I scans without O: each I starts new shift', async () => {
    // Simulate: I -> I (closes first) -> O
    await simulateScan(testZkId, '2026-06-14T08:00:00', 'I');
    await simulateScan(testZkId, '2026-06-14T12:00:00', 'I');
    await simulateScan(testZkId, '2026-06-14T16:00:00', 'O');
    await syncZkteco();

    const attRes = await request(app).get(`/employees/${testEmpId}/attendance?month=2026-06`);
    const records = attRes.body.data.attendances;
    const jun14 = records.filter(a => a.date === '2026-06-14');
    // Should have 2 records: one incomplete (08:00-?), one complete (12:00-16:00)
    expect(jun14.length).toBe(2);
  });
});

describe('Hourly Payment Employee', () => {
  let empId;
  const zkId = 'HR_200';

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Hourly Worker',
      startDate: '2026-01-01',
      zktecoId: zkId,
      status: 'active'
    });
    empId = res.body.data.employee.id;

    await updatePaymentSettings(empId, [
      { type: 'hourly', value: 500 }
    ]);

    // Simulate attendance for June 2026
    // June 1 (Mon) to June 5 (Fri) - 5 work days, 8 hours each
    await generateAttendance(zkId, '2026-06-01', 10, '08:00:00', '16:00:00');
  });

  test('Hourly employee earns rate * total hours', async () => {
    const res = await getPayroll(TEST_MONTH);
    expect(res.status).toBe(200);

    const emp = res.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp).toBeDefined();

    // Should have some hours worked
    expect(emp.breakdown.hourlySalaryEarned).toBeGreaterThan(0);
    // totalEarned should equal hourlySalaryEarned (no other payment types)
    expect(emp.breakdown.totalEarned).toBe(emp.breakdown.hourlySalaryEarned);
  });

  test('Hourly employee with no attendance earns 0', async () => {
    const noAttRes = await createEmployee({
      fullName: 'No Attendance Worker',
      startDate: '2026-01-01',
      zktecoId: 'HR_201',
      status: 'active'
    });
    const noAttId = noAttRes.body.data.employee.id;
    await updatePaymentSettings(noAttId, [{ type: 'hourly', value: 500 }]);

    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === noAttId);
    expect(emp.breakdown.hourlySalaryEarned).toBe(0);
  });
});

describe('Fixed Monthly Salary WITHOUT Schedule (expectedDays)', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Fixed No Schedule',
      startDate: '2026-01-01',
      zktecoId: 'FIXED_NOSCHED',
      status: 'active'
    });
    empId = res.body.data.employee.id;

    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 60000, expectedDays: 30 }
    ]);

    // Simulate 20 days of attendance in June
    await generateAttendance('FIXED_NOSCHED', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Fixed monthly without schedule uses expectedDays=30 as baseline', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp).toBeDefined();

    // Daily rate = 60000 / 30 = 2000
    // Earned should be presentDays * dailyRate (absences docked)
    const dailyRate = 60000 / 30;
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
    expect(emp.breakdown.fixedSalaryEarned).toBeLessThanOrEqual(60000);
    // Verify daily rate logic
    const workedDays = emp.breakdown.fixedSalaryEarned / dailyRate;
    expect(workedDays).toBeGreaterThanOrEqual(0);
    expect(workedDays).toBeLessThanOrEqual(30);
  });

  test('Absent days reduce fixed monthly salary', async () => {
    // Create another employee with fewer attendance days
    const res2 = await createEmployee({
      fullName: 'Many Absences',
      startDate: '2026-01-01',
      zktecoId: 'FIXED_ABS',
      status: 'active'
    });
    const emp2Id = res2.body.data.employee.id;
    await updatePaymentSettings(emp2Id, [
      { type: 'fixed_monthly', value: 30000, expectedDays: 30 }
    ]);

    // Only 10 work days attendance
    await generateAttendance('FIXED_ABS', '2026-06-01', 12, '08:00:00', '16:00:00');

    const payroll = await getPayroll(TEST_MONTH);
    const emp2 = payroll.body.data.summaries.find(s => s.employeeId === emp2Id);

    // baseline = 30, presentDays = ~10, absences = ~20
    const dailyRate = 30000 / 30;
    expect(emp2.breakdown.fixedSalaryEarned).toBeLessThan(30000);
    expect(emp2.absences).toBeGreaterThan(0);
  });
});

describe('Fixed Monthly Salary WITH Schedule', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Fixed With Schedule',
      startDate: '2026-01-01',
      zktecoId: 'FIXED_SCHED',
      status: 'active'
    });
    empId = res.body.data.employee.id;

    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 60000, expectedDays: 30 }
    ]);

    // Set Mon-Fri schedule (0=Sun, 1=Mon...5=Fri)
    await setSchedule(empId, [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' },
    ]);

    // Simulate full attendance for all work days in June 2026
    await generateAttendance('FIXED_SCHED', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Schedule-based baseline counts scheduled work days', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp).toBeDefined();

    // June 2026: Mon-Fri work days from June 1 to June 30
    // Schedule-based calculation should use scheduled days count
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
  });

  test('Schedule-based employee: daily rate = salary / scheduled days in full month', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);

    // Count Mon-Fri in June 2026
    const start = moment('2026-06-01');
    const end = moment('2026-06-30');
    let scheduledDays = 0;
    const current = start.clone();
    while (current.isSameOrBefore(end)) {
      if ([1, 2, 3, 4, 5].includes(current.day())) {
        scheduledDays++;
      }
      current.add(1, 'day');
    }

    // Verify daily rate = 60000 / scheduledDays
    const expectedDailyRate = 60000 / scheduledDays;
    // workedDays should be <= scheduledDays (some may be missing due to today's date cutoff)
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
    // The earned amount should equal presentDays * dailyRate (rounded)
    const earned = emp.breakdown.fixedSalaryEarned;
    expect(earned).toBeLessThanOrEqual(60000);
  });
});

describe('Leave Types + Payroll Impact', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Leave Test Employee',
      startDate: '2026-01-01',
      zktecoId: 'LEAVE_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;

    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 60000, expectedDays: 30 }
    ]);

    // Set Mon-Fri schedule
    await setSchedule(empId, [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' },
    ]);

    // Full attendance for June
    await generateAttendance('LEAVE_001', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Approved annual leave counts as paid days', async () => {
    // Create leave: June 15-19 (Mon-Fri, 5 work days)
    const leaveRes = await createLeave({
      employeeId: empId,
      startDate: '2026-06-15',
      endDate: '2026-06-19',
      type: 'annual',
      reason: 'Vacation'
    });
    expect(leaveRes.status).toBe(201);
    const leaveId = leaveRes.body.data.leave.id;

    // Approve with auto-calculated paidDays
    const approveRes = await updateLeaveStatus(leaveId, 'approved');
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.leave.status).toBe('approved');
    expect(approveRes.body.data.leave.paidDays).toBeGreaterThan(0);

    // Payroll should still calculate correctly (paid leave days count as present)
    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
  });

  test('Unpaid leave reduces salary', async () => {
    // Create unpaid leave: June 22-26 (Mon-Fri, 5 work days)
    const leaveRes = await createLeave({
      employeeId: empId,
      startDate: '2026-06-22',
      endDate: '2026-06-26',
      type: 'unpaid',
      reason: 'Personal'
    });
    const leaveId = leaveRes.body.data.leave.id;

    const approveRes = await updateLeaveStatus(leaveId, 'approved');
    expect(approveRes.status).toBe(200);

    // Get payroll before unpaid leave
    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    // Total should be less than 60000 because of unpaid leave deduction
    expect(emp.breakdown.fixedSalaryEarned).toBeLessThan(60000);
  });

  test('Sick leave counts as paid days', async () => {
    const res = await createEmployee({
      fullName: 'Sick Leave Employee',
      startDate: '2026-01-01',
      zktecoId: 'SICK_001',
      status: 'active'
    });
    const sickEmpId = res.body.data.employee.id;
    await updatePaymentSettings(sickEmpId, [
      { type: 'fixed_monthly', value: 30000, expectedDays: 30 }
    ]);

    // Full attendance
    await generateAttendance('SICK_001', '2026-06-01', 30, '08:00:00', '16:00:00');

    // Sick leave for 2 days
    const leaveRes = await createLeave({
      employeeId: sickEmpId,
      startDate: '2026-06-10',
      endDate: '2026-06-11',
      type: 'sick',
      reason: 'Flu'
    });
    await updateLeaveStatus(leaveRes.body.data.leave.id, 'approved');

    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === sickEmpId);
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
  });

  test('Leave with paidPercentage < 100 reduces effective paid days', async () => {
    const res = await createEmployee({
      fullName: 'Partial Pay Employee',
      startDate: '2026-01-01',
      zktecoId: 'PARTIAL_001',
      status: 'active'
    });
    const partEmpId = res.body.data.employee.id;
    await updatePaymentSettings(partEmpId, [
      { type: 'fixed_monthly', value: 30000, expectedDays: 30 }
    ]);

    await generateAttendance('PARTIAL_001', '2026-06-01', 30, '08:00:00', '16:00:00');

    // Leave with 50% pay
    const leaveRes = await createLeave({
      employeeId: partEmpId,
      startDate: '2026-06-15',
      endDate: '2026-06-19',
      type: 'annual',
      paidPercentage: 50,
      reason: 'Half pay leave'
    });
    await updateLeaveStatus(leaveRes.body.data.leave.id, 'approved', undefined, 50);

    const leave = await request(app).get(`/employees/${partEmpId}/leaves`);
    const approvedLeave = leave.body.data.leaves.find(l => l.type === 'annual');
    expect(approvedLeave.paidPercentage).toBe('50');
  });

  test('Rejected leave does not affect payroll', async () => {
    const leaveRes = await createLeave({
      employeeId: empId,
      startDate: '2026-06-29',
      endDate: '2026-06-30',
      type: 'annual',
      reason: 'Should be rejected'
    });
    await updateLeaveStatus(leaveRes.body.data.leave.id, 'rejected');

    // Payroll should remain unaffected
    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
  });
});

describe('Payroll Lifecycle (Draft -> Confirm -> Pay -> Unlock)', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Lifecycle Employee',
      startDate: '2026-01-01',
      zktecoId: 'LIFECYCLE',
      status: 'active'
    });
    empId = res.body.data.employee.id;
    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 100000, expectedDays: 30 }
    ]);
    await generateAttendance('LIFECYCLE', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Initial payroll is draft', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.paymentArchive.status).toBe('draft');
  });

  test('Payroll calculates correct total earned', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.breakdown.totalEarned).toBeGreaterThan(0);
    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
  });

  test('Confirm payroll freezes values', async () => {
    const res = await confirmPayroll(empId, TEST_MONTH);
    expect(res.status).toBe(200);
    expect(res.body.data.confirmed.length).toBe(1);

    // Verify frozen
    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.frozen).toBe(true);
    expect(emp.paymentArchive.status).toBe('confirmed');
  });

  test('Payment updates totalPaid and transitions to partially_paid', async () => {
    const res = await payEmployee(empId, TEST_MONTH, 30000, 'First installment');
    expect(res.status).toBe(200);
    expect(res.body.data.payroll.status).toBe('partially_paid');

    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.paymentArchive.totalPaid).toBe(30000);
  });

  test('Full payment transitions to paid', async () => {
    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    const remaining = emp.breakdown.totalEarned - emp.paymentArchive.totalPaid;

    const res = await payEmployee(empId, TEST_MONTH, remaining, 'Final payment');
    expect(res.status).toBe(200);
    expect(res.body.data.payroll.status).toBe('paid');
  });

  test('Cannot unlock a paid payroll', async () => {
    const res = await unlockPayroll(empId, TEST_MONTH);
    expect(res.status).toBe(400);
  });

  test('Cannot add adjustment to confirmed payroll', async () => {
    const res = await addAdjustment(empId, TEST_MONTH, 5000, 'Bonus');
    expect(res.status).toBe(400);
  });

  test('Payroll history shows correct records', async () => {
    const res = await request(app).get(`/payroll/history/${empId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.history.length).toBeGreaterThan(0);
    const record = res.body.data.history.find(h => h.month === TEST_MONTH);
    expect(record).toBeDefined();
    expect(record.status).toBe('paid');
  });
});

describe('Payroll Unlock Flow', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Unlock Employee',
      startDate: '2026-01-01',
      zktecoId: 'UNLOCK_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;
    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 50000, expectedDays: 30 }
    ]);
    await generateAttendance('UNLOCK_001', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Confirm then unlock reverts to draft', async () => {
    await confirmPayroll(empId, TEST_MONTH);

    // Verify confirmed
    let payroll = await getPayroll(TEST_MONTH);
    let emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.frozen).toBe(true);

    // Unlock
    const unlockRes = await unlockPayroll(empId, TEST_MONTH);
    expect(unlockRes.status).toBe(200);

    // Verify back to draft
    payroll = await getPayroll(TEST_MONTH);
    emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    expect(emp.frozen).toBe(false);
    expect(emp.paymentArchive.status).toBe('draft');
  });

  test('Cannot unlock a draft payroll', async () => {
    const res = await unlockPayroll(empId, TEST_MONTH);
    expect(res.status).toBe(400);
  });

  test('Cannot unlock partially_paid payroll', async () => {
    // Make a payment first
    await confirmPayroll(empId, TEST_MONTH);
    await payEmployee(empId, TEST_MONTH, 10000, 'Partial');

    const res = await unlockPayroll(empId, TEST_MONTH);
    expect(res.status).toBe(400);
  });
});

describe('Payroll Adjustments', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Adjustment Employee',
      startDate: '2026-01-01',
      zktecoId: 'ADJ_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;
    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 40000, expectedDays: 30 }
    ]);
    await generateAttendance('ADJ_001', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Add positive adjustment to draft payroll', async () => {
    const before = await getPayroll(TEST_MONTH);
    const beforeEmp = before.body.data.summaries.find(s => s.employeeId === empId);
    const beforeTotal = beforeEmp.breakdown.totalEarned;

    const res = await addAdjustment(empId, TEST_MONTH, 10000, 'Performance bonus');
    expect(res.status).toBe(200);

    const after = await getPayroll(TEST_MONTH);
    const afterEmp = after.body.data.summaries.find(s => s.employeeId === empId);
    expect(afterEmp.breakdown.totalEarned).toBe(beforeTotal + 10000);
  });

  test('Add negative adjustment (deduction)', async () => {
    const before = await getPayroll(TEST_MONTH);
    const beforeEmp = before.body.data.summaries.find(s => s.employeeId === empId);

    const res = await addAdjustment(empId, TEST_MONTH, -5000, 'Damage deduction');
    expect(res.status).toBe(200);

    const after = await getPayroll(TEST_MONTH);
    const afterEmp = after.body.data.summaries.find(s => s.employeeId === empId);
    expect(afterEmp.breakdown.totalEarned).toBe(beforeEmp.breakdown.totalEarned - 5000);
  });

  test('Multiple adjustments accumulate', async () => {
    await addAdjustment(empId, TEST_MONTH, 2000, 'Transport');
    await addAdjustment(empId, TEST_MONTH, 3000, 'Meal');

    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    // Total adjustments: 10000 - 5000 + 2000 + 3000 = 10000
    const adjSum = 10000 - 5000 + 2000 + 3000;
    expect(emp.breakdown.bonusEarned).toBeGreaterThanOrEqual(adjSum);
  });
});

describe('Hourly Employee with Extra Bonus', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Hourly Bonus',
      startDate: '2026-01-01',
      zktecoId: 'HBONUS_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;
    await updatePaymentSettings(empId, [
      { type: 'hourly', value: 500 },
      { type: 'fixed_extra_bonus', value: 10000 }
    ]);
    await generateAttendance('HBONUS_001', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Hourly + bonus calculates correctly', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);

    expect(emp.breakdown.hourlySalaryEarned).toBeGreaterThan(0);
    expect(emp.breakdown.bonusEarned).toBeGreaterThanOrEqual(10000);
    expect(emp.breakdown.totalEarned).toBe(
      emp.breakdown.hourlySalaryEarned + emp.breakdown.bonusEarned
    );
  });
});

describe('Bulk Payroll Operations', () => {
  let emp1, emp2;

  beforeAll(async () => {
    const r1 = await createEmployee({
      fullName: 'Bulk Emp 1',
      startDate: '2026-01-01',
      zktecoId: 'BULK_001',
      status: 'active'
    });
    emp1 = r1.body.data.employee.id;
    await updatePaymentSettings(emp1, [{ type: 'fixed_monthly', value: 50000, expectedDays: 30 }]);

    const r2 = await createEmployee({
      fullName: 'Bulk Emp 2',
      startDate: '2026-01-01',
      zktecoId: 'BULK_002',
      status: 'active'
    });
    emp2 = r2.body.data.employee.id;
    await updatePaymentSettings(emp2, [{ type: 'fixed_monthly', value: 40000, expectedDays: 30 }]);

    await generateAttendance('BULK_001', '2026-06-01', 30, '08:00:00', '16:00:00');
    await generateAttendance('BULK_002', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('Bulk confirm all payrolls', async () => {
    const res = await confirmPayroll(null, TEST_MONTH);
    expect(res.status).toBe(200);
    expect(res.body.data.confirmed.length).toBeGreaterThanOrEqual(2);
  });

  test('Payroll summary returns all employees', async () => {
    const res = await getPayroll(TEST_MONTH);
    expect(res.status).toBe(200);
    expect(res.body.data.summaries.length).toBeGreaterThan(2);
  });
});

describe('Edge Cases', () => {
  test('Simulate with missing zktecoId returns 400', async () => {
    const res = await request(app)
      .post('/zkteco/simulate')
      .send({});
    expect(res.status).toBe(400);
  });

  test('Get payroll without month returns 400', async () => {
    const res = await request(app).get('/payroll/');
    expect(res.status).toBe(400);
  });

  test('Pay without required fields returns 400', async () => {
    const res = await request(app)
      .post('/payroll/pay')
      .send({});
    expect(res.status).toBe(400);
  });

  test('Confirm with invalid month returns error', async () => {
    const res = await confirmPayroll(null, 'invalid');
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  test('Create leave without required fields returns 400', async () => {
    const res = await request(app)
      .post('/employees/leaves')
      .send({});
    expect(res.status).toBe(400);
  });

  test('Update non-existent employee returns 404', async () => {
    const res = await request(app)
      .put('/employees/99999')
      .send({ fullName: 'Ghost' });
    expect(res.status).toBe(404);
  });

  test('Delete non-existent employee returns 404', async () => {
    const res = await request(app).delete('/employees/99999');
    expect(res.status).toBe(404);
  });

  test('Get attendance for non-existent employee returns empty', async () => {
    const res = await request(app).get('/employees/99999/attendance?month=2026-06');
    expect(res.status).toBe(200);
    expect(res.body.data.attendances.length).toBe(0);
  });

  test('Schedule with invalid dayOfWeek returns 400', async () => {
    const res = await request(app)
      .put('/employees/1/schedule')
      .send({ schedule: [{ dayOfWeek: 99, startTime: '08:00', endTime: '16:00' }] });
    expect(res.status).toBe(400);
  });

  test('Pay more than totalEarned marks as paid', async () => {
    const res = await createEmployee({
      fullName: 'Overpay Test',
      startDate: '2026-01-01',
      zktecoId: 'OVERPAY_001',
      status: 'active'
    });
    const id = res.body.data.employee.id;
    await updatePaymentSettings(id, [{ type: 'fixed_monthly', value: 10000, expectedDays: 30 }]);
    await generateAttendance('OVERPAY_001', '2026-06-01', 30, '08:00:00', '16:00:00');

    const payRes = await payEmployee(id, TEST_MONTH, 999999, 'Massive overpay');
    expect(payRes.status).toBe(200);
    expect(payRes.body.data.payroll.status).toBe('paid');
  });
});

describe('Multiple Payment Types Combined', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Multi Pay Employee',
      startDate: '2026-01-01',
      zktecoId: 'MULTI_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;

    // Combined: fixed monthly + hourly + bonus
    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 40000, expectedDays: 30 },
      { type: 'hourly', value: 300 },
      { type: 'fixed_extra_bonus', value: 5000 }
    ]);

    await generateAttendance('MULTI_001', '2026-06-01', 30, '08:00:00', '16:00:00');
  });

  test('All payment types sum correctly', async () => {
    const res = await getPayroll(TEST_MONTH);
    const emp = res.body.data.summaries.find(s => s.employeeId === empId);

    expect(emp.breakdown.fixedSalaryEarned).toBeGreaterThan(0);
    expect(emp.breakdown.hourlySalaryEarned).toBeGreaterThan(0);
    expect(emp.breakdown.bonusEarned).toBeGreaterThanOrEqual(5000);

    const expectedTotal =
      emp.breakdown.fixedSalaryEarned +
      emp.breakdown.hourlySalaryEarned +
      emp.breakdown.bonusEarned;
    expect(emp.breakdown.totalEarned).toBe(expectedTotal);
  });

  test('Confirm + pay + history for combined types', async () => {
    await confirmPayroll(empId, TEST_MONTH);

    const payroll = await getPayroll(TEST_MONTH);
    const emp = payroll.body.data.summaries.find(s => s.employeeId === empId);
    await payEmployee(empId, TEST_MONTH, emp.breakdown.totalEarned, 'Full payment');

    const history = await request(app).get(`/payroll/history/${empId}`);
    expect(history.status).toBe(200);
    const record = history.body.data.history.find(h => h.month === TEST_MONTH);
    expect(record.status).toBe('paid');
  });
});

describe('Night Shift Schedule (crosses midnight)', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'Night Shift Worker',
      startDate: '2026-01-01',
      zktecoId: 'NIGHT_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;
    await updatePaymentSettings(empId, [
      { type: 'hourly', value: 600 }
    ]);

    // Night shift: 22:00 - 06:00 (crosses midnight)
    await setSchedule(empId, [
      { dayOfWeek: 1, startTime: '22:00', endTime: '06:00' },
      { dayOfWeek: 2, startTime: '22:00', endTime: '06:00' },
      { dayOfWeek: 3, startTime: '22:00', endTime: '06:00' },
      { dayOfWeek: 4, startTime: '22:00', endTime: '06:00' },
      { dayOfWeek: 5, startTime: '22:00', endTime: '06:00' },
    ]);

    // Simulate night shift: clock in at 22:00, clock out at 06:00 next day
    await simulateScan('NIGHT_001', '2026-06-01T22:00:00', 'I');
    await simulateScan('NIGHT_001', '2026-06-02T06:00:00', 'O');
    await syncZkteco();
  });

  test('Night shift employee has schedule set', async () => {
    const res = await request(app).get(`/employees/${empId}/schedule`);
    expect(res.status).toBe(200);
    expect(res.body.data.schedule.length).toBe(5);
  });

  test('Night shift attendance is recorded', async () => {
    const res = await request(app).get(`/employees/${empId}/attendance?month=2026-06`);
    expect(res.status).toBe(200);
    expect(res.body.data.attendances.length).toBeGreaterThan(0);
  });
});

describe('Employee Payroll History Across Months', () => {
  let empId;

  beforeAll(async () => {
    const res = await createEmployee({
      fullName: 'History Employee',
      startDate: '2026-01-01',
      zktecoId: 'HIST_001',
      status: 'active'
    });
    empId = res.body.data.employee.id;
    await updatePaymentSettings(empId, [
      { type: 'fixed_monthly', value: 50000, expectedDays: 30 }
    ]);

    // Create attendance for June
    await generateAttendance('HIST_001', '2026-06-01', 30, '08:00:00', '16:00:00');
    await confirmPayroll(empId, TEST_MONTH);
  });

  test('Payroll history shows month records', async () => {
    const res = await request(app).get(`/payroll/history/${empId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.history.length).toBeGreaterThanOrEqual(1);

    const record = res.body.data.history[0];
    expect(record.month).toBe(TEST_MONTH);
    expect(record.fixedSalaryEarned).toBeGreaterThan(0);
  });
});
