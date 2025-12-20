const db = require('../config/database');
const Sequelize = require('sequelize');

const BloodTest = db.define('BloodTest', {
    patientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        }
    },
    testDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    testResult:{
        type: Sequelize.STRING,
        allowNull: true,
    },
    testStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        values: ['pending', 'completed', 'cancelled'],
    },
    price: {
        type: Sequelize.FLOAT,
        allowNull: true,
    }
}, {
    tableName: 'bloodTests',
    timestamps: true,
});

const Patient = require('./Patient');
BloodTest.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(BloodTest, { foreignKey: 'patientId' });

BloodTest.addScope('defaultScope', {
    include: [{
        model: Patient,
        attributes: ['name', 'birthdate', 'phone1']
    }]
});
module.exports = BloodTest;