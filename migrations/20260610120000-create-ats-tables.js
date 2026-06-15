'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('ats')) {
      await queryInterface.createTable('ats', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        agence: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        centrePaiement: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employerName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employerAdherentNumber: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employerAddress: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employeeNom: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employeePrenom: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employeeSocialSecurityNumber: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employeeDateOfBirth: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        employeePlaceOfBirth: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employeeAddress: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        employeeProfession: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        dateRecrutement: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dateDernierJourTravail: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dateRepriseTravail: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        nonReprisCeJour: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        dureeMoins6mJours: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        dureeMoins6mHeures: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        dureeMoins6mDu: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dureeMoins6mAu: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dureePlus6mJours: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        dureePlus6mHeures: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        dureePlus6mDu: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        dureePlus6mAu: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        volumeHoraireJournalier: {
          type: Sequelize.DECIMAL(4, 2),
          allowNull: true,
        },
        faitA: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        faitLe: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        signataireNomPrenomQualite: {
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
    }

    if (!tables.includes('ats_salary_histories')) {
      await queryInterface.createTable('ats_salary_histories', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        atsId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'ats',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        referencePeriod: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        joursTravailles: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        motifAbsence: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        salaireCotisable: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
        },
        cotisationOuvriere: {
          type: Sequelize.DECIMAL(15, 2),
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
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ats_salary_histories');
    await queryInterface.dropTable('ats');
  }
};
