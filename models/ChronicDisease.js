const db = require('../config/database');
const sequelize = require('sequelize');

const ChronicDisease = db.define('chronicdisease',{
    diseaseName:{
        type:sequelize.STRING,
        allowNull:false,
    },
    description:{
        type:sequelize.STRING,
        allowNull:true,
    },
},{
    tableName:'chronicdiseases',
    timestamps:false,
});

module.exports = ChronicDisease;