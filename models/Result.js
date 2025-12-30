const db = require ('../config/database');
const Sequelize = require('sequelize');
const {ResultLineUrine,ResultLine,ResultLineSubAnalyses} = require('./resultLine');
const Patient = require('./Patient');
const {Doctors} = require('./Doctors');
const Result = db.define('Result', {
    patientID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id',
        }
    },
    submitDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    totalPrice:{
        type: Sequelize.FLOAT,
        allowNull: true,
    },
    paidPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    status:{
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate:{
            isIn: [['notConfirmed','pending','completed']]
        }
    },
    doctorID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'doctors',
            key: 'id',
        }   
    },
    accessToken: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique: true,
        allowNull: false
    },
    tokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Token expiration date. Null means never expires'
    },
}
,
{
    tableName:'results',
    timestamps:true,
    hooks: {
        beforeCreate: (result) => {
            if (!result.tokenExpiresAt) {
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);
                result.tokenExpiresAt = expiryDate;
            }
        }
    }
});
Result.belongsTo(Patient, { foreignKey: 'patientID' });
Patient.hasMany(Result, { foreignKey: 'patientID' });
Result.hasMany(ResultLine, { foreignKey: 'resultID' });
ResultLine.belongsTo(Result, { foreignKey: 'resultID' });
Result.hasMany(ResultLineUrine, { foreignKey: 'resultID' });
ResultLineUrine.belongsTo(Result, { foreignKey: 'resultID' });
Result.belongsTo(Doctors, { foreignKey: 'doctorID' });
Doctors.hasMany(Result, { foreignKey: 'doctorID' });

Result.addScope('defaultScope', {
    include : [{
        model:Patient,
        attributes:['name','birthdate','phone1']
    },
    {
        model:ResultLine,
        attributes:['id','resultTypeID','resultName','resultPrice','type','min','max','unit','resultValue','technology','periority']
    },
    {
        model:ResultLineUrine,
        attributes:['id','resultTypeID','resultName','optionName']
    },
    {
        model:Doctors,
        attributes:['name']
    }],
});

ResultLine.hasMany(ResultLineSubAnalyses, { foreignKey: 'resultLineID' });
ResultLineSubAnalyses.belongsTo(ResultLine, { foreignKey: 'resultLineID' });

ResultLine.addScope('defaultScope', {
    include: [{
        model: ResultLineSubAnalyses,
        as: 'ResultLineSubAnalyses'
    }]
});

module.exports = {Result,ResultLine,ResultLineUrine};