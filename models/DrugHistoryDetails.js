const db = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');
const DrugHistory = require('./DrugHistory');

const DrugHistoryDetails = db.define('drugHistoryDetails', {
    drugHistoryID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'drugHistories',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    patientName: {
        type: DataTypes.STRING
    }
}, {
    timestamps: false
});

module.exports = DrugHistoryDetails;