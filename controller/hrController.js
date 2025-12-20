const dep = require('../models/Dep');
const queue = require('../models/Queue');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { Op } = require('sequelize');

exports.getVisitsPerDepInDateRange= catchAsync (async(req,res,next)=>{
    const visits= await queue.findAll({
        where:{
            date :{
                [Op.between]:[req.query.startDate,req.query.endDate]
            },
            status:req.query.status
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
    const oldVisits= await queue.findAll({
        where:{
            date :{
                [Op.between]:[req.query.oldStartDate,req.query.oldEndDate]
            },
            status:req.query.status
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