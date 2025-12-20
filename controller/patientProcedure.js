const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Procedure = require("../models/PreDefinedProcedure");
const Patient = require("../models/Patient");
const {
  InvoiceProcedure,
  InvoiceResult,
  Invoice,
} = require("../models/Invoice");
const ResultType = require("../models/ResultType");

exports.assignResultToInvoice = catchAsync(async (req, res, next) => {
  const { resultTypeID, invoiceID, quantity } = req.body;
  const resultType = await ResultType.findByPk(resultTypeID);
  if (!resultType) {
    return next(new AppError("No result type found with that ID", 404));
  }
  const invoice = await Invoice.findByPk(invoiceID);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  // check if the result type is already assigned to the invoice
  const isAssigned = await InvoiceResult.findOne({
    where: { invoiceID: invoiceID, resultTypeID: resultTypeID },
  });
  if (isAssigned) {
    await isAssigned.update({ quantity: isAssigned.quantity + quantity });
    return res.status(200).json({
      status: "success",
      data: {
        newInvoice,
      },
    });
  }

  await InvoiceResult.create({
    resultName: resultType.resultName,
    resultDescription: resultType.resultDescription,
    resultPrice: resultType.resultPrice,
    resultTypeID: resultType.id,
    quantity: quantity,
    invoiceID: invoice.invoiceId,
  });
  res.status(200).json({
    status: "success",
    data: {
      invoice,
    },
  });
});

exports.unassignResultFromInvoice = catchAsync(async (req, res, next) => {
  const { resultTypeID, invoiceID } = req.body;
  const invoice = await Invoice.findByPk(invoiceID);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  const isAssigned = await InvoiceResult.findOne({
    where: { invoiceID: invoiceID, resultTypeID: resultTypeID },
  });
  if (isAssigned) {
    if (isAssigned.quantity > 1) {
      await isAssigned.update({ quantity: isAssigned.quantity - 1 });
      return res.status(200).json({
        status: "success",
        data: {
          invoice,
        },
      });
    }
    await InvoiceResult.destroy({
      where: { invoiceID: invoiceID, resultTypeID: resultTypeID },
    });
    res.status(200).json({
      status: "success",
      data: {
        invoice,
      },
    });
  }

  res.status(404).json({
    status: "fail",
    message: "Result not assigned to this invoice",
  });
});

exports.assignProcedureToInvoice = catchAsync(async (req, res, next) => {
  const { procedureID, invoiceID, quantity } = req.body;
  const procedure = await Procedure.findByPk(procedureID);
  if (!procedure) {
    return next(new AppError("No procedure found with that ID", 404));
  }
  const invoice = await Invoice.findByPk(invoiceID);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }


  const isAssigned = await InvoiceProcedure.findOne({
    where: { invoiceID: invoiceID, procedureID: procedureID },
  });

  // if procedure has a cost range
  if (procedure.maxCost && procedure.cost!=procedure.maxCost) {
    if (
      req.body.cost > procedure.maxCost ||
      req.body.cost < procedure.minCost
    ) {
      return next(new AppError("Cost is out of range", 400));
    }
    if (isAssigned) {
      await isAssigned.update({ quantity: isAssigned.quantity + quantity });
      return res.status(200).json({
        status: "success",
        data: {
          invoice,
        },
      });
    }

    await InvoiceProcedure.create({
      invoiceID: invoiceID,
      procedureName: procedure.procedureName,
      description: procedure.description,
      cost: req.body.cost,
      procedureID: procedure.id,
      quantity: quantity,
    });
    return res.status(200).json({
      status: "success",
      data: {
        invoice,
      },
    });
  }
  // if procedure has no cost range
  if (isAssigned) {
    await isAssigned.update({ quantity: isAssigned.quantity + quantity });
    return res.status(200).json({
      status: "success",
      data: {
        invoice,
      },
    });
  }
  await InvoiceProcedure.create({
    invoiceID: invoiceID,
    procedureName: procedure.procedureName,
    description: procedure.description,
    cost: procedure.cost,
    procedureID: procedure.id,
    quantity: quantity,
  });
  res.status(200).json({
    status: "success",
    data: {
      invoice,
    },
  });
});

exports.unassignProcedureFromInvoice = catchAsync(async (req, res, next) => {
  const { procedureID, invoiceID } = req.body;
  const invoice = await Invoice.findByPk(invoiceID);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  const procedure = await InvoiceProcedure.findOne({
    where: { invoiceID: invoiceID, procedureID: procedureID },
  });
  if (!procedure) {
    return next(new AppError("No procedure found with that ID", 404));
  }
  // if quantity is more than 1, decrease quantity by 1
  if (procedure.quantity > 1) {
    await procedure.update({ quantity: procedure.quantity - 1 });
    return res.status(200).json({
      status: "success",
      data: {
        invoice,
      },
    });
  }
  // if quantity is 1, delete the procedure

  await procedure.destroy();

  res.status(200).json({
    status: "success",
    data: {
      invoice,
    },
  });
});

exports.getProceduresByInvoice = catchAsync(async (req, res, next) => {
  const { invoiceID } = req.params;
  const invoice = await Invoice.findByPk(invoiceID);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  const procedures = await InvoiceProcedure.findAll({
    where: { invoiceID: invoiceID },
  });
  res.status(200).json({
    status: "success",
    data: {
      procedures,
    },
  });
});

exports.getResultsByInvoice = catchAsync(async (req, res, next) => {
  const { invoiceID } = req.params;
  const invoice = await Invoice.findByPk(invoiceID);
  if (!invoice) {
    return next(new AppError("No invoice found with that ID", 404));
  }
  const results = await InvoiceResult.findAll({
    where: { invoiceID: invoiceID },
  });
  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});

exports.getPendingInvoicesByType = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.findAll({
    where: {
      invoiceStatus: "unpaid",
      type: req.query.type, // Filter by type
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      invoices,
    },
  });
});

exports.getPaidInvoicesByType = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.findAll({
    where: {
      invoiceStatus: "paid",
      type: req.query.type, // Filter by type
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      invoices,
    },
  });
});

exports.getPaidInvoicesByDateByType = catchAsync(async (req, res, next) => {
  const date = new Date(req.params.date);
  const startOfDay = new Date(date.setHours(0, 0, 0, 0));
  const endOfDay = new Date(date.setHours(23, 59, 59, 999));

  const invoices = await Invoice.findAll({
    where: {
      invoiceStatus: "paid",
      paimentDate: {
        [Op.between]: [startOfDay, endOfDay],
      },
      type: req.query.type, // Filter by type
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      invoices,
    },
  });
});

exports.searchInvoiceByNameByType = catchAsync(async (req, res, next) => {
  const invoices = await Invoice.scope("defaultScope").findAll({
    where: {
      invoiceStatus: req.query.status,
      type: req.query.type, // Filter by type
    },
    include: [
      {
        model: Patient,
        where: {
          name: { [Op.iLike]: `%${req.query.name}%` },
        },
      },
    ],
  });
  res.status(200).json({
    status: "success",
    data: {
      invoices,
    },
  });
});

exports.searchPaidInvoicesByDateRangeByType = catchAsync(
  async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (new Date(startDate) > new Date(endDate)) {
      return next(new appError("Start date must be before end date", 400));
    }

    const invoices = await Invoice.findAll({
      where: {
        paimentDate: {
          [Op.gte]: new Date(startDate).toISOString(),
          [Op.lte]: new Date(endDate).toISOString(),
        },
        invoiceStatus: "paid",
        type: req.query.type, // Filter by type
      },
    });

    res.status(200).json({
      status: "success",
      data: {
        invoices,
      },
    });
  }
);
