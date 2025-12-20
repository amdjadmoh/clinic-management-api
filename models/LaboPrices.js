const db = require('../config/database');
const Sequelize = require('sequelize');

const LaboPrices = db.define('LaboPrices', {
    price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    tableName: 'laboPrices'
});

const createDefaultEntries = async () => {
    const defaultPrices = [
        { name: 'test de groupe sanguin', price: 50 ,id:1},
        { name: 'analyse d\'urine', price: 30, id:2},
    ];
    for (const entry of defaultPrices) {
        await LaboPrices.findOrCreate({
            where: { name: entry.name },
            defaults: { price: entry.price , id: entry.id }
        });
    }
};
LaboPrices.addHook('afterSync', async () => {
    await createDefaultEntries();
});



module.exports = LaboPrices;