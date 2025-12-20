const db = require("../config/database");
const Sequelize = require("sequelize");
const ResultType = require("./ResultType");
const ResultTypeUrine = require("./ResultTypeUrine");
const ResultLine = db.define(
  "ResultLine",
  {
    resultID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      refernces: {
        model: "Results",
        key: "id",
      },
    },
    resultTypeID: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    resultName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    resultPrice: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
   max:{
        type: Sequelize.STRING,
        allowNull: true
    },
    min:{
        type: Sequelize.STRING,
        allowNull: true
    },
    unit: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    resultValue: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    technology: {
      type: Sequelize.STRING,
      allowNull: true
    },
    periority: {
      type: Sequelize.TEXT,
      allowNull: true
    },
 hasSubAnalyses: {
        type: Sequelize.BOOLEAN,
        allowNull: true
    }  ,
  },
  {
    tableName: "resultLines",
    timestamps: false,
  }
);

const ResultLineUrine = db.define(
  "ResultLineUrine",
  {
    resultID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      refernces: {
        model: "Results",
        key: "id",
      },
    },
   resultTypeID: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    resultName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    optionName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "resultLinesUrine",
    timestamps: false,
  }
);

const ResultLineSubAnalyses = db.define(
  "ResultLineSubAnalyses",
  {
    resultLineID: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "resultLines",
        key: "id",
      },
    },
    subAnalysisID:{
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    subAnalysisName: {
      type: Sequelize.STRING,
      allowNull: false
      },
      min: {
          type: Sequelize.FLOAT,
          allowNull: true
      },
      max: {
          type: Sequelize.FLOAT,
          allowNull: true
      },
         unit:{
          type: Sequelize.STRING,
          allowNull: true
      },
      
          periority: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true
      },
  },
  {
    tableName: "resultLinesSubAnalyses",
    timestamps: false,
  }
);

module.exports = {ResultLineUrine,ResultLine, ResultLineSubAnalyses};
