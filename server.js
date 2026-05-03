require('dotenv').config();
const express = require('express');
const db = require('./config/database');
const app = require('./app');

const args = process.argv.slice(2);

if (args.includes('init-db')) {
    // Run the database initialization script
    const sync = require('./sync');
} else {
    db.authenticate()
        .then(() => {
            console.log('Connection has been established successfully.');
            const port = process.env.PORT || 8080;
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
            });
        })
        .catch(error => {
            console.error('Unable to connect to the database:', error);
        });
}
