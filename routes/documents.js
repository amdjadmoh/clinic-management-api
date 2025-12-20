const express = require('express');
const router = express.Router();
const documentsController = require('../controller/Documents');

// Consent Certificate routes
router.get('/consent-certificate/year/:year', documentsController.getAllConsentCertificatesByYear);
router.get('/consent-certificate/:id', documentsController.getConsentCertificateById);
router.post('/consent-certificate', documentsController.createConsentCertificate);

// Birth Notice routes
router.get('/birth-notice/year/:year', documentsController.getAllBirthNoticesByYear);
router.get('/birth-notice/:id', documentsController.getBirthNoticeById);
router.post('/birth-notice', documentsController.createBirthNotice);

// Birth Declaration routes
// router.post('/birth-declaration/byBirthNoticeID/:id', documentsController.createBirthDeclarationByNoticeID);
router.get('/birth-declaration/year/:year', documentsController.getAllBirthDeclarationsByYear);
router.get('/birth-declaration/:id', documentsController.getBirthDeclarationById);
router.post('/birth-declaration', documentsController.createBirthDeclaration);

// Operation Cost Declaration routes
router.get('/operation-cost-declaration/year/:year', documentsController.getAllOperationCostDeclarationsByYear);
router.get('/operation-cost-declaration/:id', documentsController.getOperationCostDeclarationById);
router.post('/operation-cost-declaration', documentsController.createOperationCostDeclaration);

module.exports = router;