const sequelize = require('sequelize');
const db = require('../config/database');
const Employee = require('./Employee');

const Attendance = db.define('attendance', {
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
  date: {
    type: sequelize.DATEONLY,
    allowNull: false,
  },
  clockIn: {
    type: sequelize.STRING, // Store as string like "09:00:00" or simple datetime
    allowNull: true,
  },
  clockOut: {
    type: sequelize.STRING, // Store as string like "17:00:00" or simple datetime
    allowNull: true,
  },
  status: {
    type: sequelize.STRING, // e.g. 'present', 'absent', 'late', 'excused'
    allowNull: false,
    defaultValue: 'present',
  },
  hoursWorked: {
    type: sequelize.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.0,
  }
}, {
  tableName: 'attendances',
  timestamps: false,
});

Employee.hasMany(Attendance, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = Attendance;
