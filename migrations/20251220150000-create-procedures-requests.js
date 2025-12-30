"use strict";
const sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "proceduresrequests",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        PatientID: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "patients",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        PatientName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        gender: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        birthdate: {
          type: Sequelize.DATE,
          allowNull: true
                },

        status: {
          type: Sequelize.ENUM,
          values: ["Pending", "Completed", "Cancelled"],
          defaultValue: "Pending",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        completeDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        tableName: "proceduresrequests",
      }
    );

    await queryInterface.createTable(
      "proceduresrequestitems",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        proceduresRequestID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "proceduresrequests",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        preDefinedProcedureID: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "predefinedprocedures",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },quantity:{
                type:Sequelize.INTEGER,
                allowNull:false,
            },
            note:{
                type:Sequelize.TEXT,
                allowNull:true
            }
      },
      {
        tableName: "proceduresrequestitems",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("proceduresrequestitems");
    await queryInterface.dropTable("proceduresrequests");
  },
};
