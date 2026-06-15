const sequelize = require('sequelize');
const db = require('../config/database');
const Employee = require('./Employee');

const Payroll = db.define('payroll', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  employeeId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id',
    }
  },
  month: {
    type: sequelize.STRING, // format e.g., 'YYYY-MM'
    allowNull: false,
  },
  fixedSalaryEarned: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  hourlySalaryEarned: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  commissionEarned: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  bonusEarned: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  totalEarned: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  totalPaid: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  status: {
    type: sequelize.STRING, // 'draft', 'confirmed', 'partially_paid', 'paid'
    allowNull: false,
    defaultValue: 'draft',
  },
  confirmedAt: {
    type: sequelize.DATE,
    allowNull: true,
  },

  settingsSnapshot: {
    type: sequelize.TEXT, // JSON snapshot of EmployeePaymentSettings at confirmation time
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('settingsSnapshot');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('settingsSnapshot', value ? JSON.stringify(value) : null);
    }
  },
  details: {
    type: sequelize.TEXT, // optional JSON breakdown stored as string
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('details');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('details', value ? JSON.stringify(value) : null);
    }
  }
}, {
  tableName: 'payrolls',
  timestamps: false,
});

Employee.hasMany(Payroll, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Payroll.belongsTo(Employee, { foreignKey: 'employeeId' });

const PayrollPayment = require('./PayrollPayment');
const PayrollAdjustment = require('./PayrollAdjustment');

Payroll.hasMany(PayrollPayment, { foreignKey: 'payrollId', as: 'payments', onDelete: 'CASCADE' });
PayrollPayment.belongsTo(Payroll, { foreignKey: 'payrollId' });

Payroll.hasMany(PayrollAdjustment, { foreignKey: 'payrollId', as: 'adjustments', onDelete: 'CASCADE' });
PayrollAdjustment.belongsTo(Payroll, { foreignKey: 'payrollId' });

module.exports = Payroll;
