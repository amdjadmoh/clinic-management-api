'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create payroll_payments table
    await queryInterface.createTable('payroll_payments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      payrollId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payrolls',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      }
    });

    // 2. Create payroll_adjustments table
    await queryInterface.createTable('payroll_adjustments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      payrollId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'payrolls',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      amount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 3. Migrate existing data from payrolls.details
    try {
      const [payrolls] = await queryInterface.sequelize.query(
        `SELECT id, details FROM payrolls WHERE details IS NOT NULL`
      );

      for (const row of payrolls) {
        if (!row.details) continue;
        try {
          const parsed = typeof row.details === 'string' ? JSON.parse(row.details) : row.details;
          
          // Migrate payments
          if (parsed && Array.isArray(parsed.payments)) {
            for (const pay of parsed.payments) {
              await queryInterface.bulkInsert('payroll_payments', [{
                payrollId: row.id,
                amount: parseFloat(pay.amount) || 0,
                date: pay.date ? new Date(pay.date) : new Date(),
                notes: pay.notes || ''
              }]);
            }
          }

          // Migrate adjustments
          if (parsed && Array.isArray(parsed.adjustments)) {
            for (const adj of parsed.adjustments) {
              await queryInterface.bulkInsert('payroll_adjustments', [{
                payrollId: row.id,
                amount: parseFloat(adj.amount) || 0,
                description: adj.description || 'One-time adjustment',
                date: adj.date ? new Date(adj.date) : new Date()
              }]);
            }
          }
        } catch (err) {
          console.error(`Error migrating payroll id ${row.id}:`, err);
        }
      }
    } catch (dbErr) {
      console.log('No payrolls table or unable to fetch existing payrolls for migration:', dbErr.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payroll_payments');
    await queryInterface.dropTable('payroll_adjustments');
  }
};
