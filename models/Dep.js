const sequelize = require('sequelize');
const db = require('../config/database');
const PreDefinedProcedure = require('./PreDefinedProcedure');
const Queue = require('./Queue');

const Dep = db.define('dep',{
    depName:{
        type:sequelize.STRING,
        allowNull:false,
    },
    depArabicName:{
        type:sequelize.STRING,
        allowNull:true,
    },
    depEnglishName:{
        type:sequelize.STRING,
        allowNull:true,
    },
    defaultProcedure:{
        type:sequelize.INTEGER,
        allowNull:true,
        references:{
            model:"predefinedprocedures",
            key:'id'
        }
    },
},{
    tableName:'departments',
    timestamps:false,
});
Dep.belongsTo(PreDefinedProcedure, { foreignKey: 'defaultProcedure', targetKey: 'id' , onDelete: 'CASCADE' });
PreDefinedProcedure.hasOne(Dep, { foreignKey: 'defaultProcedure' });

Queue.belongsTo(Dep, { foreignKey: 'depID', onDelete: 'CASCADE' });
Dep.hasMany(Queue, { foreignKey: 'depID', onDelete: 'CASCADE' });

Dep.addScope('defaultScope', {
    include: {
        model: PreDefinedProcedure,
        attributes: ['procedureName', 'cost']
    }
});


module.exports = Dep;
