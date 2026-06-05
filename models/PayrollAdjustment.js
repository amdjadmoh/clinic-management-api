const sequelize = require('sequelize');
const db = require('../config/database');

const PayrollAdjustment = db.define('payroll_adjustment', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  payrollId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'payrolls',
      key: 'id',
    }
  },
  amount: {
    type: sequelize.DECIMAL,
    allowNull: false,
  },
  description: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  date: {
    type: sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.NOW
  }
}, {
  tableName: 'payroll_adjustments',
  timestamps: false,
});

module.exports = PayrollAdjustment;
