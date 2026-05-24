'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('leaves')) {
      await queryInterface.createTable('leaves', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        employeeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'employees',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        startDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        endDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'annual',
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'pending',
        },
        reason: {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('leaves');
  }
};
