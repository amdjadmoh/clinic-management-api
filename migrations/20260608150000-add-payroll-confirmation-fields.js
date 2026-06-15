'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('payrolls');

    if (!tableDescription.confirmedAt) {
      await queryInterface.addColumn('payrolls', 'confirmedAt', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    if (!tableDescription.settingsSnapshot) {
      await queryInterface.addColumn('payrolls', 'settingsSnapshot', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    // Migrate existing statuses: 'unpaid' → 'draft'
    await queryInterface.sequelize.query(
      `UPDATE payrolls SET status = 'draft' WHERE status = 'unpaid'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('payrolls');

    if (tableDescription.confirmedAt) {
      await queryInterface.removeColumn('payrolls', 'confirmedAt');
    }

    if (tableDescription.settingsSnapshot) {
      await queryInterface.removeColumn('payrolls', 'settingsSnapshot');
    }

    // Revert statuses: 'draft' → 'unpaid'
    await queryInterface.sequelize.query(
      `UPDATE payrolls SET status = 'unpaid' WHERE status = 'draft'`
    );
  }
};
