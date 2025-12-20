const db = require('../config/database');
const { Sequelize } = require('sequelize');

const Queue = db.define('queue', {
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: {
                args: [['pending', 'completed', 'in-progress']],
                msg: "Status must be one of 'pending', 'completed', or 'in-progress'"
            }
        }
    },
    patientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        }

    },
    depID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id',
        }
    },
    queueNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        validate: {
            isDate: true,
        }
    },
    priority :{
        type: Sequelize.STRING,
        allowNull: true
    },
    paid:{
        type:Sequelize.BOOLEAN,
        allowNull:true,
    },
    totalPrice:{
        type:Sequelize.FLOAT,
        allowNull:true,
    }
}, {
    tableName: 'queues',
    timestamps: true,
});

module.exports = Queue;