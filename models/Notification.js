const sequelize = require('sequelize');
const { DataTypes } = sequelize;
const db = require('../config/database');
const User = require('./Users');
const Dep = require('./Dep');

const Notification = db.define('notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  recipientType: {
    type: DataTypes.ENUM('user', 'department', 'accountType', 'all'),
    allowNull: false,
    defaultValue: 'all'
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  accountType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  depId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  tableName: 'notifications',
  timestamps: true
});

// Associations
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(Dep, { foreignKey: 'depId', as: 'department' });

module.exports = Notification;
