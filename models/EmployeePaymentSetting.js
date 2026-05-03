const sequelize = require('sequelize');
const db = require('../config/database');
const Employee = require('./Employee');
const PreDefinedProcedure = require('./PreDefinedProcedure');

const EmployeePaymentSetting = db.define('employee_payment_setting', {
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
  type: {
    type: sequelize.STRING, // e.g. 'fixed_monthly', 'hourly', 'consultation_percentage', 'procedure_percentage', 'fixed_extra_bonus', 'non_fixed_bonus'
    allowNull: false,
  },
  value: {
    type: sequelize.DECIMAL,
    allowNull: false,
    defaultValue: 0.0,
  },
  procedureId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'predefinedprocedures',
      key: 'id',
    }
  },
  description: {
    type: sequelize.STRING,
    allowNull: true,
  },
  expectedDays: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 30,
  }
}, {
  tableName: 'employee_payment_settings',
  timestamps: false,
});

Employee.hasMany(EmployeePaymentSetting, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
EmployeePaymentSetting.belongsTo(Employee, { foreignKey: 'employeeId' });
EmployeePaymentSetting.belongsTo(PreDefinedProcedure, { foreignKey: 'procedureId' });

module.exports = EmployeePaymentSetting;
