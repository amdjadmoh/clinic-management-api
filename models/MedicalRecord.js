const sequelize = require('sequelize');
const db = require('../config/database');

const MedicalRecord = db.define('medicalRecord', {
    patientID: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        }
    },
    doctorID: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    doctorName:{
        type: sequelize.STRING,
        allowNull: false,
    },
    specialty:{
        type: sequelize.STRING,
        allowNull: true,
    },
    date: {
        type: sequelize.DATE,
        allowNull: false,
    },
    mainReason:{
        type: sequelize.TEXT,
        allowNull: true,
    },
    examClinic:{
        type: sequelize.TEXT,
        allowNull: true,
    },
    examSup:{
        type: sequelize.TEXT,
        allowNull: true,
    },
    diagnosis: {
        type: sequelize.TEXT,
        allowNull: true,
    },
    treatment: {
        type: sequelize.TEXT,
        allowNull: true,
    },
    note:{
        type: sequelize.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: {
                args: [['pending', 'completed', 'in-progress']],
                msg: "Status must be one of 'pending', 'completed', or 'in-progress'"
            }
        }
    },
}, {
    tableName: 'medicalRecords',
});

module.exports = MedicalRecord;