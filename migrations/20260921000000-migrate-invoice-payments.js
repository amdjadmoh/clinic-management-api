'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, explicitly create the table if it doesn't exist so the insert doesn't fail
    await queryInterface.createTable('InvoicePayments', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      invoiceID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'invoiceId',
        },
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      note: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      receivedBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Then we migrate the data
    await queryInterface.sequelize.query(`
      INSERT INTO "InvoicePayments" (
        "invoiceID", 
        "amount", 
        "date", 
        "receivedBy", 
        "note", 
        "createdAt", 
        "updatedAt"
      )
      SELECT 
        "invoiceId", 
        ("invoiceAmount" - COALESCE("remise", 0)), 
        "paimentDate", 
        "paidTo", 
        'Legacy payment', 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP
      FROM "invoices"
      WHERE "invoiceStatus" = 'paid';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove the migrated legacy payments if we need to rollback
    await queryInterface.sequelize.query(`
      DELETE FROM "InvoicePayments" 
      WHERE "note" = 'Legacy payment';
    `);
  }
};
