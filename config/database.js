const { Sequelize } = require('sequelize');
require('dotenv').config();

const db = new Sequelize(process.env.DB_CONNECTION_STRING, {
  timezone: process.env.DB_TIMEZONE || '+01:00',  // Set the timezone from environment variable or default to UTC
});

module.exports = db;

// // Example connection string with SQL authentication
// const sequelize = new Sequelize('mssql://clinic:amgedamged2004@@clinicapi.database.windows.net:1433/clinic?encrypt=true&trustServerCertificate=false&hostNameInCertificate=*.database.windows.net&loginTimeout=30');

// module.exports = sequelize;


// const { Sequelize } = require('sequelize');
// const moment = require('moment-timezone');

// const db = new Sequelize('clinicoum', 'clinic', 'amgedamged2004@', {
//     host: 'clinicoum.database.windows.net',
//     dialect: 'mssql',
//     dialectOptions: {
//         options: {
//             encrypt: true, // Use this if you're on Windows Azure
//             requestTimeout: 30000, // Increase timeout to 30 seconds
//         },
//         useUTC: false,
//         typeCast: function (field, next) { // for reading from database
//             if (field.type === 'DATETIME') {
//                 return moment.tz(field.string(), 'Europe/Berlin').format(); // Convert to GMT+1
//             }
//             return next();
//         },
//     },
//     timezone: '+01:00', // Set the timezone to GMT+1
//     pool: {
//         max: 5,
//         min: 0,
//         idle: 10000,
//     },
// });

// module.exports = db;