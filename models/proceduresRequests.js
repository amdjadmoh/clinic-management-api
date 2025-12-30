const db = require('../config/database');
const { Sequelize } = require('sequelize');
const Patient = require('./Patient');
const PreDefinedProcedure = require('./PreDefinedProcedure');
const status= ['Pending', 'Completed', 'Cancelled'];
const ProceduresRequest = db.define('proceduresRequest', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    PatientID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'patients',
            key: 'id',
            onDelete: 'CASCADE'
        }
    },
    PatientName: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    gender:{
        type: Sequelize.STRING,
        allowNull: true,
    },
    birthdate:{
        type: Sequelize.DATE,
        allowNull: true,
    },
    status: {
        type: Sequelize.ENUM,
        values: status,
        defaultValue: 'Pending',
    },
    completeDate:{
        type:Sequelize.DATE,
        allowNull:true
    }
    
}, {
    tableName: 'proceduresrequests',
});
const ProceduresRequestItems = db.define('proceduresRequestItems', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    proceduresRequestID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'proceduresrequests',
            key: 'id',
            onDelete: 'CASCADE'
        }
    },
    preDefinedProcedureID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'predefinedprocedures',
            key: 'id',
            onDelete: 'CASCADE'
        }
    },
    quantity:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    note:{
        type:Sequelize.TEXT,
        allowNull:true
    }
}, {
    tableName: 'proceduresrequestitems',
});

ProceduresRequestItems.belongsTo(ProceduresRequest, { foreignKey: 'proceduresRequestID' });
ProceduresRequest.hasMany(ProceduresRequestItems, { foreignKey: 'proceduresRequestID' });
ProceduresRequestItems.belongsTo(PreDefinedProcedure, { foreignKey: 'preDefinedProcedureID' });
PreDefinedProcedure.hasMany(ProceduresRequestItems, { foreignKey: 'preDefinedProcedureID' });

Patient.hasMany(ProceduresRequest, { foreignKey: 'PatientID' });
ProceduresRequest.belongsTo(Patient, { foreignKey: 'PatientID' });

module.exports = { ProceduresRequest, ProceduresRequestItems };


