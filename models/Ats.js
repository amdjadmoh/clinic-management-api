const { Sequelize } = require('sequelize');
const db = require('../config/database');

const Ats = db.define('ats', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // Agency Details
  agence: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  centrePaiement: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  // Employer Identification
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
  // Employee Snapshot (for historical immutability)
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
  // Leave/Work Right Study Details
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
  // Period < 6 months / Maternity
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
  // Period >= 6 months / Invalidity
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
  // Signatory Details
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
  }
}, {
  tableName: 'ats',
  timestamps: true,
});

module.exports = Ats;
