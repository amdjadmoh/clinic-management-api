'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('InvoiceProcedures', 'doctorId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'doctors',
        key: 'id',
      },
    });
    await queryInterface.addColumn('InvoiceProcedures', 'doctorName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('InvoiceProcedures', 'doctorId');
    await queryInterface.removeColumn('InvoiceProcedures', 'doctorName');
  }
};
