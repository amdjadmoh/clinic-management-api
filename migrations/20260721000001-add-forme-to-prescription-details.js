'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const cols = await queryInterface.describeTable('prescriptionDetails');
        if (!cols.forme) {
            await queryInterface.addColumn('prescriptionDetails', 'forme', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }
    },

    down: async (queryInterface) => {
        const cols = await queryInterface.describeTable('prescriptionDetails');
        if (cols.forme) {
            await queryInterface.removeColumn('prescriptionDetails', 'forme');
        }
    },
};
