'use strict';
const sequelize = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('prescriptionTemplates', {
      id:{
          type:sequelize.INTEGER,
          autoIncrement:true,
          primaryKey:true,
      },
       templateName:{
              type:sequelize.STRING,
              allowNull:false,
          },
            doctorID:{
                type:sequelize.INTEGER,
                allowNull:false,
                references:{
                    model:'doctors',
                    key:'id',
                },
                onUpdate:'CASCADE',
                onDelete:'CASCADE',
            }

    },{
        tableName:'prescriptionTemplates'
        });  
    await queryInterface.createTable('prescriptionTemplateDetails', {
      id : {
          type:sequelize.INTEGER,
          autoIncrement:true,
          primaryKey:true,
      },
       templateID:{
              type:sequelize.INTEGER,
              allowNull:false,
              references:{
                  model:'prescriptionTemplates',
                  key:'id',
              }
          },
           medicineName:{
              type:sequelize.STRING,
              allowNull:false,
          },
          dosage:{
              type:sequelize.STRING,
              allowNull:true,
          },
          quantity:{
              type:sequelize.INTEGER,
              allowNull:true,
          },
          quantityType:{
              type:sequelize.STRING,
              allowNull:true,
          },
          note:{
              type:sequelize.STRING,
              allowNull:true,
          },
          note2:{
              type:sequelize.STRING,
              allowNull:true,
          },
          note3:{
              type:sequelize.STRING,
              allowNull:true,
          },
    },{
        tableName:'prescriptionTemplateDetails',    }); 
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('prescriptionTemplateDetails');
    await queryInterface.dropTable('prescriptionTemplates');
  }
};
