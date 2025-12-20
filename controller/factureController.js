const { Facture, FactureProcedure } = require("../models/Facture");
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Patient = require('../models/Patient');
const Enterprise = require('../models/Enterprise');
const Procedures = require('../models/PreDefinedProcedure');
const { config } = require("dotenv");

exports.getAllFactures = catchAsync(async (req, res, next) => {
    const factures = await Facture.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            factures
        }
    });
}
);

exports.getFacture = catchAsync(async (req, res, next) => {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return next(new appError('No facture found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: {
            facture
        }
    });
}
);

exports.createFacture = catchAsync(async (req, res, next) => {
    const  enterprise= await Enterprise.findByPk(req.body.enterpriseID);
    if (!enterprise) return next(new appError('No enterprise found with that ID', 404));
    const patient = await Patient.findByPk(req.body.patientID);
    if (!patient) return next(new appError('No patient found with that ID', 404));
    req.body.PatientName = patient.name;
    req.body.birthdate = patient.birthdate;
    req.body.patientAddress = patient.address;
    req.body.patientPhone = patient.phone1;
    req.body.address = enterprise.address;
    req.body.name = enterprise.name;
    req.body.phone = enterprise.phone;
    req.body.email = enterprise.email;
    req.body.website = enterprise.website;
    req.body.NIS = enterprise.NIS;
    req.body.NIF = enterprise.NIF;
    req.body.RC = enterprise.RC;
    req.body.IBAN = enterprise.IBAN;
    req.body.totalHT = 0;
    req.body.totalTVA = 0;
    req.body.totalTTC = 0;
    const facture = await Facture.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            facture
        }
    });
}
);

exports.addProcedureToFacture = catchAsync(async (req, res, next) => {
    const facture = await Facture.findByPk(req.params.factureID);
    if (!facture) return next(new appError('No facture found with that ID', 404));
    if (!req.body.procedureName | !req.body.cost || !req.body.quantity || !req.body.tva) {
        return next(new appError('Please provide procedureName, cost, quantity and tva', 400));
    }
    req.body.factureID = facture.id;
    req.body.montantHT = req.body.cost * req.body.quantity;
    req.body.montantTVA = req.body.montantHT * req.body.tva/ 100;
    const procedure= await FactureProcedure.create(req.body);
    facture.totalHT += req.body.montantHT;
    facture.totalTVA += req.body.montantTVA;
    facture.totalTTC = facture.totalHT + facture.totalTVA;
    if (req.body.coverageAmount) {
        facture.coverageAmount += req.body.coverageAmount;
    }
    await facture.save();

    res.status(201).json({
        status: 'success',
        data: {
            procedure
        }
    });
}
);

exports.deleteProcedureFromFacture = catchAsync(async (req, res, next) => {
    const factureProcedure = await FactureProcedure.findByPk(req.params.id);
    if (!factureProcedure) return next(new appError('No procedure found with that ID', 404));
    const facture = await Facture.findByPk(factureProcedure.factureID);
    facture.totalHT -= factureProcedure.montantHT;
    facture.totalTVA -= factureProcedure.montantTVA;
    facture.totalTTC = facture.totalHT + facture.totalTVA;
    if (factureProcedure.coverageAmount) {
        facture.coverageAmount -= factureProcedure.coverageAmount;
    }
    await facture.save();
    await factureProcedure.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);

exports.updateProcedureFromFacture = catchAsync(async (req, res, next) => {
    const factureProcedure = await FactureProcedure.findByPk(req.params.id);
    if (!factureProcedure) return next(new appError('No procedure found with that ID', 404));
    const facture = await Facture.findByPk(factureProcedure.factureID);
    if (req.body.quantity !=null) {
        facture.totalHT -= factureProcedure.montantHT;
        facture.totalTVA -= factureProcedure.montantTVA;
        facture.coverageAmount -= factureProcedure.coverageAmount || 0;
        facture.coverageAmount += req.body.coverageAmount || 0;
        if (req.body.tva !=null) {
            factureProcedure.montantTVA = factureProcedure.montantHT * req.body.tva/ 100;
        } else {
            factureProcedure.montantTVA = factureProcedure.montantHT * factureProcedure.tva/ 100;
        }
        facture.totalHT += factureProcedure.montantHT;
        facture.totalTVA += factureProcedure.montantTVA;
        facture.totalTTC = facture.totalHT + facture.totalTVA;
    } else if (req.body.tva !=null) {
        facture.totalTVA -= factureProcedure.montantTVA;
        factureProcedure.montantTVA = factureProcedure.montantHT * req.body.tva/ 100;
        facture.totalTVA += factureProcedure.montantTVA;
        facture.totalTTC = facture.totalHT + facture.totalTVA;
    }
    await facture.save();
    await factureProcedure.set(req.body);
    await factureProcedure.save();
    res.status(200).json({
        status: 'success',
        data: {
            factureProcedure
        }
    });
}
);

exports.updateFacture = catchAsync(async (req, res, next) => {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return next(new appError('No facture found with that ID', 404));
    await facture.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            facture
        }
    });
}
);


exports.deleteFacture = catchAsync(async (req, res, next) => {
    const facture = await Facture.findByPk(req.params.id);
    if (!facture) return next(new appError('No facture found with that ID', 404));
    await facture.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);


exports.getPatientFactures = catchAsync(async (req, res, next) => {
    const factures = await Facture.findAll({
        where: {
            patientID: req.params.patientID
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            factures
        }
    });
}
);

exports.getFactureBycoverageType = catchAsync(async (req, res, next) => {
    const factures = await Facture.findAll({
        where: {
            coverageType: req.params.coverageType
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            factures
        }
    });
}
);
