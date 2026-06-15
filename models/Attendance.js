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
    // Full datetime string: "YYYY-MM-DD HH:mm:ss"
    // Used as the unique key per (employeeId, clockIn) for upsert-safe syncing.
    // A null clockIn means the employee was only seen leaving (missed clock-in).
    type: sequelize.STRING,
    allowNull: true,
  },
  clockOut: {
    // Full datetime string: "YYYY-MM-DD HH:mm:ss"
    // A null clockOut means the shift was never closed (missed clock-out or still open).
    type: sequelize.STRING,
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
