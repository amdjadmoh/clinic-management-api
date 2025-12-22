const db= require('../config/database');
const sequelize = require('sequelize');
const {Doctors} = require('./Doctors');7

const PrescriptionDetails = db.define('prescriptionDetails',{
    prescriptionID:{
        type:sequelize.INTEGER,
        allowNull:false,
        references:{
            model:'prescriptions',
            key:'id',
        }
    },
    medicineName:{
        type:sequelize.STRING,
        allowNull:false,
    },
    dosage:{
        type:sequelize.STRING,
        allowNull:true,
    },
    quantity:{
        type:sequelize.INTEGER,
        allowNull:true,
    },
    quantityType:{
        type:sequelize.STRING,
        allowNull:true,
    },
    note:{
        type:sequelize.STRING,
        allowNull:true,
    },
    note2:{
        type:sequelize.STRING,
        allowNull:true,
    },
    note3:{
        type:sequelize.STRING,
        allowNull:true,
    },
},{
    tableName:'prescriptionDetails',
    timestamps:true,
});

const PrescriptionTemplate = db.define('prescriptionTemplate',{
    templateName:{
        type:sequelize.STRING,
        allowNull:false,
    },
    doctorID:{
        type:sequelize.INTEGER,
        allowNull:false,
        references:{
            model:'doctors',
            key:'id',
        }
    }
},{
    tableName:'prescriptionTemplates',
    timestamps:false
});
const PrescriptionTemplateDetails = db.define('prescriptionTemplateDetails',{
    templateID:{
        type:sequelize.INTEGER,
        allowNull:false,
        references:{
            model:'prescriptionTemplates',
            key:'id',
        }
    },
     medicineName:{
        type:sequelize.STRING,
        allowNull:false,
    },
    dosage:{
        type:sequelize.STRING,
        allowNull:true,
    },
    quantity:{
        type:sequelize.INTEGER,
        allowNull:true,
    },
    quantityType:{
        type:sequelize.STRING,
        allowNull:true,
    },
    note:{
        type:sequelize.STRING,
        allowNull:true,
    },
    note2:{
        type:sequelize.STRING,
        allowNull:true,
    },
    note3:{
        type:sequelize.STRING,
        allowNull:true,
    }
},{
    tableName:'prescriptionTemplateDetails',
    timestamps:false,
});

PrescriptionTemplate.hasMany(PrescriptionTemplateDetails,{foreignKey:'templateID'});
PrescriptionTemplateDetails.belongsTo(PrescriptionTemplate,{foreignKey:'templateID'});

Doctors.hasMany(PrescriptionTemplate, {foreignKey: 'doctorID'});
PrescriptionTemplate.belongsTo(Doctors, {foreignKey: 'doctorID'});


module.exports = {PrescriptionDetails,PrescriptionTemplate,PrescriptionTemplateDetails};
