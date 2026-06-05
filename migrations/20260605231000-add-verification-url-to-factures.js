'use strict';
const crypto = require('crypto');
require('dotenv').config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Check if the column already exists to prevent crashes if it was added manually
    const tableDescription = await queryInterface.describeTable('Factures');
    if (!tableDescription.verificationUrl) {
      await queryInterface.addColumn('Factures', 'verificationUrl', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    // 2. Generate URLs for existing old invoices
    const webBackendUrl = process.env.WEB_BACKEND_URL || 'https://win-lm5a80j8ifd.reverse-mark.ts.net';
    
    // Select factures missing the verificationUrl
    const [factures] = await queryInterface.sequelize.query(
      `SELECT id FROM "Factures" WHERE "verificationUrl" IS NULL`
    );

    // Update each record with a unique secure token
    for (const facture of factures) {
      const secureToken = crypto.randomBytes(16).toString('hex');
      const url = `${webBackendUrl}/api/facture/verify/${secureToken}`;
      
      await queryInterface.sequelize.query(
        `UPDATE "Factures" SET "verificationUrl" = :url WHERE id = :id`,
        {
          replacements: { url, id: facture.id }
        }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Factures');
    if (tableDescription.verificationUrl) {
      await queryInterface.removeColumn('Factures', 'verificationUrl');
    }
  }
};
