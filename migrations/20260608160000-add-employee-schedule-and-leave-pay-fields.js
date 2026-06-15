'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create employee_schedules table
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('employee_schedules')) {
      await queryInterface.createTable('employee_schedules', {
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
        dayOfWeek: {
          type: Sequelize.INTEGER, // 0=Sunday ... 6=Saturday
          allowNull: false,
        },
        startTime: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        endTime: {
          type: Sequelize.STRING,
          allowNull: false,
        }
      });
    }

    // 2. Add paidPercentage and paidDays to leaves table
    const leavesDescription = await queryInterface.describeTable('leaves');

    if (!leavesDescription.paidPercentage) {
      await queryInterface.addColumn('leaves', 'paidPercentage', {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 100,
      });
    }

    if (!leavesDescription.paidDays) {
      await queryInterface.addColumn('leaves', 'paidDays', {
        type: Sequelize.DECIMAL,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop schedule table
    const tables = await queryInterface.showAllTables();
    if (tables.includes('employee_schedules')) {
      await queryInterface.dropTable('employee_schedules');
    }

    // Remove leave columns
    const leavesDescription = await queryInterface.describeTable('leaves');

    if (leavesDescription.paidPercentage) {
      await queryInterface.removeColumn('leaves', 'paidPercentage');
    }

    if (leavesDescription.paidDays) {
      await queryInterface.removeColumn('leaves', 'paidDays');
    }
  }
};
