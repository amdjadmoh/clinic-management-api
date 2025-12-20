const db= require('../config/database');
const { Sequelize } = require('sequelize');
const Queue = require('./Queue');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const {Doctors} = require('./Doctors');
const Prescription = require('./Prescription');
const Dep = require('./Dep');



const Patient = db.define('patient',{
    NIN:{
        type:Sequelize.STRING,
        allowNull:true
        },
    name:{
        type:Sequelize.STRING,
        allowNull:false,
    },
    gender :{ 
        type:Sequelize.STRING,
        allowNull:false,
    },
    birthdate:{
        type:Sequelize.DATE,
        allowNull:false,
    },
    phone1:{
        type:Sequelize.STRING,
        },
    phone2:{
        type:Sequelize.STRING,
    },    
    email:{
        type:Sequelize.STRING,
    },
    address:{
        type:Sequelize.STRING,
    },
    registerdBy:{
        type:Sequelize.STRING,
        allowNull:true,
    },
    SocialNumber:{
        type:Sequelize.STRING,
        allowNull:true,
    },
},{ 
    tableName:'patients',
    timestamps:false,
});

Patient.hasMany(Queue, {foreignKey: 'patientID', onDelete: 'CASCADE'});
Queue.belongsTo(Patient, {foreignKey: 'patientID'});
Queue.belongsTo(Dep, {foreignKey: 'depID'});


Queue.addScope('defaultScope', {
    include:[ {
        model: Patient,
        attributes: ['name']
    }, {
        model: Dep,
        attributes: ['depName']
    }]
});
Patient.hasMany(Appointment, {foreignKey: 'patientID', onDelete: 'CASCADE'});
Appointment.belongsTo(Patient, {foreignKey: 'patientID'});
Appointment.belongsTo(Doctors, { foreignKey: 'doctorID' });
Appointment.belongsTo(Dep, { foreignKey: 'depID' });

Appointment.addScope('defaultScope', {
    include: [
        {
            model: Doctors,
            attributes: ['name','NIN'],
        },
        {
            model: Dep,
            attributes: ['depName'],
        },
        {
            model: Patient,
            attributes: ['name']
        }
    ],
});



Patient.hasMany(MedicalRecord, {foreignKey: 'patientID', onDelete: 'CASCADE'});
MedicalRecord.belongsTo(Patient, {foreignKey: 'patientID'});
MedicalRecord.addScope('defaultScope', {
    include: [
        {
            model: Patient,
            attributes: ['name', 'NIN', 'birthdate']
        },
    ]
});
const {PrescriptionDetails} = require('./PrescriptionDetails');

Patient.hasMany(Prescription, {foreignKey: 'patientID', onDelete: 'CASCADE'});
Prescription.belongsTo(Patient, {foreignKey: 'patientID'});
Prescription.belongsTo(Doctors, { foreignKey: 'doctorID' });
Prescription.hasMany(PrescriptionDetails, { foreignKey: 'prescriptionID', onDelete: 'CASCADE' });
PrescriptionDetails.belongsTo(Prescription, { foreignKey: 'prescriptionID' });

Prescription.addScope('defaultScope', {
    include: [
        {
            model: Patient,
            attributes: ['name','birthdate']
        }
    ]
});
const {Invoice} = require('./Invoice');

Patient.hasMany(Invoice, { foreignKey: 'patientID', onDelete: 'CASCADE' });
Invoice.belongsTo(Patient, { foreignKey: 'patientID', onDelete: 'CASCADE' });

Invoice.addScope('defaultScope',{
    include:[{
        model:Patient,
        attributes:['name','email','phone1','address','birthdate','NIN']}]
    }
);

module.exports= Patient;