const db = require('../config/database');
const sequelize = require('sequelize');


const Invoice = db.define('invoice',{
    invoiceId:{
        type:sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    invoiceAmount:{
        type:sequelize.FLOAT,
        defaultValue:0,
    },
    remise:{
        type:sequelize.FLOAT,
        defaultValue:0,
    },
    invoiceStatus:{
        type:sequelize.STRING,
        allowNull:false,
        defaultValue:'unpaid',
        allowedValues:['paid','unpaid'],
    },
    patientID:{
        type:sequelize.INTEGER,
        allowNull:false,
        references:{
            model:'patients',
            key:'id',
        }
    },
    paimentDate:{
        type:sequelize.DATE,
        allowNull:true,
    },
    paidAt:{
        type:sequelize.STRING,
        allowNull:true,
    },
    type:{
        type:sequelize.STRING,
        allowNull:false,
        defaultValue:'normal',
        },
    paidTo:{
        type:sequelize.STRING,
        allowNull:true,
    },
    atNight:{
        type:sequelize.BOOLEAN,
        allowNull:true,
        defaultValue:false,
    }
},{
    tableName:'invoices',
    timestamps:true,
});

const InvoiceProcedure = db.define(
    'InvoiceProcedure',
    {
      invoiceID: {
        type: sequelize.INTEGER,
        allowNull: false,
        references:{
            model:'invoices',
            key:'invoiceId',
        }
      },
      procedureID:{
        type: sequelize.INTEGER,
        allowNull: false,
      },
      procedureName:{
        type: sequelize.STRING,
        allowNull: false,
      },
      description:{
        type: sequelize.STRING,
        allowNull: true,
      },
      cost:{
        type:sequelize.INTEGER,
        allowNull:false,
    },
        quantity: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      date :{
        type:sequelize.DATE,
        allowNull:true,
    defaultValue:sequelize.NOW,},
      doctorId:{
        type:sequelize.INTEGER,
        allowNull:true,
        references:{
            model:'doctors',
            key:'id',
        }
      },
      doctorName:{
        type:sequelize.STRING,
        allowNull:true,
      }
    },
    { timestamps: false },
);



const InvoiceResult= db.define(
    'InvoiceResult',
    {
      invoiceID: {
        type: sequelize.INTEGER,
        allowNull: false,
        references:{
            model:'invoices',
            key:'invoiceId',
        }
      },
    resultTypeID: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
      resultName: {
        type: sequelize.STRING,
        allowNull: false
    },
    resultDescription: {
        type: sequelize.STRING,
        allowNull: true
    },
    resultPrice:{
        type: sequelize.FLOAT,
        allowNull: true
    },
        quantity: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      date :{
        type:sequelize.DATE,
        allowNull:true,
    defaultValue:sequelize.NOW,}
    },
    { timestamps: false },
);

Invoice.hasMany(InvoiceResult,{foreignKey:'invoiceID',onDelete:'CASCADE'});
InvoiceResult.belongsTo(Invoice,{foreignKey:'invoiceID'});
Invoice.hasMany(InvoiceProcedure,{foreignKey:'invoiceID',onDelete:'CASCADE'});
InvoiceProcedure.belongsTo(Invoice,{foreignKey:'invoiceID'});

async function updateInvoiceAmount(invoiceID){
    const invoice = await Invoice.findByPk(invoiceID);
    
    // Skip if invoice doesn't exist (might have been deleted)
    if (!invoice) {
        console.log(`Skipping update for non-existent invoice ID: ${invoiceID}`);
        return;
    }
    
    const results = await InvoiceResult.findAll({where:{invoiceID:invoiceID}});
    const procedures = await InvoiceProcedure.findAll({where:{invoiceID:invoiceID}});
    let amount = 0;
    
    for(let i=0;i<results.length;i++){
        amount += Number(Number(results[i].resultPrice) * Number(results[i].quantity));
    }
    for(let i=0;i<procedures.length;i++){
        amount += Number(Number(procedures[i].cost) * Number(procedures[i].quantity));
    }
    
    await invoice.update({invoiceAmount:amount});
}

InvoiceProcedure.afterCreate(async (invoiceProcedure) => {
    await updateInvoiceAmount(invoiceProcedure.invoiceID);
});

InvoiceProcedure.afterUpdate(async (invoiceProcedure) => {
    await updateInvoiceAmount(invoiceProcedure.invoiceID);
});

InvoiceProcedure.afterDestroy(async (invoiceProcedure) => {
    await updateInvoiceAmount(invoiceProcedure.invoiceID);
});

InvoiceResult.afterCreate(async (invoiceResult) => {
    await updateInvoiceAmount(invoiceResult.invoiceID);
});

InvoiceResult.afterUpdate(async (invoiceResult) => {
    await updateInvoiceAmount(invoiceResult.invoiceID);
});

InvoiceResult.afterDestroy(async (invoiceResult) => {
    await updateInvoiceAmount(invoiceResult.invoiceID);
});



module.exports = {  InvoiceProcedure , InvoiceResult,Invoice};