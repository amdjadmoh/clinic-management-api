const db = require ('../config/database');
const { Sequelize } = require('sequelize');
const Drug= require('./Drug');

const DrugUsage = db.define('drugUsage',{
    drugID:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
            model:Drug,
            key:'id',
        }
    },
    quantity:{
        type:Sequelize.INTEGER,
        allowNull:false,
    },
    note:{
        type:Sequelize.STRING,
        allowNull:true,
    },
},{
    timestamps:true,
});
