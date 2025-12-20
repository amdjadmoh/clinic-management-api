const db = require ('../config/database');
const Sequelize = require('sequelize');


const ResultTypeUrine = db.define('ResultTypeUrine', {
    resultName: {
        type: Sequelize.STRING,
        allowNull: false
    }
},
    {
    tableName:'resultTypeUrines',
    timestamps:false,
});

const ResultTypeUrineOptions =  db.define('ResultTypeUrineOptions', {
    resultTypeUrineID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'resultTypeUrines',
            key: 'id',
        }
    },
    optionName: {
        type: Sequelize.STRING,
        allowNull: false
    }
},
    {
    tableName:'resultTypeUrineOptions',
    timestamps:false,
});

ResultTypeUrine.hasMany(ResultTypeUrineOptions, { foreignKey: 'resultTypeUrineID' });
ResultTypeUrineOptions.belongsTo(ResultTypeUrine, { foreignKey: 'resultTypeUrineID' });

ResultTypeUrine.addScope('defaultScope',{
    include:{
        model:ResultTypeUrineOptions,
        attributes:['optionName']
    }
});

module.exports = {ResultTypeUrine, ResultTypeUrineOptions};