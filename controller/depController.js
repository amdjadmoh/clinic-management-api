const Dep=require('../models/Dep');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

exports.searchDep = catchAsync(async (req, res, next) => {
    const deps = await Dep.findAll({
        where: {
           depName:{ [Op.iLike]: `%${req.query.name}%`},
        },
    });
    res.status(200).json({
        status: 'success',
        data: {
        deps,
        },
    });
    }
);
exports.getAllDeps = catchAsync(async (req, res, next) => {
    const deps = await Dep.findAll();
    res.status(200).json({
        status: 'success',
        data: {
        deps,
        },
    });
    }
);

exports.getDep = catchAsync(async (req, res, next) => {

    const dep = await Dep.findByPk(req.params.id);
    if (!dep) {
        return next(new AppError('Department not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
        dep,
        },
    });
    }
);

exports.createDep= catchAsync(
    async (req,res,next)=>{
        const newDep= await Dep.create(req.body);
        res.status(201).json({
            status:'success',
            data:{
                dep:newDep,
            },
        });
    }
);

exports.updateDep= catchAsync(
    async (req,res,next)=>{
        const dep= await Dep.findByPk(req.params.id);
        if(!dep){
            return next(new AppError('Department not found',404));
        }
        const updatedDep= await dep.update(req.body);
        res.status(200).json({
            status:'success',
            data:{
                dep:updatedDep,
            },
        });
    }
);

exports.deleteDep= catchAsync(
    async (req,res,next)=>{
        const dep = await Dep.findByPk(req.params.id);
        if(!dep){
            return next(new AppError('Department not found',404));
        }
        await dep.destroy();
        res.status(200).json({
            status:'success',
            data:null,
        });
    }
);

exports.getDepProcedures= catchAsync(
    async (req,res,next)=>{
        const dep = await Dep.findByPk(req.params.id);
        if(!dep){
            return next(new AppError('Department not found',404));
        }
        const procedures= await dep.getPredefinedprocedure();
        res.status(200).json({
            status:'success',
            data:{
                procedures,
            },
        });
    }
);

exports.addDepProcedure= catchAsync(
    async (req,res,next)=>{
        const dep = await Dep.findByPk(req.params.id);
        if(!dep){
            return next(new AppError('Department not found',404));
        }
        dep.defaultProcedure=req.body.defaultProcedureID;
        await dep.save();

        res.status(200).json({
            status:'success',
            data:dep
        });
    }
);

exports.removeDepProcedure= catchAsync(
    async (req,res,next)=>{
        const dep = await Dep.findByPk(req.params.id);
        if(!dep){
            return next(new AppError('Department not found',404));
        }
        await dep.removePreDefinedProcedure(req.body.procedureId);
        res.status(200).json({
            status:'success',
            data:null,
        });
    }
);


