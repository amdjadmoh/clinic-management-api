const { text } = require('body-parser');
const db = require('../config/database');
const { Sequelize } = require('sequelize');

const Record = db.define('record',{
    patientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        }
    },
    doctorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    patientName:{
        type: Sequelize.STRING,
        allowNull: false
    },
    doctorName:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    specialty:{
        type: Sequelize.STRING,
        allowNull: true,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    title:{
        type: Sequelize.STRING,
        allowNull: false,
    },
    text:{
        type: Sequelize.TEXT,
        allowNull: true,
    },

})
module.exports = Record;