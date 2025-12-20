const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Patient = require('../models/Patient');
const Queue = require('../models/Queue');
const sequelize = require('sequelize');
const Department = require('../models/Dep');
const { Op } = require('sequelize');
const DoctorWorkLog = require("../models/DoctorLog");
const Doctor = require("../models/Doctors");
const {Invoice} = require("../models/Invoice");
const {Result} = require("../models/Result");

exports.numberOfPatients = catchAsync(async (req, res, next) => {
    const patients = await Patient.findAll();
    const numberOfPatients = patients.length;
    res.status(200).json({
        status: 'success',
        data: {
            numberOfPatients
        }
    });
}
);

exports.numberOfVisitsInLastMonth = catchAsync(async (req, res, next) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const visits = await Queue.findAll({
        where: {
            createdAt: {
                [sequelize.Op.gte]: lastMonth
            },
        }
    });

    const numberOfVisits = visits.length;
    // compare to the month before
    const lastMonthBefore = new Date();
    lastMonthBefore.setMonth(lastMonth.getMonth() - 1);
    const visitsBefore = await Queue.findAll({
        where: {
            createdAt: {
                [sequelize.Op.gte]: lastMonthBefore,
                [sequelize.Op.lt]: lastMonth
            },

        }
    });
    const numberOfVisitsBefore = visitsBefore.length;
    const percentageChange = ((numberOfVisits - numberOfVisitsBefore) / numberOfVisitsBefore) * 100;


    res.status(200).json({
        status: 'success',
        data: {
            numberOfVisits,
            percentageChange
        }
    });
});

exports.numberOfVisitsByDepartmentInDateRange = catchAsync (async(req,res,next)=>{
    const visits= await Queue.findAll({
        where:{
            date :{
                [Op.between]:[req.query.startDate,req.query.endDate]
            }
        }
    })
    const visitsPerDep={};
    visits.forEach(visit=>{
        if (visitsPerDep[visit.depID]){
            visitsPerDep[visit.depID].visitsNumber+=1;
        }else{
            visitsPerDep[visit.depID]={
                depID:visit.depID,
                visitsNumber:1,
                depName:visit.dep.depName
            }
        } 
    })
    // add improvment percentage to the object
    const oldVisits= await Queue.findAll({
        where:{
            date :{
                [Op.between]:[req.query.oldStartDate,req.query.oldEndDate]
            }
        }
    })
    const oldVisitsPerDep={};
    oldVisits.forEach(visit=>{
        if (oldVisitsPerDep[visit.depID]){
            oldVisitsPerDep[visit.depID].visitsNumber+=1;
        }else{
            oldVisitsPerDep[visit.depID]={
                depID:visit.depID,
                visitsNumber:1,
                depName:visit.dep.depName
            }
        } 
    })
    for (const key in visitsPerDep) {
        if (oldVisitsPerDep[key]){
            visitsPerDep[key].improvementPercentage= ((visitsPerDep[key].visitsNumber-oldVisitsPerDep[key].visitsNumber)/oldVisitsPerDep[key].visitsNumber)*100;
        }else{
            visitsPerDep[key].improvementPercentage=100;
        }
    }
    
    res.status(200).json({
        status: 'success',
        data: {
        visitsPerDep,
        },
    });
})

exports.numberOfOperationsInLastMonth= catchAsync(async (req, res, next) => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    console.log(lastMonth);
    const operations = await DoctorWorkLog.findAll({
        where: {
            createdAt: {
                [sequelize.Op.gte]: lastMonth
            },
            procedureType: 'opération'
        }
    });
    const numberOfOperations = operations.length;
    // compare to the month before
    const lastMonthBefore = new Date();
    lastMonthBefore.setMonth(lastMonthBefore.getMonth() - 2);
    const operationsBefore = await DoctorWorkLog.findAll({
        where: {
            createdAt: {
                [sequelize.Op.gte]: lastMonthBefore,
                [sequelize.Op.lt]: lastMonth
            },
            procedureType: 'opération'
        }
    });
    const numberOfOperationsBefore = operationsBefore.length;
    const percentageChange = ((numberOfOperations - numberOfOperationsBefore) / numberOfOperationsBefore) * 100;
    res.status(200).json({
        status: 'success',
        data: {
            numberOfOperations,
            percentageChange
        }
    });
}
);

exports.listOfOperations = catchAsync(async (req, res, next) => {
    const operations = await DoctorWorkLog.findAll({
        where: {
            procedureType: 'opération'
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            operations
        }
    });
}
);

exports.totalRevenueInRangeCompared = catchAsync(async (req, res, next) => {
    const {startDate, endDate, oldStartDate, oldEndDate} = req.query;
    if (!startDate || !endDate || !oldStartDate || !oldEndDate) {
        return next(new AppError('Please provide startDate, endDate, oldStartDate and oldEndDate', 400));
    }
    if (new Date(startDate) > new Date(endDate)) {
        return next(new AppError('startDate must be less than endDate', 400));
    }
    if (new Date(oldStartDate) > new Date(oldEndDate)) {
        return next(new AppError('oldStartDate must be less than oldEndDate', 400));
    }
    const invoices = await Invoice.findAll({
        where: {
            paimentDate: {
                [Op.between]: [startDate, endDate]
            },
            invoiceStatus: 'paid'
        }
    });

    const Results = await Result.findAll({
        where: {
            submitDate: {
                [Op.between]: [startDate, endDate]
            },
            status: 'completed'
        }
    });
    const resultsRevenue = Results.reduce((acc, result) => acc + result.totalPrice , 0);
    const totalRevenue = invoices.reduce((acc, invoice) => acc + invoice.invoiceAmount - invoice.remise, 0) + resultsRevenue;
        const oldInvoices = await Invoice.findAll({
        where: {
            paimentDate: {
                [Op.between]: [oldStartDate, oldEndDate]
            },
            invoiceStatus: 'paid'
        },
        
    });
    const oldResults = await Result.findAll({
        where: {
            submitDate: {
                [Op.between]: [oldStartDate, oldEndDate]
            },
            status: 'completed'
        }
    });
    const oldResultsRevenue = oldResults.reduce((acc, result) => acc + result.totalPrice , 0);
    const oldTotalRevenue = oldInvoices.reduce((acc, invoice) => acc + invoice.invoiceAmount - invoice.remise, 0) + oldResultsRevenue;
    const percentageChange = ((totalRevenue - oldTotalRevenue) / oldTotalRevenue) * 100;
    res.status(200).json({
        status: 'success',
        data: {
            totalRevenue,
            percentageChange
        }
    });
}
);
