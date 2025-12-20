const sequelize = require('sequelize');
const { DataTypes } = sequelize;
const db = require('../config/database');
const User = require('./Users');
const Dep = require('./Dep');
const path = require('path');

const File = db.define('file', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fileType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  uploaderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  recipientType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'public'
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  depId : {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
}, {
  tableName: 'files',
  timestamps: true,
  hooks: {
    afterCreate: (file) => {
      console.log(`New file uploaded: ${file.filename}`);
    },
    beforeDestroy: (file) => {
      const fs = require('fs');
      const filePath = file.filePath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File deleted from storage: ${filePath}`);
      }
     
    }
  }
});

// Associations
File.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });
File.belongsTo(Dep, { foreignKey: 'depId', as: 'department' });


module.exports = File;