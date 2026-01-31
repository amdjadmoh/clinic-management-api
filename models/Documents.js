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
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    phone1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone2: {
        type: DataTypes.STRING,
        allowNull: true,
    }
},{
    timestamps:true,
    hooks :{
        beforeValidate: async (consent_certificate) => {
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
    },
    phone1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone2: {
        type: DataTypes.STRING,
        allowNull: true,
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

const BirthCertificate = db.define('birth_certificate', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    referenceDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    doctorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    motherFullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    motherBirthDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    motherPlaceOfBirth: {
        type: DataTypes.STRING,
        allowNull: false
    },
    residence: {
        type: DataTypes.STRING,
        allowNull: true
    },
    spouseFirstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    spouseLastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    spouseBirthDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    spousePlaceOfBirth: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deliveryDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    deliveryTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    babyGender: {
        type: DataTypes.ENUM('ذكر', 'انثى'),
        allowNull: false
    },
    babyWeight: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Weight in grams'
    },
    babyName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    latinLastName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'nom'
    },
    latinFirstName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'prenoms'
    }
}, {
    tableName: 'birth_certificates',
    timestamps: true,
    hooks: {
        beforeValidate: async (birthCertificate) => {
            const currentYear = new Date().getFullYear();
            const lastId = await BirthCertificate.findOne({
                where: {
                    id: {
                        [Op.like]: `${currentYear}%`
                    }
                },
                order: [['createdAt', 'DESC']]
            });
            let newId;
            if (lastId) {
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                newId = `${currentYear}/${newIdNumber}`;
            } else {
                newId = `${currentYear}/1`;
            }
            birthCertificate.id = newId;
        }
    }
});

const DeathDeclaration = db.define('death_declaration', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'الاسم و اللقب'
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'العنوان'
    },
    year: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'سنة'
    },
    month: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'شهر'
    },
    day: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'في'
    },
    sectorManager: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'مدير القطاع الصحي'
    },
    daira: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'لدائرة'
    },
    civilStatusOfficer: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ضابط الحالة المدنية للبلدية'
    },
    deceasedName: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'المسمى(ة)'
    },
    ageAtDeath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'العمر'
    },
    placeOfBirth: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'المولود(ة) في'
    },
    dateOfBirth: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'تاريخ الميلاد'
    },  
    stateOfBirth: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ولاية'
    },
    sonOf:{
        type: DataTypes.STRING,
        allowNull:true
    },
    entryDate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'دخل (ت) القطاع الصحي في'
    },
    dateOfDeath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'تاريخ الوفاة'
    },
    hourOfDeath: {
        type:DataTypes.STRING,
        allowNull: true,
        comment: 'توفي (ت) في'
    },
    causeOfDeath: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'على اثر'
    }
}, {
    timestamps: true,
    tableName: 'death_declarations',
    hooks: {
        beforeValidate: async (deathDeclaration) => {
            const currentYear = new Date().getFullYear();
            const lastId = await DeathDeclaration.findOne({
                where: {
                    id: {
                        [Op.like]: `${currentYear}%`
                    }
                },
                order: [['createdAt', 'DESC']]
            });
            let newId;
            if (lastId) {
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                newId = `${currentYear}/${newIdNumber}`;
            } else {
                newId = `${currentYear}/1`;
            }
            deathDeclaration.id = newId;
        }
    }
});

const HospitalStayBulletin = db.define('hospital_stay_bulletin', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    patientName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'اسم المريض'
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'العنوان'
    },
    age: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'العمر'
    },
    profession: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'المهنة'
    },
    hospitalizationStartDate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'تاريخ بداية الإقامة'
    },
    hospitalizationEndDate: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'تاريخ نهاية الإقامة'
    },
    operatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'الطبيب المعالج'
    },
    date: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'تاريخ إصدار الوثيقة'
    }
}, {
    timestamps: true,
    tableName: 'hospital_stay_bulletins',
    hooks: {
        beforeValidate: async (bulletin) => {
            const currentYear = new Date().getFullYear();
            const lastId = await HospitalStayBulletin.findOne({
                where: {
                    id: {
                        [Op.like]: `${currentYear}%`
                    }
                },
                order: [['createdAt', 'DESC']]
            });
            let newId;
            if (lastId) {
                const lastIdNumber = parseInt(lastId.id.split('/')[1]);
                const newIdNumber = lastIdNumber + 1;
                newId = `${currentYear}/${newIdNumber}`;
            } else {
                newId = `${currentYear}/1`;
            }
            bulletin.id = newId;
        }
    }
});

module.exports = {
    Consent_certificate,
    Birth_notice,
    BirthDeclaration,
    OperationCostDeclaration,
    BirthCertificate,
    DeathDeclaration,
    HospitalStayBulletin
};
   





 