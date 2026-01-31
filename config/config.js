// filepath: f:\dev\clinic-management-api\config\config.js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'clinic2',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123456789',
    database: process.env.DB_NAME || 'clinic2',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'postgres'
  }
};