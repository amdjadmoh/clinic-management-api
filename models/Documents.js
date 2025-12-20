const db = require('../config/database');
const sequelize = require('sequelize');
const { DataTypes } = sequelize;
const { Op } = sequelize;


const Consent_certificate = db.define('consent_certificate', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    NIN : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    idReleaseDate : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    idReleasedFrom : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date :{
        type : DataTypes.STRING
,
        allowNull : false,
    },
    relationToPatient : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientName : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientNIN : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientIdReleasedFrom : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientIdReleaseDate : {
        type: DataTypes.STRING,
        allowNull: false,
    },
},{
    timestamps:true,
    hooks :{
        beforeValidate: async (consent_certificate) => {
            console.log("Here");
            const currentYear = new Date().getFullYear() ;
            const lastId = await Consent_certificate.findOne({
                where : {
                    id : {
                        [Op.like] : `${currentYear}%`,
                    },
                },
                order : [['createdAt','DESC']],
            });
            let newId;
            if (lastId){
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                newId = `${currentYear}/${newIdNumber}`;
            }else{
                newId = `${currentYear}/1`;
            }
            consent_certificate.id = newId;
        },
    }
});

const Birth_notice = db.define('birth_notice', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    DirectorfullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mairieName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mairieEtatCivil : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date :{
        type : DataTypes.STRING,
        allowNull : false,
   },
   hour : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    sex : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    childName : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fatherName : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fatherJob : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fatherDateOfBirth : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fatherPlaceOfBirth : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MotherName : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MotherJob : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MotherDateOfBirth : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    MotherPlaceOfBirth : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dateOfMarriage : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    StateInLaw : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    firstMarriage : {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    childrenNumber : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    nameInLatin : {
        type: DataTypes.STRING,
        allowNull: false,
    },

    childNIN : {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
    timestamps:true,
    hooks :{
        beforeValidate: async (birth_notice) => {
            const currentYear = new Date().getFullYear() ;
            const lastId = await Birth_notice.findOne({
                where : {
                    id : {
                        [Op.like] : `${currentYear}%`,
                    },
                },
  order : [['createdAt','DESC']],            });
            let newId;
            if (lastId){
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                 newId = `${currentYear}/${newIdNumber}`;
            }else{
                 newId = `${currentYear}/1`;
            }
            birth_notice.id = newId;
        },
    }
});

const BirthDeclaration = db.define('BirthDeclaration', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
        primaryKey: true,
    },
    declarantName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    motherName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    motherDateOfBirth : {
      type: DataTypes.STRING,
      allowNull: true,
    },
    motherPlaceOfBirth : {
        type: DataTypes.STRING,
        allowNull: true,
        },
    fatherFirstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fatherLastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fatherPlaceOfBirth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fatherDateOfBirth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        },
    childBrithDate: {
        type: DataTypes.STRING,
        allowNull: true,
        },
    childBrithHour: {
        type: DataTypes.STRING,
        allowNull: true,
        },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weightKg: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    arabicName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name given to the baby',
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name in Latin (NOM PRENOMS)',
    },
    prenoms: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Name in Latin (NOM PRENOMS)',
    }
  }, {
    timestamps: true,
    hooks :{
        beforeValidate: async (instance) => {
            const currentYear = new Date().getFullYear() ;
            const lastId = await BirthDeclaration.findOne({
                where : {
                    id : {
                        [Op.like] : `${currentYear}%`,
                    },
                },
  order : [['createdAt','DESC']],            });
            let newId;
            if (lastId){
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                 newId = `${currentYear}/${newIdNumber}`;
            }else{
                 newId = `${currentYear}/1`; 
            }
            instance.id = newId;
        },
    }
});
   

  const OperationCostDeclaration = db.define('OperationCostDeclaration', {
    id : {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    patientName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientNIN : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientIdReleaseDate : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    patientIdReleasedFrom : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date :{
        type : DataTypes.STRING,
        allowNull : false,
    },
    delcaration:{
        type: DataTypes.TEXT,
        allowNull: false,
    }
  }, {
    timestamps: true,
    hooks :{
        beforeValidate: async (operationCostDeclaration) => {
            const currentYear = new Date().getFullYear() ;
            const lastId = await OperationCostDeclaration.findOne({
                where : {
                    id : {
                        [Op.like] : `${currentYear}%`,
                    },
                },
  order : [['createdAt','DESC']],            });
            let newId;
            if (lastId){
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                 newId = `${currentYear}/${newIdNumber}`;
            }else{
                 newId = `${currentYear}/1`;
            }
            operationCostDeclaration.id = newId;
        },
    }
});

module.exports = {
    Consent_certificate,
    Birth_notice,
    BirthDeclaration,
    OperationCostDeclaration
};


   
   





 