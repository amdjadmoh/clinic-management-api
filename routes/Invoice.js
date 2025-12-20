const express = require('express');
const invoiceController = require('../controller/Inovice');

const router = express.Router();

router
    .route('/')
    .get(invoiceController.getAllInvoices)
    .post(invoiceController.createInvoice);


router
    .route('/pending')
    .get(invoiceController.getPendingInvoices);
router
    .route('/paid')
    .get(invoiceController.getPaidInvoices);    
router 
.route('/paidbydate/:date')
.get(invoiceController.getPaidInvoicesbyDate);    
router
    .route('/patient/:patientID')
    .get(invoiceController.getPatientInvoices);

router
    .route('/patient/:patientID/pending')
    .get(invoiceController.getPatientPendingInvoices);
router
.route('/searchByPatientName').get(invoiceController.searchInvoiceByName);
router
    .route('/getPaidInvoicesInPeriod')
    .get(invoiceController.searchPaidInvoicesByDateRange);    
router
    .route('/paidByType')
    .get(invoiceController.getPaidInvoicesByType);

router
    .route('/paidByDateByType/:date')
    .get(invoiceController.getPaidInvoicesByDateByType);

router
    .route('/pendingByType')
    .get(invoiceController.getPendingInvoicesByType);

router
    .route('/searchByPatientNameByType')
    .get(invoiceController.searchInvoiceByNameByType);

router
    .route('/getPaidInvoicesInPeriodByType')
    .get(invoiceController.searchPaidInvoicesByDateRangeByType);

router
    .route('/getDetailedPaidInvoicesInPeriod')
    .get(invoiceController.getDetailedPaidInvoicesByDateRange);
    
router
    .route('/:id')
    .get(invoiceController.getInvoice)
    .patch(invoiceController.updateInvoice)
    .delete(invoiceController.deleteInvoice);
module.exports = router;