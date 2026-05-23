const db = require('../config/database');
const { Sequelize } = require('sequelize');
const { Doctors } = require('./Doctors');

const CertificateTemplate = db.define('certificateTemplate', {
    doctorID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'id'
        }
    },
    certificateType: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: {
                args: [['maladie', 'aptitude', 'presence', 'general']],
                msg: "certificateType must be one of 'maladie', 'aptitude', 'presence', 'general'"
            }
        }
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    templateText: {
        type: Sequelize.TEXT,
        allowNull: false,
    }
}, {
    tableName: 'certificate_templates',
    timestamps: true
});

CertificateTemplate.belongsTo(Doctors, { foreignKey: 'doctorID', onDelete: 'CASCADE' });
Doctors.hasMany(CertificateTemplate, { foreignKey: 'doctorID', onDelete: 'CASCADE' });

module.exports = CertificateTemplate;
