'use strict';

/**
 * Consolidated HR, Payroll, Attendance, ZKTeco, Schedule, Leaves, Employee Files, and ATS migration.
 *
 * Replaces the following incremental dev migrations (all deleted):
 *   20260503000000-add-hr-and-zkteco-features.js
 *   20260524000000-add-employee-extra-fields-and-user-settings.js
 *   20260524000001-create-leaves-table.js
 *   20260531000000-create-employee-files.js
 *   20260605223000-create-payroll-tables.js
 *   20260606001500-add-social-security-number-to-employees.js
 *   20260608150000-add-payroll-confirmation-fields.js
 *   20260608160000-add-employee-schedule-and-leave-pay-fields.js
 *   20260610000000-attendance-clockin-datetime-unique.js
 *   20260610120000-create-ats-tables.js
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    // ── 1. Jobs ──────────────────────────────────────────────────────────
    if (!tables.includes('jobs')) {
      await queryInterface.createTable('jobs', {
        id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name:        { type: Sequelize.STRING,  allowNull: false },
        description: { type: Sequelize.STRING,  allowNull: true },
        defaultSettings: { type: Sequelize.TEXT, allowNull: true },
      });
    }

    // ── 2. Employees (with ALL columns from the start) ──────────────────
    if (!tables.includes('employees')) {
      await queryInterface.createTable('employees', {
        id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        fullName:    { type: Sequelize.STRING,  allowNull: false },
        userId:      { type: Sequelize.INTEGER, allowNull: true,
                       references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
        doctorId:    { type: Sequelize.INTEGER, allowNull: true,
                       references: { model: 'doctors', key: 'id' }, onDelete: 'SET NULL' },
        jobId:       { type: Sequelize.INTEGER, allowNull: true,
                       references: { model: 'jobs', key: 'id' }, onDelete: 'SET NULL' },
        startDate:   { type: Sequelize.DATEONLY, allowNull: false,
                       defaultValue: Sequelize.literal('CURRENT_DATE') },
        status:      { type: Sequelize.STRING,  allowNull: false, defaultValue: 'active' },
        zktecoId:    { type: Sequelize.STRING,  allowNull: true },
        phoneNumber: { type: Sequelize.STRING,  allowNull: true },
        depId:       { type: Sequelize.INTEGER, allowNull: true,
                       references: { model: 'departments', key: 'id' }, onDelete: 'SET NULL' },
        bankAccountNumber:       { type: Sequelize.STRING, allowNull: true },
        socialSecurityNumber:    { type: Sequelize.STRING, allowNull: true },
      });
    } else {
      // Safety: add any missing columns if table already existed from a partial run
      const desc = await queryInterface.describeTable('employees');
      const addIfMissing = async (col, def) => { if (!desc[col]) await queryInterface.addColumn('employees', col, def); };
      await addIfMissing('zktecoId',              { type: Sequelize.STRING, allowNull: true });
      await addIfMissing('phoneNumber',           { type: Sequelize.STRING, allowNull: true });
      await addIfMissing('depId',                 { type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'departments', key: 'id' }, onDelete: 'SET NULL' });
      await addIfMissing('bankAccountNumber',     { type: Sequelize.STRING, allowNull: true });
      await addIfMissing('socialSecurityNumber',  { type: Sequelize.STRING, allowNull: true });
    }

    // ── 3. Employee Payment Settings ────────────────────────────────────
    if (!tables.includes('employee_payment_settings')) {
      await queryInterface.createTable('employee_payment_settings', {
        id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employeeId:  { type: Sequelize.INTEGER, allowNull: false,
                       references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
        type:        { type: Sequelize.STRING,  allowNull: false },
        value:       { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        procedureId: { type: Sequelize.INTEGER, allowNull: true },
        description: { type: Sequelize.STRING,  allowNull: true },
        expectedDays:{ type: Sequelize.INTEGER, allowNull: true, defaultValue: 30 },
      });
    }

    // ── 4. Attendances (with unique index) ──────────────────────────────
    if (!tables.includes('attendances')) {
      await queryInterface.createTable('attendances', {
        id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employeeId:  { type: Sequelize.INTEGER, allowNull: false,
                       references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
        date:        { type: Sequelize.DATEONLY, allowNull: false },
        clockIn:     { type: Sequelize.STRING,  allowNull: true },
        clockOut:    { type: Sequelize.STRING,  allowNull: true },
        status:      { type: Sequelize.STRING,  allowNull: false, defaultValue: 'present' },
        hoursWorked: { type: Sequelize.DECIMAL(5, 2), allowNull: true, defaultValue: 0 },
      });
    }

    // Ensure unique index on (employeeId, clockIn) for idempotent sync upserts
    const indexes = await queryInterface.showIndex('attendances');
    const hasUniqueClockIn = indexes.some(
      idx => idx.unique && idx.fields.some(f => f.attribute === 'clockIn')
    );
    if (!hasUniqueClockIn) {
      await queryInterface.addIndex('attendances', ['employeeId', 'clockIn'], {
        unique: true,
        name: 'unique_attendance_employee_clockin',
        where: { clockIn: { [Sequelize.Op.ne]: null } },
      });
    }

    // ── 5. Leaves (with paidPercentage & paidDays from the start) ───────
    if (!tables.includes('leaves')) {
      await queryInterface.createTable('leaves', {
        id:              { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employeeId:      { type: Sequelize.INTEGER, allowNull: false,
                           references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
        startDate:       { type: Sequelize.DATEONLY, allowNull: false },
        endDate:         { type: Sequelize.DATEONLY, allowNull: false },
        type:            { type: Sequelize.STRING,  allowNull: false, defaultValue: 'annual' },
        status:          { type: Sequelize.STRING,  allowNull: false, defaultValue: 'pending' },
        reason:          { type: Sequelize.TEXT,    allowNull: true },
        paidPercentage:  { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 100 },
        paidDays:        { type: Sequelize.DECIMAL, allowNull: true,  defaultValue: null },
      });
    } else {
      const desc = await queryInterface.describeTable('leaves');
      if (!desc.paidPercentage) {
        await queryInterface.addColumn('leaves', 'paidPercentage', {
          type: Sequelize.DECIMAL, allowNull: false, defaultValue: 100,
        });
      }
      if (!desc.paidDays) {
        await queryInterface.addColumn('leaves', 'paidDays', {
          type: Sequelize.DECIMAL, allowNull: true, defaultValue: null,
        });
      }
    }

    // ── 6. Payrolls (with confirmedAt, settingsSnapshot) ────────────────
    if (!tables.includes('payrolls')) {
      await queryInterface.createTable('payrolls', {
        id:                 { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employeeId:         { type: Sequelize.INTEGER, allowNull: false,
                              references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
        month:              { type: Sequelize.STRING,  allowNull: false },
        fixedSalaryEarned:  { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        hourlySalaryEarned: { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        commissionEarned:   { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        bonusEarned:        { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        totalEarned:        { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        totalPaid:          { type: Sequelize.DECIMAL, allowNull: false, defaultValue: 0 },
        status:             { type: Sequelize.STRING,  allowNull: false, defaultValue: 'draft' },
        confirmedAt:        { type: Sequelize.DATE,    allowNull: true },
        settingsSnapshot:   { type: Sequelize.TEXT,    allowNull: true },
        details:            { type: Sequelize.TEXT,    allowNull: true },
      });
    } else {
      const desc = await queryInterface.describeTable('payrolls');
      if (!desc.confirmedAt) {
        await queryInterface.addColumn('payrolls', 'confirmedAt', {
          type: Sequelize.DATE, allowNull: true,
        });
      }
      if (!desc.settingsSnapshot) {
        await queryInterface.addColumn('payrolls', 'settingsSnapshot', {
          type: Sequelize.TEXT, allowNull: true,
        });
      }
      // Migrate any legacy 'unpaid' status → 'draft'
      await queryInterface.sequelize.query(
        `UPDATE payrolls SET status = 'draft' WHERE status = 'unpaid'`
      );
    }

    // ── 7. Payroll Payments ─────────────────────────────────────────────
    if (!tables.includes('payroll_payments')) {
      await queryInterface.createTable('payroll_payments', {
        id:        { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        payrollId: { type: Sequelize.INTEGER, allowNull: false,
                     references: { model: 'payrolls', key: 'id' }, onDelete: 'CASCADE' },
        amount:    { type: Sequelize.DECIMAL, allowNull: false },
        date:      { type: Sequelize.DATE,    allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        notes:     { type: Sequelize.TEXT,    allowNull: true },
      });
    }

    // ── 8. Payroll Adjustments ──────────────────────────────────────────
    if (!tables.includes('payroll_adjustments')) {
      await queryInterface.createTable('payroll_adjustments', {
        id:          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        payrollId:   { type: Sequelize.INTEGER, allowNull: false,
                       references: { model: 'payrolls', key: 'id' }, onDelete: 'CASCADE' },
        amount:      { type: Sequelize.DECIMAL, allowNull: false },
        description: { type: Sequelize.TEXT,    allowNull: true },
        date:        { type: Sequelize.DATE,    allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      });
    }

    // ── 9. Employee Files ───────────────────────────────────────────────
    if (!tables.includes('employee_files')) {
      await queryInterface.createTable('employee_files', {
        id:           { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employeeId:   { type: Sequelize.INTEGER, allowNull: false,
                        references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
        filename:     { type: Sequelize.STRING, allowNull: false },
        filePath:     { type: Sequelize.STRING, allowNull: false },
        fileSize:     { type: Sequelize.INTEGER, allowNull: false },
        fileType:     { type: Sequelize.STRING, allowNull: false },
        documentType: { type: Sequelize.STRING, allowNull: false, defaultValue: 'other' },
        description:  { type: Sequelize.TEXT,   allowNull: true },
        createdAt:    { type: Sequelize.DATE,   allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        updatedAt:    { type: Sequelize.DATE,   allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      });
    }

    // ── 10. Employee Schedules ──────────────────────────────────────────
    if (!tables.includes('employee_schedules')) {
      await queryInterface.createTable('employee_schedules', {
        id:         { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        employeeId: { type: Sequelize.INTEGER, allowNull: false,
                      references: { model: 'employees', key: 'id' }, onDelete: 'CASCADE' },
        dayOfWeek:  { type: Sequelize.INTEGER, allowNull: false },
        startTime:  { type: Sequelize.STRING,  allowNull: false },
        endTime:    { type: Sequelize.STRING,  allowNull: false },
      });
    }

    // ── 11. ATS ─────────────────────────────────────────────────────────
    if (!tables.includes('ats')) {
      await queryInterface.createTable('ats', {
        id:                          { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        agence:                      { type: Sequelize.STRING, allowNull: true },
        centrePaiement:              { type: Sequelize.STRING, allowNull: true },
        employerName:                { type: Sequelize.STRING, allowNull: true },
        employerAdherentNumber:      { type: Sequelize.STRING, allowNull: true },
        employerAddress:             { type: Sequelize.STRING, allowNull: true },
        employeeNom:                 { type: Sequelize.STRING, allowNull: true },
        employeePrenom:              { type: Sequelize.STRING, allowNull: true },
        employeeSocialSecurityNumber:{ type: Sequelize.STRING, allowNull: true },
        employeeDateOfBirth:         { type: Sequelize.DATEONLY, allowNull: true },
        employeePlaceOfBirth:        { type: Sequelize.STRING, allowNull: true },
        employeeAddress:             { type: Sequelize.STRING, allowNull: true },
        employeeProfession:          { type: Sequelize.STRING, allowNull: true },
        dateRecrutement:             { type: Sequelize.DATEONLY, allowNull: true },
        dateDernierJourTravail:      { type: Sequelize.DATEONLY, allowNull: true },
        dateRepriseTravail:          { type: Sequelize.DATEONLY, allowNull: true },
        nonReprisCeJour:             { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        dureeMoins6mJours:           { type: Sequelize.INTEGER, allowNull: true },
        dureeMoins6mHeures:          { type: Sequelize.INTEGER, allowNull: true },
        dureeMoins6mDu:              { type: Sequelize.DATEONLY, allowNull: true },
        dureeMoins6mAu:              { type: Sequelize.DATEONLY, allowNull: true },
        dureePlus6mJours:            { type: Sequelize.INTEGER, allowNull: true },
        dureePlus6mHeures:           { type: Sequelize.INTEGER, allowNull: true },
        dureePlus6mDu:               { type: Sequelize.DATEONLY, allowNull: true },
        dureePlus6mAu:               { type: Sequelize.DATEONLY, allowNull: true },
        volumeHoraireJournalier:     { type: Sequelize.DECIMAL(4, 2), allowNull: true },
        faitA:                       { type: Sequelize.STRING, allowNull: true },
        faitLe:                      { type: Sequelize.DATEONLY, allowNull: true },
        signataireNomPrenomQualite:  { type: Sequelize.STRING, allowNull: true },
        createdAt:                   { type: Sequelize.DATE, allowNull: false },
        updatedAt:                   { type: Sequelize.DATE, allowNull: false },
      });
    }

    // ── 12. ATS Salary Histories ────────────────────────────────────────
    if (!tables.includes('ats_salary_histories')) {
      await queryInterface.createTable('ats_salary_histories', {
        id:               { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        atsId:            { type: Sequelize.INTEGER, allowNull: false,
                            references: { model: 'ats', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
        referencePeriod:  { type: Sequelize.STRING, allowNull: true },
        joursTravailles:  { type: Sequelize.STRING, allowNull: true },
        motifAbsence:     { type: Sequelize.STRING, allowNull: true },
        salaireCotisable: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
        cotisationOuvriere:{ type: Sequelize.DECIMAL(15, 2), allowNull: true },
        createdAt:        { type: Sequelize.DATE, allowNull: false },
        updatedAt:        { type: Sequelize.DATE, allowNull: false },
      });
    }

    // ── 13. Add 'settings' column to users if missing ───────────────────
    try {
      const usersTable = await queryInterface.describeTable('users');
      if (!usersTable.settings) {
        await queryInterface.addColumn('users', 'settings', {
          type: Sequelize.TEXT, allowNull: true,
        });
      }
    } catch (_) {
      // users table may not exist in some envs — safe to ignore
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ats_salary_histories');
    await queryInterface.dropTable('ats');
    await queryInterface.dropTable('employee_schedules');
    await queryInterface.dropTable('employee_files');
    await queryInterface.dropTable('payroll_adjustments');
    await queryInterface.dropTable('payroll_payments');
    await queryInterface.dropTable('payrolls');
    await queryInterface.dropTable('leaves');
    try { await queryInterface.removeIndex('attendances', 'unique_attendance_employee_clockin'); } catch (_) {}
    await queryInterface.dropTable('attendances');
    await queryInterface.dropTable('employee_payment_settings');
    await queryInterface.dropTable('employees');
    await queryInterface.dropTable('jobs');
  },
};
