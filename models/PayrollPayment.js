const sequelize = require('sequelize');
const db = require('../config/database');

const PayrollPayment = db.define('payroll_payment', {
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
  date: {
    type: sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.NOW
  },
  notes: {
    type: sequelize.TEXT,
    allowNull: true,
  }
}, {
  tableName: 'payroll_payments',
  timestamps: false,
});

module.exports = PayrollPayment;
