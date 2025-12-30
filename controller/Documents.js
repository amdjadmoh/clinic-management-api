const { 
    Consent_certificate, 
    Birth_notice, 
    BirthDeclaration, 
    OperationCostDeclaration,
    DeathDeclaration,
    BirthCertificate,
    HospitalStayBulletin
} = require('../models/Documents');
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { Op } = require("sequelize");

exports.createConsentCertificate = catchAsync(async (req, res) => {
  const newCertificate = await Consent_certificate.create({
    fullName: req.body.fullName,
    NIN: req.body.NIN,
    idReleaseDate: req.body.idReleaseDate,
    idReleasedFrom: req.body.idReleasedFrom,
    date: req.body.date,
    relationToPatient: req.body.relationToPatient,
    patientName: req.body.patientName,
    patientNIN: req.body.patientNIN,
    patientIdReleasedFrom: req.body.patientIdReleasedFrom,
    patientIdReleaseDate: req.body.patientIdReleaseDate,
    text: req.body.text,
  });

  res.status(201).json({
    status: "success",
    data: {
      certificate: newCertificate,
    },
  });
});

exports.createBirthNotice = catchAsync(async (req, res) => {
  const newBirthNotice = await Birth_notice.create({
    DirectorfullName: req.body.DirectorfullName,
    mairieName: req.body.mairieName,
    mairieEtatCivil: req.body.mairieEtatCivil,
    date: req.body.date,
    hour: req.body.hour,
    sex: req.body.sex,
    childName: req.body.childName,
    fatherName: req.body.fatherName,
    fatherJob: req.body.fatherJob,
    fatherDateOfBirth: req.body.fatherDateOfBirth,
    fatherPlaceOfBirth: req.body.fatherPlaceOfBirth,
    MotherName: req.body.MotherName,
    MotherJob: req.body.MotherJob,
    MotherDateOfBirth: req.body.MotherDateOfBirth,
    MotherPlaceOfBirth: req.body.MotherPlaceOfBirth,
    address: req.body.address,
    dateOfMarriage: req.body.dateOfMarriage,
    StateInLaw: req.body.StateInLaw,
    firstMarriage: req.body.firstMarriage,
    childrenNumber: req.body.childrenNumber,
    nameInLatin: req.body.nameInLatin,
    childNIN: req.body.childNIN,
  });

  res.status(201).json({
    status: "success",
    data: {
      birthNotice: newBirthNotice,
    },
  });
});

exports.createBirthDeclaration = catchAsync(async (req, res) => {
  const newBirthDeclaration = await BirthDeclaration.create({
    declarantName: req.body.declarantName,
    motherName: req.body.motherName,
    motherDateOfBirth: req.body.motherDateOfBirth,
    motherPlaceOfBirth: req.body.motherPlaceOfBirth,
    fatherFirstName: req.body.fatherFirstName,
    fatherLastName: req.body.fatherLastName,
    fatherPlaceOfBirth: req.body.fatherPlaceOfBirth,
    fatherDateOfBirth: req.body.fatherDateOfBirth,
    address: req.body.address,
    childBrithDate: req.body.childBrithDate,
    childBrithHour: req.body.childBrithHour,
    gender: req.body.gender,
    weightKg: req.body.weightKg,
    arabicName: req.body.arabicName,
    nom: req.body.nom,
    prenoms: req.body.prenoms,
  });

  res.status(201).json({
    status: "success",
    data: {
      birthDeclaration: newBirthDeclaration,
    },
  });
});

exports.createOperationCostDeclaration = catchAsync(async (req, res) => {
  const newOperationCostDeclaration = await OperationCostDeclaration.create({
    patientName: req.body.patientName,
    patientNIN: req.body.patientNIN,
    patientIdReleaseDate: req.body.patientIdReleaseDate,
    patientIdReleasedFrom: req.body.patientIdReleasedFrom,
    date: req.body.date,
    delcaration: req.body.delcaration,
  });

  res.status(201).json({
    status: "success",
    data: {
      operationCostDeclaration: newOperationCostDeclaration,
    },
  });
});

// Consent Certificate
exports.getAllConsentCertificatesByYear = catchAsync(async (req, res) => {
  const year = req.params.year;
  const certificates = await Consent_certificate.findAll({
    where: {
      id: {
        [Op.like]: `${year}/%`,
      },
    },
    order: [["id", "ASC"]],
  });

  res.status(200).json({
    status: "success",
    results: certificates.length,
    data: {
      certificates,
    },
  });
});

exports.getConsentCertificateById = catchAsync(async (req, res, next) => {
  const certificate = await Consent_certificate.findByPk(req.params.id);

  if (!certificate) {
    return next(new appError("No certificate found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      certificate,
    },
  });
});
exports.updateConsentCertificate = catchAsync(async (req, res, next) => {
    const certificate = await Consent_certificate.findByPk(req.params.id);
    
    if (!certificate) {
        return next(new appError('No consent certificate found with that ID', 404));
    }

    await certificate.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            certificate
        }
    });
});

// Delete Consent Certificate
exports.deleteConsentCertificate = catchAsync(async (req, res, next) => {
    const certificate = await Consent_certificate.findByPk(req.params.id);
    
    if (!certificate) {
        return next(new appError('No consent certificate found with that ID', 404));
    }

    await certificate.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Birth Notice
exports.getAllBirthNoticesByYear = catchAsync(async (req, res) => {
  const year = req.params.year;
  const notices = await Birth_notice.findAll({
    where: {
      id: {
        [Op.like]: `${year}/%`,
      },
    },
    order: [["id", "ASC"]],
  });

  res.status(200).json({
    status: "success",
    results: notices.length,
    data: {
      notices,
    },
  });
});

exports.getBirthNoticeById = catchAsync(async (req, res, next) => {
  const notice = await Birth_notice.findByPk(req.params.id);

  if (!notice) {
    return next(new appError("No birth notice found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      notice,
    },
  });
});
// Update Birth Notice
exports.updateBirthNotice = catchAsync(async (req, res, next) => {
    const notice = await Birth_notice.findByPk(req.params.id);
    
    if (!notice) {
        return next(new appError('No birth notice found with that ID', 404));
    }

    await notice.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            notice
        }
    });
});

// Delete Birth Notice
exports.deleteBirthNotice = catchAsync(async (req, res, next) => {
    const notice = await Birth_notice.findByPk(req.params.id);
    
    if (!notice) {
        return next(new appError('No birth notice found with that ID', 404));
    }

    await notice.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});
// Birth Declaration
exports.getAllBirthDeclarationsByYear = catchAsync(async (req, res) => {
  const year = req.params.year;
  const declarations = await BirthDeclaration.findAll({
    where: {
      id: {
        [Op.like]: `${year}/%`,
      },
    },
    order: [["id", "ASC"]],
  });

  res.status(200).json({
    status: "success",
    results: declarations.length,
    data: {
      declarations,
    },
  });
});

exports.getBirthDeclarationById = catchAsync(async (req, res, next) => {
  const declaration = await BirthDeclaration.findByPk(req.params.id);

  if (!declaration) {
    return next(new appError("No birth declaration found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      declaration,
    },
  });
});
// Update Birth Declaration
exports.updateBirthDeclaration = catchAsync(async (req, res, next) => {
    const declaration = await BirthDeclaration.findByPk(req.params.id);
    
    if (!declaration) {
        return next(new appError('No birth declaration found with that ID', 404));
    }

    await declaration.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            declaration
        }
    });
});

// Delete Birth Declaration
exports.deleteBirthDeclaration = catchAsync(async (req, res, next) => {
    const declaration = await BirthDeclaration.findByPk(req.params.id);
    
    if (!declaration) {
        return next(new appError('No birth declaration found with that ID', 404));
    }

    await declaration.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Operation Cost Declaration
exports.getAllOperationCostDeclarationsByYear = catchAsync(async (req, res) => {
  const year = req.params.year;
  const declarations = await OperationCostDeclaration.findAll({
    where: {
      id: {
        [Op.like]: `${year}/%`,
      },
    },
    order: [["id", "ASC"]],
  });

  res.status(200).json({
    status: "success",
    results: declarations.length,
    data: {
      declarations,
    },
  });
});

exports.getOperationCostDeclarationById = catchAsync(async (req, res, next) => {
  const declaration = await OperationCostDeclaration.findByPk(req.params.id);

  if (!declaration) {
    return next(
      new appError("No operation cost declaration found with that ID", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      declaration,
    },
  });
});
// Update Operation Cost Declaration
exports.updateOperationCostDeclaration = catchAsync(async (req, res, next) => {
    const declaration = await OperationCostDeclaration.findByPk(req.params.id);
    
    if (!declaration) {
        return next(new appError('No operation cost declaration found with that ID', 404));
    }

    await declaration.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            declaration
        }
    });
});

// Delete Operation Cost Declaration
exports.deleteOperationCostDeclaration = catchAsync(async (req, res, next) => {
    const declaration = await OperationCostDeclaration.findByPk(req.params.id);
    
    if (!declaration) {
        return next(new appError('No operation cost declaration found with that ID', 404));
    }

    await declaration.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Birth Certificate Controllers
exports.createBirthCertificate = catchAsync(async (req, res) => {
    const newBirthCertificate = await BirthCertificate.create({
        referenceDate: req.body.referenceDate,
        doctorName: req.body.doctorName,
        motherFullName: req.body.motherFullName,
        motherBirthDate: req.body.motherBirthDate,
        motherPlaceOfBirth: req.body.motherPlaceOfBirth,
        residence: req.body.residence,
        spouseFirstName: req.body.spouseFirstName,
        spouseLastName: req.body.spouseLastName,
        spouseBirthDate: req.body.spouseBirthDate,
        spousePlaceOfBirth: req.body.spousePlaceOfBirth,
        deliveryDate: req.body.deliveryDate,
        deliveryTime: req.body.deliveryTime,
        babyGender: req.body.babyGender,
        babyWeight: req.body.babyWeight,
        babyName: req.body.babyName,
        latinLastName: req.body.latinLastName,
        latinFirstName: req.body.latinFirstName
    });

    res.status(201).json({
        status: 'success',
        data: {
            birthCertificate: newBirthCertificate
        }
    });
});

exports.getBirthCertificateById = catchAsync(async (req, res, next) => {
    const birthCertificate = await BirthCertificate.findByPk(req.params.id);

    if (!birthCertificate) {
        return next(new appError('No birth certificate found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            birthCertificate
        }
    });
});

exports.getAllBirthCertificatesByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const birthCertificates = await BirthCertificate.findAll({
        where: {
            createdAt: {
                [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)]
            }
        },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: birthCertificates.length,
        data: {
            birthCertificates
        }
    });
});

exports.updateBirthCertificate = catchAsync(async (req, res, next) => {
    const birthCertificate = await BirthCertificate.findByPk(req.params.id);

    if (!birthCertificate) {
        return next(new appError('No birth certificate found with that ID', 404));
    }

    await birthCertificate.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            birthCertificate
        }
    });
});

exports.deleteBirthCertificate = catchAsync(async (req, res, next) => {
    const birthCertificate = await BirthCertificate.findByPk(req.params.id);

    if (!birthCertificate) {
        return next(new appError('No birth certificate found with that ID', 404));
    }

    await birthCertificate.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.createDeathDeclaration = catchAsync(async (req, res) => {
    const newDeathDeclaration = await DeathDeclaration.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
            deathDeclaration: newDeathDeclaration
        }
    });
});

exports.getAllDeathDeclarationsByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const deathDeclarations = await DeathDeclaration.findAll({
        where: {
            id: {
                [Op.like]: `${year}%`
            }
        },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: deathDeclarations.length,
        data: {
            deathDeclarations
        }
    });
});

exports.getDeathDeclarationById = catchAsync(async (req, res, next) => {
    const deathDeclaration = await DeathDeclaration.findByPk(req.params.id);

    if (!deathDeclaration) {
        return next(new appError('No death declaration found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            deathDeclaration
        }
    });
});

exports.updateDeathDeclaration = catchAsync(async (req, res, next) => {
    const deathDeclaration = await DeathDeclaration.findByPk(req.params.id);

    if (!deathDeclaration) {
        return next(new appError('No death declaration found with that ID', 404));
    }

    await deathDeclaration.update(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            deathDeclaration
        }
    });
});

exports.deleteDeathDeclaration = catchAsync(async (req, res, next) => {
    const deathDeclaration = await DeathDeclaration.findByPk(req.params.id);

    if (!deathDeclaration) {
        return next(new appError('No death declaration found with that ID', 404));
    }

    await deathDeclaration.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Hospital Stay Bulletin Controllers
exports.createHospitalStayBulletin = catchAsync(async (req, res) => {
    const newBulletin = await HospitalStayBulletin.create({
        patientName: req.body.patientName,
        address: req.body.address,
        age: req.body.age,
        profession: req.body.profession,
        hospitalizationStartDate: req.body.hospitalizationStartDate,
        hospitalizationEndDate: req.body.hospitalizationEndDate,
        operatedBy: req.body.operatedBy,
        date: req.body.date
    });

    res.status(201).json({
        status: 'success',
        data: {
            bulletin: newBulletin
        }
    });
});

exports.getAllHospitalStayBulletinsByYear = catchAsync(async (req, res) => {
    const year = req.params.year;
    const bulletins = await HospitalStayBulletin.findAll({
        where: {
            id: {
                [Op.like]: `${year}/%`
            }
        },
        order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
        status: 'success',
        results: bulletins.length,
        data: {
            bulletins
        }
    });
});

exports.getHospitalStayBulletinById = catchAsync(async (req, res, next) => {
    const bulletin = await HospitalStayBulletin.findByPk(req.params.id);

    if (!bulletin) {
        return next(new appError('No hospital stay bulletin found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            bulletin
        }
    });
});

exports.updateHospitalStayBulletin = catchAsync(async (req, res, next) => {
    const bulletin = await HospitalStayBulletin.findByPk(req.params.id);

    if (!bulletin) {
        return next(new appError('No hospital stay bulletin found with that ID', 404));
    }

    // Only update allowed fields
    const updatedBulletin = await bulletin.update({
        patientName: req.body.patientName,
        address: req.body.address,
        age: req.body.age,
        profession: req.body.profession,
        hospitalizationStartDate: req.body.hospitalizationStartDate,
        hospitalizationEndDate: req.body.hospitalizationEndDate,
        operatedBy: req.body.operatedBy,
        date: req.body.date
    });

    res.status(200).json({
        status: 'success',
        data: {
            bulletin: updatedBulletin
        }
    });
});

exports.deleteHospitalStayBulletin = catchAsync(async (req, res, next) => {
    const bulletin = await HospitalStayBulletin.findByPk(req.params.id);

    if (!bulletin) {
        return next(new appError('No hospital stay bulletin found with that ID', 404));
    }

    await bulletin.destroy();

    res.status(204).json({
        status: 'success',
        data: null
    });
});
