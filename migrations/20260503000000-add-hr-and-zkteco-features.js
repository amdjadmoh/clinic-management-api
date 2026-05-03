'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    // 1. Create jobs table if not exists
    if (!tables.includes('jobs')) {
      await queryInterface.createTable('jobs', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        defaultSettings: {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      });
    }

    // 2. Create employees table if not exists
    if (!tables.includes('employees')) {
      await queryInterface.createTable('employees', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        fullName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        doctorId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'doctors',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        jobId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'jobs',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        startDate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_DATE'),
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'active',
        },
        zktecoId: {
          type: Sequelize.STRING,
          allowNull: true,
        }
      });
    } else {
      // If employees table exists, make sure zktecoId column exists
      const desc = await queryInterface.describeTable('employees');
      if (!desc.zktecoId) {
        await queryInterface.addColumn('employees', 'zktecoId', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    }

    // 3. Create employee_payment_settings table
    if (!tables.includes('employee_payment_settings')) {
      await queryInterface.createTable('employee_payment_settings', {
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
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        value: {
          type: Sequelize.DECIMAL,
          allowNull: false,
        },
        procedureId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        expectedDays: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 30,
        }
      });
    } else {
      const desc = await queryInterface.describeTable('employee_payment_settings');
      if (!desc.expectedDays) {
        await queryInterface.addColumn('employee_payment_settings', 'expectedDays', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 30,
        });
      }
    }

    // 3.5 Create attendances table
    if (!tables.includes('attendances')) {
      await queryInterface.createTable('attendances', {
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
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        clockIn: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        clockOut: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'present',
        },
        hoursWorked: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true,
          defaultValue: 0.0,
        }
      });
    }

    // 4. Create payrolls table
    if (!tables.includes('payrolls')) {
      await queryInterface.createTable('payrolls', {
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
        month: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        fixedSalaryEarned: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          defaultValue: 0,
        },
        hourlySalaryEarned: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          defaultValue: 0,
        },
        commissionEarned: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          defaultValue: 0,
        },
        bonusEarned: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          defaultValue: 0,
        },
        totalEarned: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          defaultValue: 0,
        },
        totalPaid: {
          type: Sequelize.DECIMAL,
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'unpaid',
        },
        paymentDate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        details: {
          type: Sequelize.TEXT,
          allowNull: true,
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payrolls');
    await queryInterface.dropTable('attendances');
    await queryInterface.dropTable('employee_payment_settings');
    await queryInterface.dropTable('employees');
    await queryInterface.dropTable('jobs');
  }
};
