const db = require('../config/database');
const sequelize = require('sequelize');

const PreDefinedProcedure = db.define('predefinedprocedure',{
    procedureName:{
        type:sequelize.STRING,
        allowNull:false,
    },
    description:{
        type:sequelize.STRING,
        allowNull:true,
    },
    cost:{
        type:sequelize.INTEGER,
        allowNull:false,
    },
    type:{
        type:sequelize.STRING,
        allowNull:true
    },
    maxCost:{
        type:sequelize.INTEGER,
        allowNull:true,
    },
},{
    tableName:'predefinedprocedures',
    timestamps:false,
});

module.exports = PreDefinedProcedure;
