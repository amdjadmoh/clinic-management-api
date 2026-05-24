'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add extra columns to employees table
    const employeesTable = await queryInterface.describeTable('employees');
    if (!employeesTable.phoneNumber) {
      await queryInterface.addColumn('employees', 'phoneNumber', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!employeesTable.depId) {
      await queryInterface.addColumn('employees', 'depId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id',
        },
        onDelete: 'SET NULL',
      });
    }
    if (!employeesTable.bankAccountNumber) {
      await queryInterface.addColumn('employees', 'bankAccountNumber', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // 2. Add settings column to users table
    const usersTable = await queryInterface.describeTable('users');
    if (!usersTable.settings) {
      await queryInterface.addColumn('users', 'settings', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('employees', 'phoneNumber');
    await queryInterface.removeColumn('employees', 'depId');
    await queryInterface.removeColumn('employees', 'bankAccountNumber');
    await queryInterface.removeColumn('users', 'settings');
  }
};
