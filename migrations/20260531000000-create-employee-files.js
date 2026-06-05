'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('employee_files')) {
      await queryInterface.createTable('employee_files', {
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
        filename: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        filePath: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        fileSize: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        fileType: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        documentType: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'other',
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('employee_files');
  }
};
