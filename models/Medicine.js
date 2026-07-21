const db = require('../config/database');
const sequelize = require('sequelize');

const Medicine = db.define('medicine', {
    medicineName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    medicineComName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    dosage: {
        type: sequelize.TEXT,
        allowNull: true,
    },
    code: {
        type: sequelize.TEXT,
        allowNull: true,
    },
    forme: {
        type: sequelize.STRING,
        allowNull: true,
    },
    packaging: {
        type: sequelize.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'medicines',
    timestamps: false,
});

module.exports = Medicine;
