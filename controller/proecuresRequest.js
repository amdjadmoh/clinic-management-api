const { ProceduresRequest, ProceduresRequestItems } = require('../models/proceduresRequests');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Patient = require('../models/Patient');      
    const Invoice = require('../models/Invoice').Invoice;


// Get all procedures requests
exports.getAllProceduresRequests = catchAsync(async (req, res, next) => {
    const proceduresRequests = await ProceduresRequest.findAll({
        include: [
            {
                model: ProceduresRequestItems,
                include: [{ model: require('../models/PreDefinedProcedure') }]
            }
        ]
    });
    res.status(200).json({
        status: 'success',
        data: {
            proceduresRequests,
        },
    });
});

// Get a single procedures request by ID
exports.getProceduresRequest = catchAsync(async (req, res, next) => {
    const proceduresRequest = await ProceduresRequest.findByPk(req.params.id, {
        include: [
            {
                model: ProceduresRequestItems,
                include: [{ model: require('../models/PreDefinedProcedure') }]
            }
        ]
    });
    if (!proceduresRequest) {
        return next(new AppError('Procedures request not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            proceduresRequest,
        },
    });
});

// Create a new procedures request
exports.createProceduresRequest = catchAsync(async (req, res, next) => {
    if (req.body.PatientID) {
        const patient = await Patient.findByPk(req.body.PatientID);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }
        req.body.PatientName = patient.name;
        req.body.gender = patient.gender;
        req.body.birthdate = patient.birthdate;
    } else{
        if (!req.body.birthdate){
            req.body.birthdate="0001-01-01";
        }
        if (!req.body.gender || req.body.patientName ){
            return next(new AppError('PatientName and gender are required for new patients', 400));
        }
    }

    const proceduresRequest = await ProceduresRequest.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            proceduresRequest,
        },
    });
});

// Update a procedures request by ID
exports.updateProceduresRequest = catchAsync(async (req, res, next) => {
    const proceduresRequest = await ProceduresRequest.findByPk(req.params.id);
    if (!proceduresRequest) {
        return next(new AppError('Procedures request not found', 404));
    }
    await proceduresRequest.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            proceduresRequest,
        },
    });
});

// Delete a procedures request by ID
exports.deleteProceduresRequest = catchAsync(async (req, res, next) => {
    const proceduresRequest = await ProceduresRequest.findByPk(req.params.id);
    if (!proceduresRequest) {
        return next(new AppError('Procedures request not found', 404));
    }
    // Delete associated items first
    const associatedItems = await ProceduresRequestItems.findAll({
        where: { proceduresRequestID: proceduresRequest.id },
    });
    for (const item of associatedItems) {
        await item.destroy();
    }
    await proceduresRequest.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

// Get procedures requests by patient ID
exports.getProceduresRequestsByPatient = catchAsync(async (req, res, next) => {
    const proceduresRequests = await ProceduresRequest.findAll({
        where: { PatientID: req.params.patientID },
        include: [
            {
                model: ProceduresRequestItems,
                include: [{ model: require('../models/PreDefinedProcedure') }]
            }
        ]
    });
    res.status(200).json({
        status: 'success',
        data: {
            proceduresRequests,
        },
    });
});


// Create a new procedures request item
exports.createProceduresRequestItem = catchAsync(async (req, res, next) => {
    const proceduresRequestItem = await ProceduresRequestItems.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            proceduresRequestItem,
        },
    });
});




// Delete a procedures request item by ID
exports.deleteProceduresRequestItem = catchAsync(async (req, res, next) => {
    const proceduresRequestItem = await ProceduresRequestItems.findByPk(req.params.id);
    if (!proceduresRequestItem) {
        return next(new AppError('Procedures request item not found', 404));
    }
    await proceduresRequestItem.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.confirmProceduresRequest = catchAsync(async (req, res, next) => {
    const proceduresRequest = await ProceduresRequest.findByPk(req.params.id);
    if (!proceduresRequest) {
        return next(new AppError('Procedures request not found', 404));
    }
    proceduresRequest.status = 'Completed';
    await proceduresRequest.save();
    // create an invoice
        let newInvoice;
    if (!proceduresRequest.PatientID) {
        // create a new patient
        const newPatient = await Patient.create({ name: proceduresRequest.PatientName ,gender:proceduresRequest.gender,birthdate:proceduresRequest.birthdate});
        proceduresRequest.PatientID = newPatient.id;
        await proceduresRequest.save();
         newInvoice= await Invoice.create({
            patientID: newPatient.id
        });
        } else {
        const newPatient = await Patient.findByPk(proceduresRequest.PatientID);
            // check if patient already has an open invoice
            const openInvoice = await Invoice.findOne({ where: { patientID: newPatient.id, invoiceStatus: 'unpaid' } });
            if (openInvoice) {
                 newInvoice = openInvoice;
            } else {
                 newInvoice = await Invoice.create({
                    patientID: newPatient.id
                });
            }
    }

    // create invoice items
    const items = await ProceduresRequestItems.findAll({ where: { proceduresRequestID: proceduresRequest.id } });
    for (const item of items) {
        const procedure = await require('../models/PreDefinedProcedure').findByPk(item.preDefinedProcedureID);
        await require('../models/Invoice').InvoiceProcedure.create({
            invoiceID: newInvoice.invoiceId,
            procedureID: procedure.id,
            procedureName: procedure.procedureName,
            cost: procedure.cost,
            quantity: 1,
        });
    }
    const updatedInvoice = await Invoice.findByPk(newInvoice.invoiceId, {
        include: [{ model: require('../models/Invoice').InvoiceProcedure }]
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoice: updatedInvoice
        },
    });
});

exports.getPendingProceduresRequests = catchAsync(async (req, res, next) => {
    const proceduresRequests = await ProceduresRequest.findAll({
        where: { status: 'Pending' },
        include: [
            {
                model: ProceduresRequestItems,
                include: [{ model: require('../models/PreDefinedProcedure') }]
            }
        ]
    });
    res.status(200).json({
        status: 'success',
        data: {
            proceduresRequests,
        },

    });
});
