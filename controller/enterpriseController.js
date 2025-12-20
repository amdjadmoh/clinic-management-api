const Enterprise = require('../models/Enterprise');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllEnterprises = catchAsync(async (req, res, next) => {
    const enterprises = await Enterprise.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            enterprises
        }
    });
}
);

exports.getEnterprise = catchAsync(async (req, res, next) => {
    const enterprise = await Enterprise.findByPk(req.params.id);
    if (!enterprise) return next(new appError('No enterprise found with that ID', 404));
    res.status(200).json({
        status: 'success',
        data: {
            enterprise
        }
    });
}
);

exports.createEnterprise = catchAsync(async (req, res, next) => {
    const enterprise = await Enterprise.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            enterprise
        }
    });
}
);

exports.updateEnterprise = catchAsync(async (req, res, next) => {
    const enterprise = await Enterprise.findByPk(req.params.id);
    if (!enterprise) return next(new appError('No enterprise found with that ID', 404));
    await enterprise.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            enterprise
        }
    });
}
);

exports.deleteEnterprise = catchAsync(async (req, res, next) => {
    const enterprise = await Enterprise.findByPk(req.params.id);
    if (!enterprise) return next(new appError('No enterprise found with that ID', 404));
    await enterprise.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);



