'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add phone fields to OperationCostDeclarations
    await queryInterface.addColumn('OperationCostDeclarations', 'phone1', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('OperationCostDeclarations', 'phone2', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    
    // Add phone fields to consent_certificates
    await queryInterface.addColumn('consent_certificates', 'phone1', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('consent_certificates', 'phone2', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OperationCostDeclarations', 'phone1');
    await queryInterface.removeColumn('OperationCostDeclarations', 'phone2');
    await queryInterface.removeColumn('consent_certificates', 'phone1');
    await queryInterface.removeColumn('consent_certificates', 'phone2');
  }
};
