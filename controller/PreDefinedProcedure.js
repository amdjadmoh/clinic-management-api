const PreDefinedProcedure = require('../models/PreDefinedProcedure');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Op } = require('sequelize');

exports.getAllPreDefinedProcedures = catchAsync(async (req, res, next) => {
    const preDefinedProcedures = await PreDefinedProcedure.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            preDefinedProcedures
        }
    });
}
);

exports.getPreDefinedProcedure = catchAsync(async (req, res, next) => {
    const preDefinedProcedure = await PreDefinedProcedure.findByPk(req.params.id);
    if (!preDefinedProcedure) {
        return next(new AppError('No preDefinedProcedure found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            preDefinedProcedure
        }
    });
}
);

exports.createPreDefinedProcedure = catchAsync(async (req, res, next) => {
    if (!req.body.type) {
        return next(new AppError('You must specify the type of the Procedure', 400));
    }
    if (req.body.cost>req.body.maxCost){
        return next(new AppError('Cost must be less than maxCost', 400));
    }

    const preDefinedProcedure = await PreDefinedProcedure.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            preDefinedProcedure
        }
    });
}
);

exports.updatePreDefinedProcedure = catchAsync(async (req, res, next) => {
    const preDefinedProcedure = await PreDefinedProcedure.findByPk(req.params.id);
    if (!preDefinedProcedure) {
        return next(new AppError('No preDefinedProcedure found with that ID', 404));
    }
    await preDefinedProcedure.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            preDefinedProcedure
        }
    });
}
);

exports.deletePreDefinedProcedure = catchAsync(async (req, res, next) => {
    const preDefinedProcedure = await PreDefinedProcedure.findByPk(req.params.id);
    if (!preDefinedProcedure) {
        return next(new AppError('No preDefinedProcedure found with that ID', 404));
    }
    await preDefinedProcedure.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);

exports.searchPreDefinedProcedure = catchAsync(async (req, res, next) => {
    const preDefinedProcedures = await PreDefinedProcedure.findAll({
        where: {
            procedureName: {
                [Op.iLike]: `%${req.query.procedureName}%`
            }
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            preDefinedProcedures
        }
    });
});

exports.getAllPreDefinedProceduresByType = catchAsync(async (req, res, next) => {
    const preDefinedProcedures = await PreDefinedProcedure.findAll({
        where: {
            type: req.query.type
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            preDefinedProcedures
        }
    });
});

exports.searchPreDefinedProcedureByType = catchAsync(async (req, res, next) => {
    const preDefinedProcedures = await PreDefinedProcedure.findAll({
        where: {
            procedureName: {
                [Op.iLike]: `%${req.query.procedureName}%`
            },
            type: req.query.type 
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            preDefinedProcedures
        }
    });
});