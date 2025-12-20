const sequelize = require('sequelize');
const {Doctors} = require('./Doctors');
const bcrypt = require('bcrypt');
const db = require('../config/database');

const User = db.define('user', {
  username: {
    type: sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: sequelize.STRING,
    allowNull: false,
  },
  userType: {
    type: sequelize.STRING,
    allowNull: false,
  },
  fullName: {
    type: sequelize.STRING,
    allowNull:true,
  },
  userID: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'doctors',
      key: 'id',
    },
  },
}, {
  tableName: 'users',
  timestamps: false,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.belongsTo(Doctors, { foreignKey: 'userID' });
module.exports = User;