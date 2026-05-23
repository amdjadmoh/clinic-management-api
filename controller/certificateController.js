const CertificateTemplate = require('../models/CertificateTemplate');
const PatientCertificate = require('../models/PatientCertificate');
const Patient = require('../models/Patient');
const { Doctors } = require('../models/Doctors');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const DEFAULT_TEMPLATES = {
    maladie: {
        certificateType: 'maladie',
        title: 'Certificat Médical d\'Arrêt de Travail',
        templateText: 'Je soussigné, Docteur {{doctorName}}, certifie avoir examiné ce jour le/la patient(e) {{patientName}}, né(e) le {{patientBirthDate}}.\n\nSon état de santé nécessite un arrêt de travail d\'une durée de {{daysCount}} jours à compter de ce jour, sous réserve de prolongation.\n\nFait à {{city}}, le {{currentDate}}.'
    },
    aptitude: {
        certificateType: 'aptitude',
        title: 'Certificat Médical d\'Aptitude',
        templateText: 'Je soussigné, Docteur {{doctorName}}, certifie avoir examiné ce jour le/la patient(e) {{patientName}}, né(e) le {{patientBirthDate}}.\n\nL\'examen clinique de ce jour ne révèle aucune contre-indication apparente à la pratique de {{activity}}.\n\nFait à {{city}}, le {{currentDate}}.'
    },
    presence: {
        certificateType: 'presence',
        title: 'Certificat de Présence',
        templateText: 'Je soussigné, Docteur {{doctorName}}, certifie que le/la patient(e) {{patientName}}, né(e) le {{patientBirthDate}}, a été présent(e) au sein de notre établissement ce jour de {{startTime}} à {{endTime}} pour des soins médicaux.\n\nFait à {{city}}, le {{currentDate}}.'
    },
    general: {
        certificateType: 'general',
        title: 'Certificat Médical Général',
        templateText: 'Je soussigné, Docteur {{doctorName}}, certifie avoir examiné ce jour le/la patient(e) {{patientName}}, né(e) le {{patientBirthDate}}, et déclare que son état de santé général est satisfaisant.\n\nCe certificat est délivré à la demande de l\'intéressé(e) pour servir et valoir ce que de droit.\n\nFait à {{city}}, le {{currentDate}}.'
    }
};

const VALID_TYPES = ['maladie', 'aptitude', 'presence', 'general'];

// --- Doctor Template Handlers ---

exports.getDoctorTemplates = catchAsync(async (req, res, next) => {
    const { doctorID } = req.params;
    const doctor = await Doctors.findByPk(doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    const customized = await CertificateTemplate.findAll({
        where: { doctorID }
    });

    const customMap = new Map(customized.map(t => [t.certificateType, t]));
    const templates = VALID_TYPES.map(type => {
        if (customMap.has(type)) {
            const template = customMap.get(type);
            return {
                id: template.id,
                doctorID: template.doctorID,
                certificateType: template.certificateType,
                title: template.title,
                templateText: template.templateText,
                isDefault: false,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            };
        }
        return {
            id: null,
            doctorID: parseInt(doctorID),
            certificateType: type,
            title: DEFAULT_TEMPLATES[type].title,
            templateText: DEFAULT_TEMPLATES[type].templateText,
            isDefault: true,
            createdAt: null,
            updatedAt: null
        };
    });

    res.status(200).json({
        status: 'success',
        data: {
            templates
        }
    });
});

exports.getDoctorTemplateByType = catchAsync(async (req, res, next) => {
    const { doctorID, certificateType } = req.params;

    if (!VALID_TYPES.includes(certificateType)) {
        return next(new AppError(`Invalid certificate type. Must be one of ${VALID_TYPES.join(', ')}`, 400));
    }

    const doctor = await Doctors.findByPk(doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    const template = await CertificateTemplate.findOne({
        where: { doctorID, certificateType }
    });

    if (!template) {
        return res.status(200).json({
            status: 'success',
            data: {
                template: {
                    id: null,
                    doctorID: parseInt(doctorID),
                    certificateType,
                    title: DEFAULT_TEMPLATES[certificateType].title,
                    templateText: DEFAULT_TEMPLATES[certificateType].templateText,
                    isDefault: true,
                    createdAt: null,
                    updatedAt: null
                }
            }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            template: {
                id: template.id,
                doctorID: template.doctorID,
                certificateType: template.certificateType,
                title: template.title,
                templateText: template.templateText,
                isDefault: false,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            }
        }
    });
});

exports.upsertDoctorTemplate = catchAsync(async (req, res, next) => {
    const { doctorID } = req.params;
    const { certificateType, title, templateText } = req.body;

    if (!certificateType || !title || !templateText) {
        return next(new AppError('Please provide certificateType, title, and templateText', 400));
    }

    if (!VALID_TYPES.includes(certificateType)) {
        return next(new AppError(`Invalid certificate type. Must be one of ${VALID_TYPES.join(', ')}`, 400));
    }

    const doctor = await Doctors.findByPk(doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    let template = await CertificateTemplate.findOne({
        where: { doctorID, certificateType }
    });

    if (template) {
        template = await template.update({ title, templateText });
    } else {
        template = await CertificateTemplate.create({
            doctorID,
            certificateType,
            title,
            templateText
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            template: {
                id: template.id,
                doctorID: template.doctorID,
                certificateType: template.certificateType,
                title: template.title,
                templateText: template.templateText,
                isDefault: false,
                createdAt: template.createdAt,
                updatedAt: template.updatedAt
            }
        }
    });
});

// --- Patient Certificate Handlers ---

exports.savePatientCertificate = catchAsync(async (req, res, next) => {
    const { patientID } = req.params;
    const { doctorID, certificateType, title, text } = req.body;

    if (!doctorID || !certificateType || !title || !text) {
        return next(new AppError('Please provide doctorID, certificateType, title, and text', 400));
    }

    if (!VALID_TYPES.includes(certificateType)) {
        return next(new AppError(`Invalid certificate type. Must be one of ${VALID_TYPES.join(', ')}`, 400));
    }

    const patient = await Patient.findByPk(patientID);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }

    const doctor = await Doctors.findByPk(doctorID);
    if (!doctor) {
        return next(new AppError('Doctor not found', 404));
    }

    const certificate = await PatientCertificate.create({
        patientID,
        doctorID,
        certificateType,
        title,
        text
    });

    res.status(201).json({
        status: 'success',
        data: {
            certificate
        }
    });
});

exports.getPatientCertificates = catchAsync(async (req, res, next) => {
    const { patientID } = req.params;

    const patient = await Patient.findByPk(patientID);
    if (!patient) {
        return next(new AppError('Patient not found', 404));
    }

    const certificates = await PatientCertificate.findAll({
        where: { patientID },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        data: {
            certificates
        }
    });
});

exports.getPatientCertificateByID = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const certificate = await PatientCertificate.findByPk(id, {
        include: [
            {
                model: Patient,
                attributes: ['name', 'birthdate', 'NIN']
            },
            {
                model: Doctors,
                attributes: ['name', 'speciality', 'NIN']
            }
        ]
    });

    if (!certificate) {
        return next(new AppError('Patient certificate not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            certificate
        }
    });
});

exports.updatePatientCertificate = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { title, text } = req.body;

    const certificate = await PatientCertificate.findByPk(id);
    if (!certificate) {
        return next(new AppError('Patient certificate not found', 404));
    }

    const updated = await certificate.update({ title, text });

    res.status(200).json({
        status: 'success',
        data: {
            certificate: updated
        }
    });
});

exports.deletePatientCertificate = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const certificate = await PatientCertificate.findByPk(id);
    if (!certificate) {
        return next(new AppError('Patient certificate not found', 404));
    }

    await certificate.destroy();

    res.status(200).json({
        status: 'success',
        data: null
    });
});
