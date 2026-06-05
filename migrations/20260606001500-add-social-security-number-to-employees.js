'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('employees');
    if (!tableDescription.socialSecurityNumber) {
      await queryInterface.addColumn('employees', 'socialSecurityNumber', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('employees');
    if (tableDescription.socialSecurityNumber) {
      await queryInterface.removeColumn('employees', 'socialSecurityNumber');
    }
  }
};
