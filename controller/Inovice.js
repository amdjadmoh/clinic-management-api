const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Patient = require('../models/Patient');
const {InvoiceProcedure,InvoiceResult,Invoice} = require('../models/Invoice');
const { Op } = require('sequelize');
exports.getAllInvoices = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.findAll();
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
}
);

exports.getInvoice = catchAsync(async (req, res, next) => {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        return next(new appError('No invoice found with that ID', 404));
    };

    const procedures= await InvoiceProcedure.findAll({
        where:{
            invoiceID: req.params.id,
        }
    });
    const results= await InvoiceResult.findAll({
        where:{
            invoiceID: req.params.id,
        }
    });
    results2= results.map(result=>{
        return {
            id: result.id,
            InvoiceID: result.invoiceID,
            resultTypeID: result.resultTypeID,
            procedureName : result.resultName,
            description: result.resultDescription,
            cost: result.resultPrice,
            quantity: result.quantity,
        }
    }
    );

    const combinedItems = [...procedures, ...results2];
    res.status(200).json({
        status: 'success',
        data: {
            invoice: {
                ...invoice.toJSON(),
                predefinedprocedures: combinedItems
            }
        }
    });
}
);


exports.createInvoice = catchAsync(async (req, res, next) => {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            invoice
        }
    });
}
);

exports.updateInvoice = catchAsync(async (req, res, next) => {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        return next(new appError('No invoice found with that ID', 404));
    }
    await invoice.update(req.body);
    res.status(200).json({
        status: 'success',
        data: {
            invoice
        }
    });
}
);


exports.deleteInvoice = catchAsync(async (req, res, next) => {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) {
        return next(new appError('No invoice found with that ID', 404));
    }
    await invoice.destroy();
    res.status(204).json({
        status: 'success',
        data: null
    });
}
);

exports.getPatientInvoices = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.findAll({
        where: {
            patientID: req.params.patientID
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
}
);

exports.getPatientPendingInvoices = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.findAll({
        where: {
            patientID: req.params.patientID,
            invoiceStatus: 'unpaid'
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
}
);

exports.getPendingInvoices= catchAsync (async (req, res, next) => {
    const invoices = await Invoice.findAll({
        where: {
            invoiceStatus: 'unpaid'
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.getPaidInvoices= catchAsync(async (req, res, next) => {
    const invoices = await Invoice.findAll({
        where: {
            invoiceStatus: 'paid'
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
}
);

exports.getPaidInvoicesbyDate = catchAsync(async (req, res, next) => {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const invoices = await Invoice.findAll({
        where: {
            invoiceStatus: 'paid',
            paimentDate: {
                [Op.between]: [startOfDay, endOfDay]
            }
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.searchInvoiceByName= catchAsync( async (req,res,next)=>{
    const invoices = await Invoice.scope('defaultScope').findAll({
        where:{
            invoiceStatus:req.query.status
        },
        include:[{model:Patient,
        where:{
            name:{[Op.iLike]: `%${req.query.name}%`},
        }
    }]
    })
    res.status(200).json({
        status:'success',
        data:{
            invoices
        }   
    })
}
);


exports.searchPaidInvoicesByDateRange = catchAsync(async (req, res, next) => {
    const { startDate, endDate} = req.query;

    if (new Date(startDate) > new Date(endDate)) {
        return next(new appError('Start date must be before end date', 400));
    }

    const invoices = await Invoice.findAll({
        where: {
            paimentDate: {
                [Op.gte]: new Date(startDate).toISOString(),
                [Op.lte]: new Date(endDate).toISOString()
            },
            invoiceStatus: 'paid',
        },
    });

    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.getPendingInvoicesByType = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.findAll({
        where: {
            invoiceStatus: 'unpaid',
            type: req.query.type // Filter by type
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.getPaidInvoicesByType = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.findAll({
        where: {
            invoiceStatus: 'paid',
            type: req.query.type // Filter by type
        }
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.getPaidInvoicesByDateByType = catchAsync(async (req, res, next) => {
    const date = new Date(req.params.date);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const invoices = await Invoice.findAll({
        where: {
            invoiceStatus: 'paid',
            paimentDate: {
                [Op.between]: [startOfDay, endOfDay]
            },
            type: req.query.type // Filter by type
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.searchInvoiceByNameByType = catchAsync(async (req, res, next) => {
    const invoices = await Invoice.scope('defaultScope').findAll({
        where: {
            invoiceStatus: req.query.status,
            type: req.query.type // Filter by type
        },
        include: [{
            model: Patient,
            where: {
                name: { [Op.iLike]: `%${req.query.name}%` },
            }
        }]
    });
    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

exports.searchPaidInvoicesByDateRangeByType = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (new Date(startDate) > new Date(endDate)) {
        return next(new appError('Start date must be before end date', 400));
    }

    const invoices = await Invoice.findAll({
        where: {
            paimentDate: {
                [Op.gte]: new Date(startDate).toISOString(),
                [Op.lte]: new Date(endDate).toISOString()
            },
            invoiceStatus: 'paid',
            type: req.query.type // Filter by type
        }
    });

    res.status(200).json({
        status: 'success',
        data: {
            invoices
        }
    });
});

// Get detailed paid invoices by date range with procedures
exports.getDetailedPaidInvoicesByDateRange = catchAsync(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (new Date(startDate) > new Date(endDate)) {
        return next(new appError('Start date must be before end date', 400));
    }

    // First get all invoices within the date range
    const invoices = await Invoice.findAll({
        where: {
            paimentDate: {
                [Op.gte]: new Date(startDate).toISOString(),
                [Op.lte]: new Date(endDate).toISOString()
            },
            invoiceStatus: 'paid',
        }
    });    // Get details for each invoice
    const detailedInvoices = await Promise.all(invoices.map(async (invoice) => {

        const procedures = await InvoiceProcedure.findAll({
            where: {
                invoiceID: invoice.invoiceId
            }
        });
        
        // Combine procedures and results
        const items = [...procedures];
        
        // Calculate total amount from items for verification
        const calculatedTotal = items.reduce((sum, item) => {
            return sum + (parseFloat(item.cost || 0) * (parseInt(item.quantity || 1)));
        }, 0);
        
        return {
            ...invoice.toJSON(),
            items: items,
        };
    }));

    res.status(200).json({
        status: 'success',
        results: detailedInvoices.length,
        data: {
            invoices: detailedInvoices
        }
    });
});



