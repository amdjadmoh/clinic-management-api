const sequelize = require('sequelize');
const db = require('../config/database');
const Employee = require('./Employee');

const Leave = db.define('leave', {
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
  startDate: {
    type: sequelize.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: sequelize.DATEONLY,
    allowNull: false,
  },
  type: {
    type: sequelize.STRING, // e.g. 'sick', 'annual', 'casual', 'unpaid'
    allowNull: false,
    defaultValue: 'annual',
  },
  status: {
    type: sequelize.STRING, // e.g. 'pending', 'approved', 'rejected'
    allowNull: false,
    defaultValue: 'pending',
  },
  reason: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  paidPercentage: {
    type: sequelize.DECIMAL, // 0-100: how much of the leave is paid. Official holiday = 100, other reasons can be less.
    allowNull: false,
    defaultValue: 100,
  },
  paidDays: {
    type: sequelize.DECIMAL, // For scheduled employees: auto-calculated on approval. For non-scheduled: admin enters manually.
    allowNull: true,
    defaultValue: null,
  }
}, {
  tableName: 'leaves',
  timestamps: false,
});

Employee.hasMany(Leave, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Leave.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = Leave;
