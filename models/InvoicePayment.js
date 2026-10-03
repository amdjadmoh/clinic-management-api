const db = require('../config/database');
const sequelize = require('sequelize');

const InvoicePayment = db.define('InvoicePayment', {
    id: {
        type: sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    invoiceID: {
        type: sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'invoices',
            key: 'invoiceId',
        }
    },
    amount: {
        type: sequelize.FLOAT,
        allowNull: false,
    },
    date: {
        type: sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.NOW,
    },
    note: {
        type: sequelize.STRING,
        allowNull: true,
    },
    receivedBy: {
        type: sequelize.STRING,
        allowNull: true,
    }
}, {
    tableName: 'InvoicePayments',
    timestamps: true,
});

module.exports = InvoicePayment;