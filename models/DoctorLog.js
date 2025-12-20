const sequelize = require('sequelize');
const db = require('../config/database');
const {Doctors} = require('./Doctors');
const Patient = require('./Patient');
const DoctorWorkLog = db.define('DoctorWorkLog', {
    doctorID: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'id',
        }
    },
    patientID: {
        type: sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'patients',
            key: 'id',
        }
    },
    procedureID: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    procedureName:{
        type: sequelize.STRING,
        allowNull: false,
    },
    procedureType:{
        type: sequelize.STRING,
        allowNull: true,
    },
    procedureCost: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    date: {
        type: sequelize.DATE,
        allowNull: false,
    }
});


Doctors.hasMany(DoctorWorkLog, {foreignKey: 'doctorID', onDelete: 'CASCADE'});
DoctorWorkLog.belongsTo(Doctors, {foreignKey: 'doctorID'});
Patient.hasMany(DoctorWorkLog, {foreignKey: 'patientID'});
DoctorWorkLog.belongsTo(Patient, {foreignKey: 'patientID'});

DoctorWorkLog.addScope('defaultScope', {
    include: [
        {
            model: Doctors,
            attributes: ['name']
        },
        {
            model: Patient,
            attributes: ['name']
        }
    ]

});


module.exports = DoctorWorkLog;