const Ats = require('../models/Ats');
const AtsSalaryHistory = require('../models/AtsSalaryHistory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const db = require('../config/database');

// Create a new ATS document
exports.createAts = catchAsync(async (req, res, next) => {
  const { salaryHistory, ...atsData } = req.body;


  // Create ATS and its Salary History records inside a transaction
  const result = await db.transaction(async (t) => {
    const newAts = await Ats.create(atsData, { transaction: t });

    let createdSalaries = [];
    if (salaryHistory && Array.isArray(salaryHistory)) {
      const historiesToCreate = salaryHistory.map(row => ({
        ...row,
        atsId: newAts.id
      }));
      createdSalaries = await AtsSalaryHistory.bulkCreate(historiesToCreate, { transaction: t });
    }

    return { ats: newAts, salaryHistory: createdSalaries };
  });

  res.status(201).json({
    status: 'success',
    data: result
  });
});

// Retrieve all ATS documents
exports.getAllAts = catchAsync(async (req, res, next) => {
  const documents = await Ats.findAll({
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: documents.length,
    data: {
      documents
    }
  });
});

// Retrieve a single ATS document by ID with its salary history
exports.getAts = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const document = await Ats.findByPk(id, {
    include: [{
      model: AtsSalaryHistory
    }]
  });

  if (!document) {
    return next(new AppError('ATS document not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      ats: document
    }
  });
});

// Update an existing ATS document
exports.updateAts = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { salaryHistory, ...atsData } = req.body;

  const document = await Ats.findByPk(id);
  if (!document) {
    return next(new AppError('ATS document not found', 404));
  }

  const result = await db.transaction(async (t) => {
    // Update main document
    const updatedAts = await document.update(atsData, { transaction: t });

    let updatedSalaries = [];
    if (salaryHistory && Array.isArray(salaryHistory)) {
      // Delete existing salary histories
      await AtsSalaryHistory.destroy({
        where: { atsId: id },
        transaction: t
      });

      // Insert new salary histories
      const historiesToCreate = salaryHistory.map(row => ({
        ...row,
        atsId: id
      }));
      updatedSalaries = await AtsSalaryHistory.bulkCreate(historiesToCreate, { transaction: t });
    } else {
      // Fetch current ones if not updated
      updatedSalaries = await AtsSalaryHistory.findAll({
        where: { atsId: id },
        transaction: t
      });
    }

    return { ats: updatedAts, salaryHistory: updatedSalaries };
  });

  res.status(200).json({
    status: 'success',
    data: result
  });
});

// Delete an ATS document
exports.deleteAts = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const document = await Ats.findByPk(id);
  if (!document) {
    return next(new AppError('ATS document not found', 404));
  }

  await document.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});
