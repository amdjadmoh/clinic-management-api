const database = require('../config/database');
const db= require('../config/database');
const Dep = require('./Dep');
const { Sequelize } = require('sequelize');

const Appointment = db.define('appointment', {
    date: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: {
                args: [['pending', 'completed']],
                msg: "Status must be one of 'pending', 'completed' "
            }
        }
    },
    patientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        }

    },
    depID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id',
        }
    },
    doctorID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'doctors',
            key: 'id',
        }
    },
    note: {
        type: Sequelize.STRING,
        allowNull: true,
    }

}, {
    tableName: 'appointments'
});


module.exports = Appointment;