const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Patient = require('../models/Patient');
const {InvoiceProcedure,InvoiceResult,Invoice} = require('../models/Invoice');
const PreDefinedProcedure = require('../models/PreDefinedProcedure');
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

    // Map procedures to include doctor info
    const proceduresWithDoctor = procedures.map(proc => ({
        ...proc.toJSON(),
        doctorId: proc.doctorId,
        doctorName: proc.doctorName,
    }));

    const combinedItems = [...proceduresWithDoctor, ...results2];
    
    // Get doctor info from procedures with their procedure names
    const doctorProceduresMap = {};
    procedures.filter(proc => proc.doctorId).forEach(proc => {
        if (!doctorProceduresMap[proc.doctorId]) {
            doctorProceduresMap[proc.doctorId] = {
                id: proc.doctorId,
                name: proc.doctorName,
                procedures: []
            };
        }
        doctorProceduresMap[proc.doctorId].procedures.push(proc.procedureName);
    });
    
    // Convert to array
    const doctors = Object.values(doctorProceduresMap);

    res.status(200).json({
        status: 'success',
        data: {
            invoice: {
                ...invoice.toJSON(),
                doctors: doctors,
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
    const { startDate, endDate, type, operationName, doctorId } = req.query;

    if (new Date(startDate) > new Date(endDate)) {
        return next(new appError('Start date must be before end date', 400));
    }

    // Build where clause with optional invoice type filter
    const whereClause = {
        paimentDate: {
            [Op.gte]: new Date(startDate).toISOString(),
            [Op.lte]: new Date(endDate).toISOString()
        },
        invoiceStatus: 'paid',
    };

    // Optional invoice type filter (operation or normal)
    if (type) {
        whereClause.type = type;
    }

    const invoices = await Invoice.findAll({
        where: whereClause,
    });

    // Get details for each invoice
    const detailedInvoices = await Promise.all(invoices.map(async (invoice) => {
        const procedures = await InvoiceProcedure.findAll({
            where: { invoiceID: invoice.invoiceId }
        });


        // Get procedure types from PreDefinedProcedure table
        const procedureIds = procedures.map(p => p.procedureID);
        const preDefinedProcedures = await PreDefinedProcedure.findAll({
            where: { id: procedureIds },
            attributes: ['id', 'type']
        });
        
        // Create a map of procedureID -> type
        const procedureTypeMap = {};
        preDefinedProcedures.forEach(p => {
            procedureTypeMap[p.id] = p.type;
        });

        let mainProcedureNames = [];
        let mainProcedureAmount = 0;
        let otherItemsAmount = 0;

        if (invoice.type === 'operation') {
            // For operation invoices: main procedures are of type "opération"
            const operationProcs = procedures.filter(proc => {
                const procType = procedureTypeMap[proc.procedureID];
                return procType && procType.toLowerCase() === 'opération';
            });            

            // Collect all operation names and sum their amounts
            operationProcs.forEach(proc => {
                mainProcedureNames.push(proc.procedureName);
                mainProcedureAmount += parseFloat(proc.cost || 0) * parseInt(proc.quantity || 1);
            });
            
            // Calculate other items (everything except the operation type)
            otherItemsAmount = procedures
                .filter(proc => {
                    const procType = procedureTypeMap[proc.procedureID];
                    return !procType || procType.toLowerCase() !== 'opération';
                })
                .reduce((sum, proc) => sum + (parseFloat(proc.cost || 0) * parseInt(proc.quantity || 1)), 0);
        } else {
            // For normal invoices: main procedures are consultation type
            const consultationProcs = procedures.filter(proc => {
                const procType = procedureTypeMap[proc.procedureID];
                return procType && procType === 'Consultation  normal';
            });
            
            // Collect all consultation names and sum their amounts
            consultationProcs.forEach(proc => {
                mainProcedureNames.push(proc.procedureName);
                mainProcedureAmount += parseFloat(proc.cost || 0) * parseInt(proc.quantity || 1);
            });
            
            // Calculate other items (everything except consultation types)
            otherItemsAmount = procedures
                .filter(proc => {
                    const procType = procedureTypeMap[proc.procedureID];
                    return !procType || procType !== 'Consultation  normal';
                })
                .reduce((sum, proc) => sum + (parseFloat(proc.cost || 0) * parseInt(proc.quantity || 1)), 0);
        }

       
        
        // Get doctor info from procedures with their procedure names
        const doctorProceduresMap = {};
        procedures.filter(proc => proc.doctorId).forEach(proc => {
            if (!doctorProceduresMap[proc.doctorId]) {
                doctorProceduresMap[proc.doctorId] = {
                    id: proc.doctorId,
                    name: proc.doctorName,
                    procedures: []
                };
            }
            doctorProceduresMap[proc.doctorId].procedures.push(proc.procedureName);
        });
        
        // Convert to array
        const doctors = Object.values(doctorProceduresMap);

        // Get patient details
        const patient = await Patient.findByPk(invoice.patientID);
        return {
            invoiceId: invoice.invoiceId,
            patientID: invoice.patientID,
            patient: patient,
            invoiceStatus: invoice.invoiceStatus,
            type: invoice.type,
            paimentDate: invoice.paimentDate,
            paidAt: invoice.paidAt,
            paidTo: invoice.paidTo,
            atNight: invoice.atNight,
            remise: invoice.remise,
            // Main procedure info (operation or consultation based on invoice type)
            mainProcedureNames: mainProcedureNames,
            mainProcedureAmount: mainProcedureAmount,
            // Other items amount
            otherItemsAmount: otherItemsAmount,
            // Total
            invoiceAmount: invoice.invoiceAmount,
            // Doctor info with procedures
            doctors: doctors,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
        };
    }));

    // Apply optional filters on the detailed invoices
    let filteredInvoices = detailedInvoices;

    // Filter by main procedure name (optional)
    if (operationName) {
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.mainProcedureNames && inv.mainProcedureNames.some(name => 
                name.toLowerCase().includes(operationName.toLowerCase())
            )
        );
    }

    // Filter by doctor ID (optional)
    if (doctorId) {
        const doctorIdNum = parseInt(doctorId);
        filteredInvoices = filteredInvoices.filter(inv => 
            inv.doctors.some(doc => doc.id === doctorIdNum)
        );
    }

    res.status(200).json({
        status: 'success',
        results: filteredInvoices.length,
        data: {
            invoices: filteredInvoices
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



