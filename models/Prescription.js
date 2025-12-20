
const sequelize = require('sequelize');
const db = require('../config/database');

const Prescription = db.define('prescription', {
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
    name:{
            type:sequelize.STRING,
            allowNull:false,
        },
        speciality:{
            type:sequelize.STRING,
            allowNull:false,
        },
    note: {
        type: sequelize.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'prescriptions',
    timestamps: true,
});








module.exports = Prescription;

