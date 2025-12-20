const db = require('../config/database');
const Sequelize = require('sequelize');

const Enterprise = db.define('Enterprise',{
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    address :{
        type:Sequelize.STRING,
        allowNull: false
    },
    name :{
        type:Sequelize.STRING,
        allowNull: false
    },
    phone :{
        type:Sequelize.STRING,
        allowNull: false
    },
    email :{
        type:Sequelize.STRING,
        allowNull: false
    },
    website:{
        type:Sequelize.STRING,
        allowNull: false
    },
    NIS :{
        type:Sequelize.STRING,
        allowNull: false
    },
    NIF :{
        type:Sequelize.STRING,
        allowNull: false
    },
    RC :{
        type:Sequelize.STRING,
        allowNull: false
    },
    IBAN : {
        type:Sequelize.STRING,
        allowNull: false
    },
    

})

module.exports = Enterprise;