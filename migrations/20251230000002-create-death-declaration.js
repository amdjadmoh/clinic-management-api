'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('death_declarations', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'الاسم و اللقب'
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'العنوان'
      },
      year: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'سنة'
      },
      month: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'شهر'
      },
      day: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'في'
      },
      sectorManager: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'مدير القطاع الصحي'
      },
      daira: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'لدائرة'
      },
      civilStatusOfficer: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ضابط الحالة المدنية للبلدية'
      },
      deceasedName: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'المسمى(ة)'
      },
      ageAtDeath: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'العمر'
      },
      placeOfBirth: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'المولود(ة) في'
      },
      dateOfBirth: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'تاريخ الميلاد'
      },
      stateOfBirth: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ولاية'
      },
      sonOf: {
        type: Sequelize.STRING,
        allowNull: true
      },
      entryDate: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'دخل (ت) القطاع الصحي في'
      },
      dateOfDeath: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'تاريخ الوفاة'
      },
      hourOfDeath: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'توفي (ت) في'
      },
      causeOfDeath: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'على اثر'
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
    await queryInterface.dropTable('death_declarations');
  }
};
