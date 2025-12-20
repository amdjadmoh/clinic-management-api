const db = require ('../config/database');
const Sequelize = require('sequelize');


const ResultType = db.define('ResultType', {
    resultName: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    technology: {
        type: Sequelize.STRING,
        allowNull: true
    },
    resultPrice:{
        type: Sequelize.FLOAT,
        allowNull:false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    max:{
        type: Sequelize.STRING,
        allowNull: true
    },
    min:{
        type: Sequelize.STRING,
        allowNull: true
    },
    unit:{
        type: Sequelize.STRING,
        allowNull: true
    },
    
        periority: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    hasSubAnalyses: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
},
    {
    tableName:'resultTypes',
    timestamps:false,
});

const SubAnalyses = db.define('SubAnalyses', {
    subAnalysisName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    resultTypeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: ResultType,
            key: 'id'
        }
    },

    min: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    max: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
       unit:{
        type: Sequelize.STRING,
        allowNull: true
    },
    
        periority: {
      type: Sequelize.TEXT,
      allowNull: true
    },
}, {
    tableName: 'subAnalyses',
    timestamps: false
});
const analysisPreSet= db.define('analysisPreSet', {
    "name": {
        type: Sequelize.STRING,
        allowNull: false
    }
})
const analysisPreSetItem = db.define('analysisPreSetItem', {
    "analysisPreSetId": {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: analysisPreSet,
            key: 'id'
        }
    },
    "resultTypeId": {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: ResultType,
            key: 'id'
        }
    }
})

ResultType.hasMany(SubAnalyses, { foreignKey: 'resultTypeId' });
SubAnalyses.belongsTo(ResultType, { foreignKey: 'resultTypeId' });
ResultType.addScope('defaultScope', {
    include: [
        {
            model: SubAnalyses,
            as: 'SubAnalyses',

        }
    ]
});
analysisPreSetItem.belongsTo(ResultType, { foreignKey: 'resultTypeId' });
ResultType.hasMany(analysisPreSetItem, { foreignKey: 'resultTypeId' });
analysisPreSet.hasMany(analysisPreSetItem, { foreignKey: 'analysisPreSetId' });
analysisPreSetItem.belongsTo(analysisPreSet, { foreignKey: 'analysisPreSetId' });
analysisPreSet.addScope('defaultScope', {
    include: [
        {
            model: analysisPreSetItem,
            as: 'analysisPreSetItems',
            include: [
                {
                    model: ResultType,
                    as: 'ResultType'
                }
            ]
        }
    ]
});

module.exports = {SubAnalyses, ResultType,analysisPreSet,analysisPreSetItem}