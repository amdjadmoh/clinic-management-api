const sequelize = require('sequelize');
const db = require('../config/database');
const Users = require('./Users');
const { Doctors } = require('./Doctors');
const Job = require('./Job');
const Dep = require('./Dep');

const Employee = db.define('employee', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  fullName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    }
  },
  doctorId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'doctors',
      key: 'id',
    }
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id',
    }
  },
  startDate: {
    type: sequelize.DATEONLY,
    allowNull: false,
    defaultValue: sequelize.NOW,
  },
  status: {
    type: sequelize.STRING,
    allowNull: false,
    defaultValue: 'active',
  },
  zktecoId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  depId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id',
    }
  },
  bankAccountNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  socialSecurityNumber: {
    type: sequelize.STRING,
    allowNull: true,
  }
}, {
  tableName: 'employees',
  timestamps: false,
});

Employee.belongsTo(Users, { foreignKey: 'userId', onDelete: 'SET NULL' });
Employee.belongsTo(Doctors, { foreignKey: 'doctorId', onDelete: 'SET NULL' });
Employee.belongsTo(Job, { foreignKey: 'jobId', onDelete: 'SET NULL' });
Employee.belongsTo(Dep, { foreignKey: 'depId', onDelete: 'SET NULL' });

module.exports = Employee;
