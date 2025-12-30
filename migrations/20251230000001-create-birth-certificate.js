'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('birth_certificates', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      referenceDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      doctorName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      motherFullName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      motherBirthDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      motherPlaceOfBirth: {
        type: Sequelize.STRING,
        allowNull: false
      },
      residence: {
        type: Sequelize.STRING,
        allowNull: true
      },
      spouseFirstName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      spouseLastName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      spouseBirthDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      spousePlaceOfBirth: {
        type: Sequelize.STRING,
        allowNull: true
      },
      deliveryDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deliveryTime: {
        type: Sequelize.STRING,
        allowNull: false
      },
      babyGender: {
        type: Sequelize.ENUM('ذكر', 'انثى'),
        allowNull: false
      },
      babyWeight: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Weight in grams'
      },
      babyName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      nom: {
        type: Sequelize.STRING,
        allowNull: true
      },
      prenoms: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('birth_certificates');
  }
};
