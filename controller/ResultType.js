const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {ResultType,SubAnalyses,analysisPreSet,analysisPreSetItem} = require('../models/ResultType');
const {ResultTypeUrine,ResultTypeUrineOptions} = require('../models/ResultTypeUrine')
const Dep = require('../models/Dep');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.createResultType = catchAsync(async (req, res, next) => {
    const resultType = await ResultType.create(req.body);
    if (req.body.hasSubAnalyses && req.body.hasSubAnalyses === true) {
        const subAnalyses = req.body.subAnalyses.map(subAnalysis => ({
            ...subAnalysis,
            resultTypeId: resultType.id
        }));
        await SubAnalyses.bulkCreate(subAnalyses);
    }
    res.status(201).json({
        status: 'success',
        data: {
            resultType
        }
    });
});

exports.getAllResultTypes = catchAsync(async (req, res, next) => {
    const resultTypes = await ResultType.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            resultTypes
        }
    });
}
);

exports.getResultType = catchAsync(async (req, res, next) => {
    const resultType = await ResultType.findByPk(req.params.id);
    if (!resultType) {
        return next(new AppError('No result type found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            resultType
        }
    });
}
);

exports.updateResultType = catchAsync(async (req, res, next) => {
    const resultType = await ResultType.findByPk(req.params.id);
    if (!resultType) {
        return next(new AppError('No result type found with that ID', 404));
    }
    await resultType.update(req.body);
    // Update sub-analyses if they exist
    if (req.body.SubAnalyses && resultType.hasSubAnalyses) {
        // First, delete existing sub-analyses
        await SubAnalyses.destroy({
            where: {
                resultTypeId: resultType.id
            }
        });
        const subAnalyses = req.body.SubAnalyses.map(subAnalysis => ({
            ...subAnalysis,
            resultTypeId: resultType.id
        }));
        await SubAnalyses.bulkCreate(subAnalyses);
    }
    res.status(200).json({
        status: 'success',
        data: {
            resultType
        }
    });
}
);

exports.deleteResultType = catchAsync(async (req, res, next) => {
    const resultType = await ResultType.findByPk(req.params.id);
    if (!resultType) {
        return next(new AppError('No result type found with that ID', 404));
    }
    await SubAnalyses.destroy({
        where: {
            resultTypeId: resultType.id
        }
    });
    await resultType.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);


exports.createResultTypeUrine = catchAsync(async (req, res, next) => {
    const resultTypeUrine = await ResultTypeUrine.create(req.body);
    // if req.body.options is provided, create options
    if (req.body.options ) {
        const options = req.body.options.map(option => ({
            ...option,
            resultTypeUrineID: resultTypeUrine.id
        }));
        console.log(options);
        await ResultTypeUrineOptions.bulkCreate(options);
    }
    // Return the created result type urine with its options
    const resultTypeUrineWithOptions = await ResultTypeUrine.findByPk(resultTypeUrine.id);
    res.status(201).json({
        status: 'success',
        data: {
            resultTypeUrineWithOptions
        }
    });
});

exports.getAllResultTypeUrines = catchAsync(async (req, res, next) => {
    const resultTypeUrines = await ResultTypeUrine.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            resultTypeUrines
        }
    });
});

exports.getResultTypeUrine = catchAsync(async (req, res, next) => {
    const resultTypeUrine = await ResultTypeUrine.findByPk(req.params.id);
    if (!resultTypeUrine) {
        return next(new AppError('No result type urine found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            resultTypeUrine
        }
    });
});

exports.updateResultTypeUrine = catchAsync(async (req, res, next) => {
    const resultTypeUrine = await ResultTypeUrine.findByPk(req.params.id);
    if (!resultTypeUrine) {
        return next(new AppError('No result type urine found with that ID', 404));
    }
    await resultTypeUrine.update(req.body);
    // update options 
    if (req.body.options && Array.isArray(req.body.options)) {
        // First, delete existing options
        await ResultTypeUrineOptions.destroy({
            where: {
                resultTypeUrineID: resultTypeUrine.id
            }
        });
        // Then, create new options
        const options = req.body.options.map(option => ({
            ...option,
            resultTypeUrineID: resultTypeUrine.id
        }));
        await ResultTypeUrineOptions.bulkCreate(options);
    }
    // Return the updated result type urine with its options
    const resultTypeUrineWithOptions = await ResultTypeUrine.findByPk(resultTypeUrine.id);

    res.status(200).json({
        status: 'success',
        data: {
            resultTypeUrineWithOptions
        }
    });
});

exports.deleteResultTypeUrine = catchAsync(async (req, res, next) => {
    const resultTypeUrine = await ResultTypeUrine.findByPk(req.params.id);
    if (!resultTypeUrine) {
        return next(new AppError('No result type urine found with that ID', 404));
    }
    await ResultTypeUrineOptions.destroy({
        where: {
            resultTypeUrineID: resultTypeUrine.id
        }
    });
    await resultTypeUrine.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getAllAnalysisPreSets = catchAsync(async (req, res, next) => {
    const analysisPreSets = await analysisPreSet.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            analysisPreSets
        }
    });
});

exports.createAnalysisPreSet = catchAsync(async (req, res, next) => {
    const analysispreSet = await analysisPreSet.create(req.body);
    if (req.body.analysis) {
        const analysisPreSetItems = req.body.analysis.map(item => ({
            ...item,
            analysisPreSetId: analysispreSet.id
        }));
        await analysisPreSetItem.bulkCreate(analysisPreSetItems);
    }
    res.status(201).json({
        status: 'success',
        data: {
            analysispreSet
        }
    });
});

exports.updateAnalysisPreSet = catchAsync(async (req, res, next) => {
    const analysispreSet = await analysisPreSet.findByPk(req.params.id);
    if (!analysisPreSet) {
        return next(new AppError('No analysis preset found with that ID', 404));
    }
    await analysispreSet.update(req.body);
    // delete old analysisPreSetItems
    await analysisPreSetItem.destroy({
        where: {
            analysisPreSetId: analysispreSet.id
        }
    });
    // create new analysisPreSetItems
    if (req.body.analysis) {
        const analysisPreSetItems = req.body.analysis.map(item => ({
            ...item,
            analysisPreSetId: analysispreSet.id
        }));
        await analysisPreSetItem.bulkCreate(analysisPreSetItems);
    }
    res.status(200).json({
        status: 'success',
        data: {
            analysispreSet
        }
    });
});

exports.getAnalysisPreSet = catchAsync(async (req, res, next) => {
    const analysispreSet = await analysisPreSet.findByPk(req.params.id);
    if (!analysispreSet) {
        return next(new AppError('No analysis preset found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
           analysispreSet
        }
    });
});
exports.deleteAnalysisPreSet = catchAsync(async (req, res, next) => {
    const analysispreSet = await analysisPreSet.findByPk(req.params.id);
    if (!analysispreSet) {
        return next(new AppError('No analysis preset found with that ID', 404));
    }
    // delete old analysisPreSetItems
    await analysisPreSetItem.destroy({
        where: {
            analysisPreSetId: analysispreSet.id
        }
        
    });
    await analysispreSet.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
});
