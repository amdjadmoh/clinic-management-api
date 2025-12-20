const db = require('../config/database');
const { Sequelize } = require('sequelize');
const DrugType = require('./DrugType');



const Drug= db.define('drug',{
    drugTypeID:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
        model:'drugTypes',
            key:'id',
        }
    },
    location:{
        type:Sequelize.STRING,
        allowNull:true
    },
    expiryDate:{
        type:Sequelize.DATE,
        allowNull:true
    },
    quantity:{
        type:Sequelize.INTEGER,
        allowNull:false
    },
    serialNumber:{
        type:Sequelize.STRING,
        allowNull:true
    },
    archived:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue: false
    },

},{
    timestamps:true,
});

const DrugModifaction = db.define('drugModification', {
    drugID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Drug,
            key: 'id',
        },
        onDelete: 'CASCADE'
    },
    quantityChange: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    reason: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    person :{
        type: Sequelize.STRING,
        allowNull: false,
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    }
}, {
    timestamps: false,
});

DrugModifaction.belongsTo(Drug, { foreignKey: 'drugID', onDelete: 'CASCADE' });
Drug.hasMany(DrugModifaction, { foreignKey: 'drugID', onDelete: 'CASCADE' });


Drug.belongsTo(DrugType, {foreignKey: 'drugTypeID', onDelete: 'CASCADE'});
DrugType.hasMany(Drug, {foreignKey: 'drugTypeID', onDelete: 'CASCADE'});
Drug.addScope('defaultScope', {
    include: {
        model: DrugType,
        attributes: ['name','type']
    }
});
Drug.addHook('afterFind', (results) => {
    if (!results) return;

    const transform = (drug) => {
        if (drug.drugType) {
            drug.setDataValue('name', drug.drugType.name);
            drug.setDataValue('type', drug.drugType.type);
            drug.setDataValue('drugType', undefined); // Remove the nested drugType object
        }
    };

    if (Array.isArray(results)) {
        results.forEach(transform);
    } else {
        transform(results);
    }
});

module.exports = {Drug, DrugType,DrugModifaction};


