const sequelize = require('sequelize');
const { DataTypes } = sequelize;
const db = require('../config/database');
const Employee = require('./Employee');

const EmployeeFile = db.define('employee_file', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
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
  documentType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'other' // e.g., 'contract', 'cv', 'id', 'certification', 'other'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'employee_files',
  timestamps: true,
  hooks: {
    beforeDestroy: (file) => {
      const fs = require('fs');
      const filePath = file.filePath;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Employee file deleted from storage: ${filePath}`);
      }
    }
  }
});

// Associations
Employee.hasMany(EmployeeFile, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
EmployeeFile.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = EmployeeFile;
