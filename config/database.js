const { Sequelize } = require('sequelize');
require('dotenv').config();

let db;
if (process.env.DB_CONNECTION_STRING) {
  db = new Sequelize(process.env.DB_CONNECTION_STRING, {
    timezone: process.env.DB_TIMEZONE || '+01:00',
  });
} else if (process.env.DB_NAME && process.env.DB_USER) {
  db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    timezone: process.env.DB_TIMEZONE || '+01:00',
  });
} else {
  throw new Error('Database connection parameters are missing. Please set DB_CONNECTION_STRING or individual DB variables.');
}

module.exports = db;


