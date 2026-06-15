const sequelize = require('sequelize');
const db = require('../config/database');
const Employee = require('./Employee');

const EmployeeSchedule = db.define('employee_schedule', {
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
  dayOfWeek: {
    type: sequelize.INTEGER, // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    allowNull: false,
  },
  startTime: {
    type: sequelize.STRING, // e.g. '08:00', '20:00' (24h format)
    allowNull: false,
  },
  endTime: {
    type: sequelize.STRING, // e.g. '17:00', '06:00' — if endTime < startTime, shift crosses midnight (night shift)
    allowNull: false,
  }
}, {
  tableName: 'employee_schedules',
  timestamps: false,
});

Employee.hasMany(EmployeeSchedule, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
EmployeeSchedule.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = EmployeeSchedule;
