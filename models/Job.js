const sequelize = require('sequelize');
const db = require('../config/database');

const Job = db.define('job', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: sequelize.STRING,
    allowNull: true,
  },
  defaultSettings: {
    type: sequelize.TEXT,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('defaultSettings');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('defaultSettings', value ? JSON.stringify(value) : null);
    }
  }
}, {
  tableName: 'jobs',
  timestamps: false,
});

module.exports = Job;
