const sequelize = require ('sequelize');
const db = require ('../config/database');


const Doctors = db.define('doctors',{
    name:{
        type:sequelize.STRING,
        allowNull:false,
    },
    depID:{
        type:sequelize.INTEGER,
        allowNull:false,
    },
    NIN:{
        type:sequelize.STRING,
        allowNull:true
    },
    email:{
        type:sequelize.STRING,
    },
    speciality:{
        type:sequelize.STRING,
        allowNull:false,
    },
    phone:{
        type:sequelize.STRING,
    },
    address:{
        type:sequelize.STRING,
    }
},{
    tableName:'doctors',
    timestamps:false,
});


module.exports = {Doctors};
