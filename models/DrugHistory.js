const db = require('../config/database');
const { sequelize, DataTypes } = require('sequelize');
const DrugType = require('./DrugType');
const {Drug} = require('./Drug');

const DrugHistory= db.define('drugHistory',{
    drugID:{
        type:DataTypes.INTEGER,
        allowNull:false,
        refernces:{
            model:'drugType',
            key:'id'
        },
        onDelete:'CASCADE'

    },
    drugID2:{
        type:DataTypes.INTEGER,
        allowNull:true,
        refernces:{
            model:'drug',
            key:'id'
        },
        onDelete:'CASCADE'
    },
    quantity:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    usedQuantity:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    date:{
        type:DataTypes.DATEONLY,
        allowNull:false,
        defaultValue: DataTypes.NOW
    },
    person:{
        type:DataTypes.STRING
    },
    service:{
        type:DataTypes.STRING
    },
    subService:{
        type:DataTypes.STRING
    }

},{
    timestamps:false
});
DrugHistory.belongsTo(Drug,{foreignKey:'drugID2'});
DrugHistory.belongsTo(DrugType,{foreignKey:'drugID'});
DrugType.hasMany(DrugHistory,{foreignKey:'drugID'});

DrugHistory.addScope('defaultScope', {
    include: DrugType
  }, { override: true });

module.exports = DrugHistory;