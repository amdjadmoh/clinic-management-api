const { ProceduresRequest, ProceduresRequestItems } = require('../models/proceduresRequests');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Patient = require('../models/Patient');       

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
    res.status(200).json({
        status: 'success',
        data: {
            proceduresRequest,
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
