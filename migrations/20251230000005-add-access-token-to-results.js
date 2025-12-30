'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First add the column as nullable
    await queryInterface.addColumn('results', 'accessToken', {
      type: Sequelize.UUID,
      allowNull: true,
      unique: true
    });
    
    // Generate UUIDs for existing records
    const [results] = await queryInterface.sequelize.query(
      'SELECT id FROM results WHERE "accessToken" IS NULL'
    );
    
    for (const result of results) {
      await queryInterface.sequelize.query(
        'UPDATE results SET "accessToken" = :token WHERE id = :id',
        {
          replacements: {
            token: uuidv4(),
            id: result.id
          }
        }
      );
    }
    
    // Now make it NOT NULL
    await queryInterface.changeColumn('results', 'accessToken', {
      type: Sequelize.UUID,
      allowNull: false,
      unique: true
    });
    
    // Add tokenExpiresAt column with default 1 month from now for existing records
    await queryInterface.addColumn('results', 'tokenExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Token expiration date. Default is 1 month from creation'
    });
    
    // Set expiration date for existing records (1 month from now)
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    
    await queryInterface.sequelize.query(
      'UPDATE results SET "tokenExpiresAt" = :expiryDate WHERE "tokenExpiresAt" IS NULL',
      {
        replacements: {
          expiryDate: oneMonthFromNow
        }
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('results', 'accessToken');
    await queryInterface.removeColumn('results', 'tokenExpiresAt');
  }
};