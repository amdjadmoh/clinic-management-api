const db = require('../config/database');
const { Sequelize } = require('sequelize');
const { Drug, DrugType,DrugModifaction } = require('../models/Drug');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const DrugHistory = require('../models/DrugHistory');
const { Op } = require('sequelize');

// Get all drugs

exports.getAllDrugs = catchAsync(async (req, res, next) => {
    const drugs = await Drug.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            drugs
        }
    });
});

// Get a drug by ID

exports.getDrug= catchAsync(async (req, res, next) => {
    const drug = await Drug.findByPk(req.params.id);
    if (!drug) {
        return next(new appError('No drug found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            drug
        }
    });
}
);

// Create a drug

exports.createDrug = catchAsync(async (req, res, next) => {
    const newDrug = await Drug.create({
        ...req.body
    });
    if (newDrug){
    const newDrugModifaction = await DrugModifaction.create({
        drugID: newDrug.id,
        quantityChange: req.body.quantity,
        reason: 'Creation',
        person: req.body.person,
        date: new Date(),
    });
    }
    res.status(201).json({
        status: 'success',
        data: {
            newDrug
        }
    });
}
);

// Update a drug

exports.updateDrug = catchAsync(async (req, res, next) => {
    const drug = await Drug.findByPk(req.params.id);
    if (!drug) {
        return next(new appError('No drug found with that ID', 404));
    }
    const change = req.body.quantity - drug.quantity;
    const newDrugModifaction = await DrugModifaction.create({
        drugID: drug.id,
        quantityChange: change,
        reason: 'Mise a jour',
        person: req.body.person,
        date: new Date(),
    });
    await drug.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            drug
        }
    });
}
);

// Delete a drug

exports.deleteDrug = catchAsync(async (req, res, next) => {
    const drug = await Drug.findByPk(req.params.id);

    if (!drug) {
        return next(new appError('No drug found with that ID', 404));
    }
    // check if the drug is used in any drug history
    const drugHistory = await DrugHistory.findOne({
        where: {
            drugID: drug.id
        }
    });
    if (drugHistory) {
        // archive the drug instead of deleting it
        drug.archived = true;
        await drug.save();
        return res.status(200).json({
            status: 'success',
            data: {
                drug
            }
        });
    }

    await drug.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);
exports.getDrugBySerialNumber= catchAsync(async (req,res,next)=>{
    const drug = await Drug.findOne({
        where:{
            serialNumber:req.params.serialNumber
        }
    });
    if (!drug) {
        return next(new appError('No drug found with that serial number', 404));
    }
    res.status(200).json({
        status:'success',
        data:{
            drug
        }
    });
}
);
exports.searchDrugsByDrugTypeNameAndDrugTypeType= catchAsync(async (req,res,next)=>{
    const {drugName,type}=req.query;
    const drugs = await Drug.findAll ({
        include: [
            {
                model: DrugType,
                where :{
                    name:{
                        [Op.iLike]: `%${drugName}%`
                    },
                    type:type
                }
            }
        ]
    })
    // Order by expiryDate
    drugs.sort((a,b)=>{
        if (a.expiryDate > b.expiryDate){
            return 1;
        }
        if (a.expiryDate < b.expiryDate){
            return -1;
        }
        return 0;
    });
    res.status(200).json({
        status:'success',
        data:{
            drugs
        }
    });
}
);


exports.searchDrugsBySerialNumberAndDrugTypeType = catchAsync(async (req,res,next)=>{
    const drugs = await Drug.findAll({
        where:{
            serialNumber:{
                [Op.iLike]: `${req.query.serialNumber}%`
            }
        },
        include:[
            {
                model:DrugType,
                where:{
                    type:req.query.type
                }
            }
        ]
    });
    res.status(200).json({
        status:'success',
        data:{
            drugs
        }
    });
}
);


// Get all drug types

exports.getAllDrugTypes = catchAsync(async (req, res, next) => {
    const drugTypes = await DrugType.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            drugTypes
        }
    });
}
);

// Get a drug type by ID

exports.getDrugType = catchAsync(async (req, res, next) => {
    const drugType = await DrugType.findByPk(req.params.id);
    if (!drugType) {
        return next(new appError('No drug type found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            drugType
        }
    });
}
);

// Create a drug type

exports.createDrugType = catchAsync(async (req, res, next) => {
    const newDrugType = await DrugType.create({
        ...req.body
    });
    res.status(201).json({
        status: 'success',
        data: {
            newDrugType
        }
    });
}
);

// Update a drug type

exports.updateDrugType = catchAsync(async (req, res, next) => {

    const drugType = await DrugType.findByPk(req.params.id);
    if (!drugType) {
        return next(new appError('No drug type found with that ID', 404));
    }
    await drugType.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            drugType
        }
    });
}
);

// Delete a drug type

exports.deleteDrugType = catchAsync(async (req, res, next) => {
    const drugType = await DrugType.findByPk(req.params.id);
    if (!drugType) {
        return next(new appError('No drug type found with that ID', 404));
    }
    await drugType.destroy();
    res.status(200).json({
        status: 'success',
        data: null
    });
}
);

exports.searchDrugTypeByNameAndType= catchAsync(async (req,res,next)=>{
    const drugTypes = await DrugType.findAll({
        where:{
            name:{
                [Op.iLike]: `%${req.query.name}%`
            },
            type:req.query.type
        }
    });
    res.status(200).json({
        status:'success',
        data:{
            drugTypes
        }
    });
}
);

exports.getDrugTypeBySerialNumber= catchAsync(async (req,res,next)=>{
    const drugType = await DrugType.findOne({
        where:{
            serialNumber:req.params.serialNumber
        }
    });
    if (!drugType) {
        return next(new appError('No drug type found with that serial number', 404));
    }
    res.status(200).json({
        status:'success',
        data:{
            drugType
        }
    });
}
);


// Get all drugs of a particular type

exports.getDrugsofType= catchAsync(async (req,res,next)=>{
    const drugs = await Drug.findAll({
        where:{
            drugTypeID:req.params.id
        }
    });
    res.status(200).json({
        status:'success',
        data:{
            drugs
        }
    });
});

// take drugs

exports.takeDrug = catchAsync(async (req, res, next) => {
    const drug = await Drug.findByPk(req.params.id);
    if (!drug) {
        return next(new appError('No drug found with that ID', 404));
    }
    if (drug.quantity < req.body.quantity) {
        return next(new appError('Not enough quantity available', 400));
    }
    drug.quantity -= req.body.quantity;
    const newDrugModifaction = await DrugModifaction.create({
        drugID: drug.id,
        quantityChange: -req.body.quantity,
        reason: 'Take',
        person: req.body.personPharmacie,
        date: new Date(),
    });
    await drug.save();
    await DrugHistory.create({
        drugID: drug.drugTypeID,
        drugID2:drug.id,
        quantity: req.body.quantity,
        date: req.body.date,
        person: req.body.person,
        service: req.body.service,
        subService: req.body.subService
    });
    res.status(200).json({
        status: 'success',
        data: {
            drug
        }
    });
}
);

exports.returnDrug = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findByPk(req.params.id);
    if (!drugHistory) {
        return next(new appError('No drug history found with that ID', 404));
    }
    const drug = await Drug.findByPk(drugHistory.drugID2);
    if (!drug) {
        return next(new appError('The origin stock of this drug not found', 404));
    }
    if (req.body.quantity){
        if (drugHistory.quantity < req.body.quantity) {
            return next(new appError('Not enough quantity available', 400));
        }
        drug.quantity += req.body.quantity;
        drugHistory.quantity -= req.body.quantity;
        const newDrugModifaction = await DrugModifaction.create({
            drugID: drug.id,
            quantityChange: req.body.quantity,
            reason: 'Return',
            person: req.body.personPharmacie,
            date: new Date(),
        });
        await drug.save();
        await drugHistory.save();
        return res.status(200).json({
            status: 'success',
            data: {
                drug
            }
        });
    }
    drug.quantity += drugHistory.quantity;
    const newDrugModifaction = await DrugModifaction.create({
        drugID: drug.id,
        quantityChange: req.body.quantity,
        reason: 'Return',
        person: req.body.personPharmacie,
        date: new Date(),
    });
    await drug.save();
    drugHistory.quantity = 0;
    await drugHistory.save();

    res.status(200).json({
        status: 'success',
        data: {
            drug
        }
    });
}
);

exports.searchDrugHistoryByDateByDrugTypeNameType = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            date: req.query.date,
            service: {
                [Op.like]: `%${req.query.service}%`
            }
        },
            include: [
                {
                    model: DrugType,
                    where: {
                        name: {
                            [Op.iLike]: `%${req.query.name}%`
                        },
                        type: req.query.type
                    }
                },
                {
                    model: Drug,
                    attributes: ['quantity'],
                }
            ],
        
    


    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistory
        }
    });
}
);

exports.getDrugHistoryByDate = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            date: req.params.date
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistory
        }
    });
}
);
exports.getDrugHistoryByDrugType = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            drugID: req.params.id
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistory
        }
    });
}
);

exports.getDrugHistoryByDrugTypeAndDate = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            drugID: req.params.id,
            date: req.params.date
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistory
        }
    });
}
);
exports.getSumOfDrugHistoryPerTypeAndDate = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            date: req.params.date
        }
    });
    const drugHistoryPerDrugType = [];
    drugHistory.forEach((element)=>{
        if (element.drugType.type===req.params.type){
        let found = false;
        drugHistoryPerDrugType.forEach((element2)=>{
            if (element.drugID === element2.typeID){
                element2.quantity += element.quantity;
                found = true;
                return;
            }
        }
        );
        if (!found){
        drugHistoryPerDrugType.push({
            typeID:element.drugType.id,
            name:element.drugType.name,
            quantity:element.quantity
        });
    }
    }

    })
    res.status(200).json({
        status:"sucess",
        data :{
            drugHistoryPerDrugType
        }
    })

});



exports.searchByServiceAndDate = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            date: req.params.date,
            service: {
                [Op.like]: `%${req.query.service}%`
            }
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistory
        }
    });
});
exports.searchByNameAndDate = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findAll({
        where: {
            date: req.params.date,
            person: {
                [Op.like]: `%${req.query.person}%`
            }
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistory
        }
    });
}
);

const DrugHistoryDetails = require('../models/DrugHistoryDetails');
const { now } = require('moment-timezone');

exports.addDrugHistoryDetails = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findByPk(req.params.id);
    if (!drugHistory) {
        return next(new appError('No drug history found with that ID', 404));
    };
    if (drugHistory.quantity < req.body.quantity) {
        return next(new appError('Not enough quantity available', 400));
    }
    drugHistory.quantity -= req.body.quantity;
    drugHistory.usedQuantity += req.body.quantity;
    await drugHistory.save();
    const newDrugHistoryDetails = await DrugHistoryDetails.create({
        drugHistoryID: req.params.id,
        quantity: req.body.quantity,
        patientName: req.body.patientName
    });
    res.status(201).json({
        status: 'success',
        data: {
            newDrugHistoryDetails
        }
    });
}
);

exports.getDrugHistoryDetailsByDrugHistory = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findByPk(req.params.id);
    if (!drugHistory) {
        return next(new appError('No drug history found with that ID', 404));
    };
    const drugHistoryDetails = await DrugHistoryDetails.findAll({
        where: {
            drugHistoryID: req.params.id
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugHistoryDetails
        }
    });
}
);
exports.deleteAllDrugHistoryDetails = catchAsync(async (req, res, next) => {
    const drugHistory = await DrugHistory.findByPk(req.params.id);
    if (!drugHistory) {
        return next(new appError('No drug history found with that ID', 404));
    };
    const drugHistoryDetails = await DrugHistoryDetails.findAll({
        where: {
            drugHistoryID: req.params.id
        }
    });

    drugHistoryDetails.forEach(async (element) => {
        drugHistory.quantity += element.quantity;
        drugHistory.usedQuantity -= element.quantity;
        await element.destroy();
    });
    await drugHistory.save();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);

exports.deleteDrugHistoryDetails = catchAsync(async (req, res, next) => {
    const drugHistoryDetails = await DrugHistoryDetails.findByPk(req.params.id);
    if (!drugHistoryDetails) {
        return next(new appError('No drug history details found with that ID', 404));
    }
    const drugHistory = await DrugHistory.findByPk(drugHistoryDetails.drugHistoryID);
    drugHistory.quantity += drugHistoryDetails.quantity;
    drugHistory.usedQuantity -= drugHistoryDetails.quantity;
    await drugHistory.save();
    await drugHistoryDetails.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);

exports.getTotalQuantityOfEachDrugType = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const drugTypes = await DrugType.findAll({
        include:{
            model:Drug
        }
    });

    const totalQuantities = drugTypes.map(drugType => ({
        drugTypeId: drugType.id,
        drugTypeName: drugType.name,
        totalQuantity: drugType.drugs.reduce((sum, drug) => sum + drug.quantity, 0)
    }));

    res.status(200).json({
        status: 'success',
        data: {
            totalQuantities
        }
    });
});

exports.getMostUsedDrugs = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const drugTypes = await DrugType.findAll({
        include: {
            model: DrugHistory,
            attributes: ['quantity'],
            where: {
                date: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            }
        }
    });
    const mostUsedDrugs = drugTypes.map(drugType => ({
        drugTypeId: drugType.id,
        drugTypeName: drugType.name,
        totalUsed: drugType.drugHistories.reduce((sum, history) => sum + history.quantity, 0)
    }));
    mostUsedDrugs.sort((a, b) => b.totalUsed - a.totalUsed);
    res.status(200).json({
        status: 'success',
        data: {
            mostUsedDrugs
        }
    });
});



exports.getDrugsNearExpiry = catchAsync(async (req, res, next) => {
    const drugs = await Drug.findAll({
        where: {
            expiryDate: {
                [Op.lte]: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Expiry within the next month
            },
            quantity: {
                [Op.gt]: 0
            }
        },
        include: {
            model: DrugType,
            attributes: ['name']
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            drugs
        }
    });
});
exports.getDrugUsageTrends = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const drugHistories = await DrugHistory.findAll({
        attributes: [
            [Sequelize.fn('date_trunc', 'month', Sequelize.col('date')), 'month'],
            [Sequelize.fn('sum', Sequelize.col('quantity')), 'totalUsed'],
            'drugID'
        ],
        group: [
            [Sequelize.fn('date_trunc', 'month', Sequelize.col('date'))],
            'drugID','drugType.id',
        ],
        order: [[Sequelize.fn('date_trunc', 'month', Sequelize.col('date')), 'ASC']],
        where: {
            date: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            }
        },
        include: {
                model: DrugType,
                attributes: ['name']
        }
    });

    const usageTrends = drugHistories.map(history => ({
        month: new Date(history.dataValues.month).getMonth() + 1,
        totalUsed: history.dataValues.totalUsed,
        drugTypeName: history.drugType.name
    }));

    res.status(200).json({
        status: 'success',
        data: {
            usageTrends
        }
    });
});

exports.getDrugModifications = catchAsync(async (req, res, next) => {
    const drugModifications = await DrugModifaction.findAll({
        where: {
            drugID: req.params.id
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugModifications
        }
    });
}
);

exports.getAllDrugModifcations= catchAsync(async (req,res,next)=>{
    const drugModifications = await DrugModifaction.findAll({
        include: {
            model: Drug        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            drugModifications
        }
    });
}       
);