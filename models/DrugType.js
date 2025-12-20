const db = require('../config/database');
const { Sequelize } = require('sequelize');


const DrugType = db.define('drugType',{
    name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    description:{
        type:Sequelize.STRING,
        allowNull:true,
    },
    type:{
        type:Sequelize.STRING,
        allowNull:true,
    },
    serialNumber:{
        type:Sequelize.STRING,
        allowNull:true,
    },
},{ 
    tableName:'drugTypes',
    timestamps:false,
})

module.exports = DrugType;