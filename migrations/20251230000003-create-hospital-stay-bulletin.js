'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hospital_stay_bulletins', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      patientName: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'اسم المريض'
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'العنوان'
      },
      age: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'العمر'
      },
      profession: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'المهنة'
      },
      hospitalizationStartDate: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'تاريخ بداية الإقامة'
      },
      hospitalizationEndDate: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'تاريخ نهاية الإقامة'
      },
      operatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'الطبيب المعالج'
      },
      date: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'تاريخ إصدار الوثيقة'
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
    await queryInterface.dropTable('hospital_stay_bulletins');
  }
};
