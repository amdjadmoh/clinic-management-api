const Prescription = require('../models/Prescription');
const {PrescriptionDetails,PrescriptionTemplate,PrescriptionTemplateDetails} = require('../models/PrescriptionDetails');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {Doctors} = require('../models/Doctors');
const Patients = require('../models/Patient');

// Get all prescriptions
exports.getAllPrescriptions = catchAsync(async (req, res, next) => {
    const prescriptions = await Prescription.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            prescriptions,
        },
    });
});

// Get a single prescription by ID
exports.getPrescription = catchAsync(async (req, res, next) => {
    prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) {
        return next(new AppError('Prescription not found', 404));
    }
    const prescriptionDetails = await PrescriptionDetails.findAll({
        where:{prescriptionID:prescription.id}
    })
    prescription=prescription.get({plain:true});
    prescription.prescriptionDetails = prescriptionDetails;
        res.status(200).json({
        status: 'success',
        data: {
            prescription
        },
    });
});

// Create a new prescription
exports.createPrescription = catchAsync(async (req, res, next) => {
    const doctor = await Doctors.findByPk(req.body.doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    req.body = { ...req.body, doctorID: doctor.id, name: doctor.name, speciality: doctor.speciality };
    const prescription = await Prescription.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            prescription,
        },
    });
});

// Update a prescription by ID
exports.updatePrescription = catchAsync(async (req, res, next) => {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) {
        return next(new AppError('Prescription not found', 404));
    }
    await prescription.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            prescription,
        },
    });
});

// Delete a prescription by ID
exports.deletePrescription = catchAsync(async (req, res, next) => {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) {
        return next(new AppError('Prescription not found', 404));
    }
    await prescription.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.getPrescriptionsByPatient = catchAsync(async (req, res, next) => {
    const prescriptions = await Prescription.findAll({
        where: {
            patientID: req.params.patientID,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
            prescriptions,
        },
    });
});

exports.getPrescriptionsByDoctor = catchAsync(async (req, res, next) => {
    const prescriptions = await Prescription.findAll({
        where: {
            doctorID: req.params.doctorID,
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
            prescriptions,
        },
    });
});

exports.getAllPrescriptionDetails = catchAsync(async (req, res, next) => {
    const prescriptionDetails = await PrescriptionDetails.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            prescriptionDetails,
        },
    });
});

exports.getPrescriptionDetail = catchAsync(async (req, res, next) => {
    const prescriptionDetail = await PrescriptionDetails.findByPk(req.params.id);
    if (!prescriptionDetail) {
        return next(new AppError('Prescription detail not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            prescriptionDetail,
        },
    });
});

// Create a new prescription detail
exports.createPrescriptionDetail = catchAsync(async (req, res, next) => {
    const prescriptionDetail = await PrescriptionDetails.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            prescriptionDetail,
        },
    });
});

// Update a prescription detail by ID
exports.updatePrescriptionDetail = catchAsync(async (req, res, next) => {
    const prescriptionDetail = await PrescriptionDetails.findByPk(req.params.id);
    if (!prescriptionDetail) {
        return next(new AppError('Prescription detail not found', 404));
    }
    await prescriptionDetail.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            prescriptionDetail,
        },
    });
});

// Delete a prescription detail by ID
exports.deletePrescriptionDetail = catchAsync(async (req, res, next) => {
    const prescriptionDetail = await PrescriptionDetails.findByPk(req.params.id);
    if (!prescriptionDetail) {
        return next(new AppError('Prescription detail not found', 404));
    }
    await prescriptionDetail.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.getPrescriptionDetailsByPrescription = catchAsync(async (req, res, next) => {
    const prescription = await Prescription.findByPk(req.params.prescriptionID);
    if (!prescription) {
        return next(new AppError('Prescription not found', 404));
    }
    const prescriptionDetails = await PrescriptionDetails.findAll({
        where: {
            prescriptionID: req.params.prescriptionID,
        },
    });
    const patient = await Patients.findByPk(prescription.patientID);
    prescriptionDetails.forEach((prescriptionDetail) => {
        prescriptionDetail.dataValues.patientName = patient.name;
    });

    res.status(200).json({
        status: 'success',
        data: {
            prescriptionDetails: prescriptionDetails,
        },
    });
});

exports.deletePrescriptionDetailsByPrescription = catchAsync(async (req, res, next) => {
    await PrescriptionDetails.destroy({
        where: {
            prescriptionID: req.params.prescriptionID,
        },
    });
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.getPrescriptionTemplatesByDoctor = catchAsync(async (req, res, next) => {
    const templates = await PrescriptionTemplate.findAll({
        where: { doctorID: req.params.doctorID }
    });
    res.status(200).json({
        status: 'success',
        data: {
            templates,
        },
    });
});

// Get a single prescription template by ID
exports.getPrescriptionTemplate = catchAsync(async (req, res, next) => {
    const template = await PrescriptionTemplate.findOne({
        where: { id: req.params.id, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Prescription template not found', 404));
    }
    const templateDetails = await PrescriptionTemplateDetails.findAll({
        where:{templateID:template.id}
    });
    prescriptionTemp={...template.get({plain:true}),templateDetails};
    res.status(200).json({
        status: 'success',
        data: {
            prescriptionTemp
        },
    });
});

exports.getPrescriptionTemplateDetails = catchAsync(async (req, res, next) => {
    // First check if template belongs to doctor
    const template = await PrescriptionTemplate.findOne({
        where: { id: req.params.templateID, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Template not found or does not belong to this doctor', 404));
    }
    const templateDetails = await PrescriptionTemplateDetails.findAll({
        where:{templateID:req.params.templateID}
    });
    res.status(200).json({
        status: 'success',
        data: {
            templateDetails,
        },
    });
});
exports.createPrescriptionTemplate = catchAsync(async (req, res, next) => {
    req.body.doctorID = req.params.doctorID;
    const template =  await PrescriptionTemplate.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            template,
        },
    });
});
exports.createPrescriptionTemplateDetails = catchAsync(async (req, res, next) => {
    // Verify all templateIDs belong to the doctor
    const templateIDs = [...new Set(req.body.map(detail => detail.templateID))];
    for (const templateID of templateIDs) {
        const template = await PrescriptionTemplate.findOne({
            where: { id: templateID, doctorID: req.params.doctorID }
        });
        if (!template) {
            return next(new AppError(`Template ${templateID} not found or does not belong to this doctor`, 404));
        }
    }
    const templateDetails =  await PrescriptionTemplateDetails.bulkCreate(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            templateDetails,
        },
    });
});

exports.deletePrescriptionTemplate = catchAsync(async (req, res, next) => {
    const template = await PrescriptionTemplate.findOne({
        where: { id: req.params.id, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Prescription template not found', 404));
    }
    const associatedDetails = await PrescriptionTemplateDetails.findAll({
        where: { templateID: template.id },
    });
    // Delete associated details first
    for (const detail of associatedDetails) {
        await detail.destroy();
    }
    await template.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});
exports.deletePrescriptionTemplateDetails = catchAsync(async (req, res, next) => {
    const templateDetail = await PrescriptionTemplateDetails.findByPk(req.params.detailID);
    if (!templateDetail) {
        return next(new AppError('Prescription template detail not found', 404));
    }
    // Check if the template belongs to the doctor
    const template = await PrescriptionTemplate.findOne({
        where: { id: templateDetail.templateID, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Template does not belong to this doctor', 403));
    }
    await templateDetail.destroy();
    res.status(200).json({
        status: 'success',
        data: null,
    });
});

exports.updateTemplatePrescriptionDetail = catchAsync(async (req, res, next) => {
    const templateDetail = await PrescriptionTemplateDetails.findByPk(req.params.detailID);
    if (!templateDetail) {
        return next(new AppError('Prescription template detail not found', 404));
    }
    // Check if the template belongs to the doctor
    const template = await PrescriptionTemplate.findOne({
        where: { id: templateDetail.templateID, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Template does not belong to this doctor', 403));
    }
    await templateDetail.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            templateDetail,
        },
    });
});

exports.updatePrescriptionTemplate = catchAsync(async (req, res, next) => {
    const template = await PrescriptionTemplate.findOne({
        where: { id: req.params.id, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Prescription template not found', 404));
    }
    await template.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            template,
        },
    });
});

exports.updatePrescriptionTemplateDetails = catchAsync(async (req, res, next) => {
    const templateDetail = await PrescriptionTemplateDetails.findByPk(req.params.id);
    if (!templateDetail) {
        return next(new AppError('Prescription template detail not found', 404));
    }
    await templateDetail.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            templateDetail,
        },
    });
});

exports.createPrescriptionFromTemplate = catchAsync(async (req, res, next) => {
    const doctor = await Doctors.findByPk(req.params.doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }
    const template = await PrescriptionTemplate.findOne({
        where: { id: req.params.templateID, doctorID: req.params.doctorID }
    });
    if (!template) {
        return next(new AppError('Template not found or does not belong to this doctor', 404));
    }
    const templateDetails = await PrescriptionTemplateDetails.findAll({
        where: { templateID: req.params.templateID },
    });
    req.body = { ...req.body, doctorID: doctor.id, name: doctor.name, speciality: doctor.speciality };
    const prescription = await Prescription.create(req.body);
    const prescriptionDetailsData = templateDetails.map(detail => ({
        prescriptionID: prescription.id,
        medicineName: detail.medicineName,
        dosage: detail.dosage,
        quantity: detail.quantity,
        quantityType: detail.quantityType,
        note: detail.note,
        note2: detail.note2,
        note3: detail.note3,
    }));
    await PrescriptionDetails.bulkCreate(prescriptionDetailsData);
    res.status(201).json({
        status: 'success',
        data: {
            prescription,
        },
    });
});




