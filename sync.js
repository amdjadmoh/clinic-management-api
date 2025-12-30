const db = require('./config/database');
const Queue = require('./models/Queue');
const Doctor = require('./models/Doctors');
const Dep = require('./models/Dep');
const {Drug,DrugModifaction} = require('./models/Drug');
const DrugType = require('./models/DrugType');
const Users= require('./models/Users');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');
const Prescription = require('./models/Prescription');
const {PrescriptionDetails,PrescriptionTemplate,PrescriptionTemplateDetails} = require('./models/PrescriptionDetails');
const Medicine = require('./models/Medicine');
const PreDefinedProcedure = require('./models/PreDefinedProcedure');
const ChronicDisease = require('./models/ChronicDisease');
const Patient = require('./models/Patient');
require('./models/PatientChronicDiseases');
require('./models/DrugHistoryDetails');
const  {  InvoiceProcedure , InvoiceResult,Invoice} = require('./models/Invoice');
const DoctorLog = require('./models/DoctorLog');
const Record = require('./models/Record');
const {ResultTypeUrine,ResultTypeUrineOptions} =require('./models/ResultTypeUrine');


const ResultType = require('./models/ResultType');
const {Result,ResultLine} = require('./models/Result');

const Enterprise = require('./models/Enterprise');

const {Facture,FactureProcedure} = require('./models/Facture');
const DrugHistory = require('./models/DrugHistory');
const {  Consent_certificate,
  Birth_notice,
  BirthDeclaration,
  OperationCostDeclaration} = require('./models/Documents');
const File = require('./models/Files');
const Notification = require('./models/Notification');
const BloodTest = require('./models/BloodTest');
const LaboPrices = require('./models/LaboPrices');
const {ProceduresRequest, ProceduresRequestItems} = require('./models/proceduresRequests');



// Modify your sync code
(async () => {
    try {
     
        
        // Then sync models
        await db.sync({ 
            alter: true
        });
        
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing models:', error);
        process.exit(1);
    }
})();