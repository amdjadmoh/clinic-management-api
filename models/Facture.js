const db = require("../config/database");
const Sequelize = require("sequelize");
const Procedures = require("./PreDefinedProcedure");
const Patient = require("./Patient");

const Facture = db.define("Facture", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  patientID: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  PatientName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  birthdate: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  patientAddress: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  patientPhone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  website: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  NIS: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  NIF: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  RC: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  IBAN: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  totalHT: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  totalTVA: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  totalTTC: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  paimentType: {
    type:Sequelize.STRING,
    allowNull: true,
  },
  discount:{
    type:Sequelize.FLOAT,
    allowNull: true,
  },
  isCovered: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  coverageType: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  coverageAmount: {
    type: Sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  NIN: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  assuranaceNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
},
{
  hooks: {
    beforeCreate: async (facture) => {
      const year = new Date(facture.date).getFullYear();
      const sequenceName = `seq_${year}`;

      // Check if the sequence exists, and create it if it doesn't
      const [result] = await db.query(
        `SELECT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = '${sequenceName}')`
      );

      if (!result.exists) {
        await db.query(`CREATE SEQUENCE IF NOT EXISTS ${sequenceName} START 1;`);
      }

      // Get the next value from the sequence
      const [nextValResult] = await db.query(`SELECT nextval('${sequenceName}')`);
      const nextVal = nextValResult[0].nextval;

      // Set the id in the format "year/number"
      facture.id = `${year}/${nextVal}`;
    }
  },
});

const FactureProcedure = db.define("FactureProcedure", {
  factureID: {
    type: Sequelize.STRING,
  },
  procedureName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  cost: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  tva: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  montantHT: {
        type: Sequelize.FLOAT,
        allowNull: false,
  },
  montantTVA: {
        type: Sequelize.FLOAT,
        allowNull: false,
  },
  coveragePercentage: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  coverageAmount: {
    type: Sequelize.FLOAT,
    allowNull: true,
  },
  procedureType: {
    type: Sequelize.STRING,
    allowNull: true,
  },
},);


Facture.hasMany(FactureProcedure, { foreignKey: "factureID" , onDelete: "CASCADE" });
FactureProcedure.belongsTo(Facture, { foreignKey: "factureID" });


Facture.addScope("defaultScope", {
  include: {
    model : FactureProcedure,
    attributes: ["id", "procedureName", "cost", "quantity", "date", "tva", "montantHT", "montantTVA" ,"coveragePercentage", "coverageAmount", "procedureType"
    ],
  }
});
module.exports = { Facture, FactureProcedure };
