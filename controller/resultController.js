const db = require("../config/database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { Result, ResultLine, ResultLineUrine } = require("../models/Result");
const { ResultLineSubAnalyses } = require("../models/resultLine");
const LaboPrices = require("../models/LaboPrices");

const { ResultType, SubAnalyses } = require("../models/ResultType");
const { ResultTypeUrine } = require("../models/ResultTypeUrine");
const Patient = require("../models/Patient");
const { min } = require("moment-timezone");
const e = require("express");
const { type } = require("os");

exports.deleteResult = catchAsync(async (req, res, next) => {
  const TheResult = await Result.findByPk(req.params.id);
  if (!TheResult) {
    return next(new AppError("No result found with that ID", 404));
  }
  await TheResult.destroy();
  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.createResult = catchAsync(async (req, res, next) => {
  if (req.body.paidPrice > req.body.totalPrice) {
    return next(new AppError("Paid price is greater than total Price"));
  }
  const newResult = await Result.create(req.body);
  req.body.analysis.forEach(async (line) => {
    const resulttype = await ResultType.findByPk(line.resultTypeID);
    if (!resulttype) {
      return;
    }
    const resultLine = await ResultLine.create({
      resultID: newResult.id,
      technology: resulttype.technology,
      periority: resulttype.periority,
      resultTypeID: line.resultTypeID,
      resultName: resulttype.resultName,
      resultPrice: resulttype.resultPrice,
      type: resulttype.type,
      min: resulttype.min,
      max: resulttype.max,
      unit: resulttype.unit,
      hasSubAnalyses: resulttype.hasSubAnalyses,
    });
    if (resulttype.hasSubAnalyses) {
      const subAnalyses = await SubAnalyses.findAll({
        where: {
          resultTypeId: resulttype.id,
        },
      });
      if (subAnalyses.length > 0) {
        for (const subAnalysis of subAnalyses) {
          await ResultLineSubAnalyses.create({
            resultLineID: resultLine.id,
            subAnalysisName: subAnalysis.subAnalysisName,
            subAnalysisID: subAnalysis.id,
            min: subAnalysis.min,
            max: subAnalysis.max,
            unit: subAnalysis.unit,
            periority: subAnalysis.periority,
          });
        }
      }
    }
  });
  req.body.analysisUrine.forEach(async (line) => {
    const resulttype = await ResultTypeUrine.findByPk(line.resultTypeID);
    if (!resulttype) {
      return;
    }
    await ResultLineUrine.create({
      resultID: newResult.id,
      resultTypeID: line.resultTypeID,
      resultName: resulttype.resultName,
    });
  });
  +res.status(201).json({
    status: "success",
    data: {
      newResult,
    },
  });
});

exports.updateResult = catchAsync(async (req, res, next) => {
  var TheResult = await Result.findByPk(req.params.id);
  if (!TheResult) {
    return next(new AppError("No result found with that ID", 404));
  }
  if (req.body.analysis) {
    const lines = await ResultLine.findAll({
      where: {
        resultID: req.params.id,
      },
    });
    lines.forEach(async (line) => {
      if (line.hasSubAnalyses) {
        const subAnalyses = await ResultLineSubAnalyses.findAll({
          where: {
            resultLineID: line.id,
          },
        });
        if (subAnalyses.length > 0) {
          for (const subAnalysis of subAnalyses) {
            await subAnalysis.destroy();
          }
        }
      }
      await line.destroy();
    });
    req.body.analysis.forEach(async (line) => {
      const resulttype = await ResultType.findByPk(line.resultTypeID);
      if (!resulttype) {
        return;
      }
      const resultLine = await ResultLine.create({
        id: line.id,
        resultID: req.params.id,
        resultTypeID: line.resultTypeID,
        technology: resulttype.technology,
        periority: resulttype.periority,
        resultName: resulttype.resultName,
        resultPrice: resulttype.resultPrice,
        type: resulttype.type,
        min: resulttype.min,
        max: resulttype.max,
        unit: resulttype.unit,
        resultValue: line.resultValue,
      });
      if (resulttype.hasSubAnalyses) {
        if (
          line.ResultLineSubAnalyses &&
          line.ResultLineSubAnalyses.length > 0
        ) {
          for (const subAnalysis of line.ResultLineSubAnalyses) {
            const subanalyse= await SubAnalyses.findByPk(subAnalysis.subAnalysisID);
            if(subanalyse){
              await ResultLineSubAnalyses.create({
                resultLineID: resultLine.id,
                subAnalysisName: subanalyse.subAnalysisName,
                subAnalysisID: subanalyse.id,
                min: subanalyse.min,
                max: subanalyse.max,
                unit: subanalyse.unit,
                periority: subanalyse.periority,
                value: subAnalysis.value
              });
            }
            
          }
        } else {
          const subAnalyses = await SubAnalyses.findAll({
            where: {
              resultTypeId: resultLine.resultTypeID,
            },
          });
          if (subAnalyses.length > 0) {
            for (const subAnalysis of subAnalyses) {
              await ResultLineSubAnalyses.create({
                resultLineID: resultLine.id,
                subAnalysisName: subAnalysis.subAnalysisName,
                            subAnalysisID: subAnalysis.id,

                min: subAnalysis.min,
                max: subAnalysis.max,
                unit: subAnalysis.unit,
                periority: subAnalysis.periority,
              });
            }
          }
        }
      }
    });
  }

  if (req.body.analysisUrine) {
    const lines = await ResultLineUrine.findAll({
      where: {
        resultID: req.params.id,
      },
    });
    lines.forEach(async (line) => {
      await line.destroy();
    });
    req.body.analysisUrine.forEach(async (line) => {
      const resulttype = await ResultTypeUrine.findByPk(line.resultTypeID);
      if (!resulttype) {
        return;
      }
      await ResultLineUrine.create({
        resultID: req.params.id,
        resultTypeID: line.resultTypeID,
        resultName: resulttype.resultName,
        optionName: line.optionName,
      });
    });
  }

  await TheResult.update(req.body);
  TheResult = await Result.findByPk(req.params.id);
  res.status(200).json({
    status: "success",
    data: {
      TheResult,
    },
  });
});

exports.getAllResults = catchAsync(async (req, res, next) => {
  const results = await Result.findAll();
  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});

exports.getResult = catchAsync(async (req, res, next) => {
  const Theresult = await Result.findByPk(req.params.id);
  if (!Theresult) {
    return next(new AppError("No result found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      Theresult,
    },
  });
});

exports.getResultByPatient = catchAsync(async (req, res, next) => {
  const results = await Result.findAll({
    where: {
      patientID: req.params.patientID,
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});

exports.getResultByPatientAndType = catchAsync(async (req, res, next) => {
  const results = await Result.findAll({
    where: {
      patientID: req.params.patientID,
      resultTypeID: req.params.resultTypeID,
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});

exports.getResultByPatientAndDep = catchAsync(async (req, res, next) => {
  const results = await Result.findAll({
    where: {
      patientID: req.params.patientID,
    },
    include: [
      {
        model: resultType,
        where: {
          resultDep: req.params.depID,
        },
      },
    ],
  });
  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});

exports.getRequestedResults = catchAsync(async (req, res, next) => {
  const requestedResults = await RequestedResult.findAll();
  res.status(200).json({
    status: "success",
    data: {
      requestedResults,
    },
  });
});

exports.getRequestedResult = catchAsync(async (req, res, next) => {
  const requestedResult = await RequestedResult.findByPk(req.params.id);
  if (!requestedResult) {
    return next(new AppError("No requested result found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      requestedResult,
    },
  });
});

exports.createRequestedResult = catchAsync(async (req, res, next) => {
  const newRequestedResult = await RequestedResult.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      newRequestedResult,
    },
  });
});

exports.updateRequestedResult = catchAsync(async (req, res, next) => {
  const requestedResult = await RequestedResult.findByPk(req.params.id);
  if (!requestedResult) {
    return next(new AppError("No requested result found with that ID", 404));
  }
  await requestedResult.update(req.body);
  res.status(200).json({
    status: "success",
    data: {
      requestedResult,
    },
  });
});

exports.deleteRequestedResult = catchAsync(async (req, res, next) => {
  const requestedResult = await RequestedResult.findByPk(req.params.id);
  if (!requestedResult) {
    return next(new AppError("No requested result found with that ID", 404));
  }
  await requestedResult.destroy();
  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.getAllThePatientThatRequestedResult = catchAsync(
  async (req, res, next) => {
    const requestedResults = await RequestedResult.findAll();
    const patientIDs = [];

    requestedResults.forEach((requestedResult) => {
      if (
        !patientIDs.includes(requestedResult.patientID) &&
        requestedResult.resultDepID == req.params.depID
      ) {
        patientIDs.push(requestedResult.patientID);
      }
    });

    const patients = await Promise.all(
      patientIDs.map(async (patientID) => {
        return await Patient.findByPk(patientID);
      })
    );

    res.status(200).json({
      status: "success",
      data: {
        patients,
      },
    });
  }
);
exports.getRequestedResultByPatient = catchAsync(async (req, res, next) => {
  const requestedResults = await RequestedResult.findAll({
    where: {
      patientID: req.params.patientID,
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      requestedResults,
    },
  });
});

exports.getRequestedResultByDep = catchAsync(async (req, res, next) => {
  const requestedResults = await RequestedResult.findAll({
    where: {
      resultDepID: req.params.depID,
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      requestedResults,
    },
  });
});

exports.getRequestedResultByPatientAndDep = catchAsync(
  async (req, res, next) => {
    const requestedResults = await RequestedResult.findAll({
      where: {
        patientID: req.params.patientID,
        resultDepID: req.params.depID,
      },
    });
    res.status(200).json({
      status: "success",
      data: {
        requestedResults,
      },
    });
  }
);

exports.deleteAllRequestedResults = catchAsync(async (req, res, next) => {
  const requestedResults = await RequestedResult.findAll();
  requestedResults.forEach(async (requestedResult) => {
    await requestedResult.destroy();
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.deleteAllRequestedResultsByPatiendAndDep = catchAsync(
  async (req, res, next) => {
    const requestedResults = await RequestedResult.findAll({
      where: {
        patientID: req.params.patientID,
        resultDepID: req.params.depID,
      },
    });
    requestedResults.forEach(async (requestedResult) => {
      await requestedResult.destroy();
    });
    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

exports.getNotConfirmedResults = catchAsync(async (req, res, next) => {
  const results = await Result.findAll({
    where: {
      status: "notConfirmed",
    },
  });
  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});

exports.confirmResult = catchAsync(async (req, res, next) => {
  const result = await Result.findByPk(req.params.id);
  if (!result) {
    return next(new AppError("No result found with that ID", 404));
  }
  result.status = "pending";
  await result.save();

  res.status(200).json({
    status: "success",
    data: {
      result,
    },
  });
});

exports.doctorCreateResult = catchAsync(async (req, res, next) => {
  const { patientID, doctorID, analysis } = req.body;

  // Check if the patient exists
  const patient = await Patient.findByPk(patientID);
  if (!patient) {
    return next(new AppError("No patient found with that ID", 404));
  }

  // Create the result
  const newResult = await Result.create({
    patientID,
    status: "notConfirmed",
    doctorID, // Associate the result with the doctor
  });

  // Add analysis lines
  for (const line of analysis) {
    const resultType = await ResultType.findByPk(line.resultTypeID);
    if (!resultType) {
      return next(new AppError("No result type found with that ID", 404));
    }
    await ResultLine.create({
      resultID: newResult.id,
      technology: resultType.technology,
      periority: resultType.periority,
      resultTypeID: line.resultTypeID,
      resultName: resultType.resultName,
      resultPrice: resultType.resultPrice,
      type: resultType.type,
      min: resultType.min,
      max: resultType.max,
      unit: resultType.unit,
    });
    newResult.totalPrice += resultType.resultPrice;
  }
  // IF req.body.urine=true
  if (req.body.urine) {
    const urineAnalysis = await ResultTypeUrine.findAll();
    if (urineAnalysis) {
      for (const line of urineAnalysis) {
        await ResultLineUrine.create({
          resultID: newResult.id,
          resultTypeID: line.id,
          resultName: line.resultName,
          optionName: line.optionName,
        });
      }
      // ADD urine price
      const urineprice = await LaboPrices.findByPk(2);
      if (urineprice) {
        newResult.totalPrice += urineprice.price;
      }
    }
  }
  // Save the total price
  await newResult.save();
  const updatedResult = await Result.findByPk(newResult.id);

  res.status(201).json({
    status: "success",
    data: {
      newResult,
    },
  });
});

exports.getResultsByDoctor = catchAsync(async (req, res, next) => {
  const results = await Result.findAll({
    where: {
      doctorID: req.params.doctorID,
    },
  });

  if (!results || results.length === 0) {
    return next(new AppError("No results found for this doctor", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      results,
    },
  });
});
