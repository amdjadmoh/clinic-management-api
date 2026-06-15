const { Sequelize } = require('sequelize');
const db = require('../config/database');
const Ats = require('./Ats');

const AtsSalaryHistory = db.define('atsSalaryHistory', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  atsId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'ats',
      key: 'id',
    }
  },
  referencePeriod: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  joursTravailles: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  motifAbsence: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  salaireCotisable: {
    type: Sequelize.DECIMAL(15, 2),
    allowNull: true,
  },
  cotisationOuvriere: {
    type: Sequelize.DECIMAL(15, 2),
    allowNull: true,
  }
}, {
  tableName: 'ats_salary_histories',
  timestamps: true,
});

Ats.hasMany(AtsSalaryHistory, { foreignKey: 'atsId', onDelete: 'CASCADE' });
AtsSalaryHistory.belongsTo(Ats, { foreignKey: 'atsId' });

module.exports = AtsSalaryHistory;
