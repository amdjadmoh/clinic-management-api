const db = require('../config/database');
const { Sequelize } = require('sequelize');
const Patient = require('./Patient');
const { Doctors } = require('./Doctors');

const PatientCertificate = db.define('patientCertificate', {
    patientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id'
        }
    },
    doctorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'id'
        }
    },
    certificateType: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['maladie', 'aptitude', 'presence', 'general']],
                msg: "certificateType must be one of 'maladie', 'aptitude', 'presence', 'general'"
            }
        }
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    text: {
        type: Sequelize.TEXT,
        allowNull: false,
    }
}, {
    tableName: 'patient_certificates',
    timestamps: true
});

PatientCertificate.belongsTo(Patient, { foreignKey: 'patientID', onDelete: 'CASCADE' });
Patient.hasMany(PatientCertificate, { foreignKey: 'patientID', onDelete: 'CASCADE' });

PatientCertificate.belongsTo(Doctors, { foreignKey: 'doctorID', onDelete: 'CASCADE' });
Doctors.hasMany(PatientCertificate, { foreignKey: 'doctorID', onDelete: 'CASCADE' });

module.exports = PatientCertificate;
