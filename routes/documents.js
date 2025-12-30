const express = require('express');
const router = express.Router();
const documentsController = require('../controller/Documents');

// Consent Certificate routes
router.get('/consent-certificate/year/:year', documentsController.getAllConsentCertificatesByYear);
router.get('/consent-certificate/:id', documentsController.getConsentCertificateById);
router.post('/consent-certificate', documentsController.createConsentCertificate);
router.patch('/consent-certificate/:id', documentsController.updateConsentCertificate);
router.delete('/consent-certificate/:id', documentsController.deleteConsentCertificate);

// Birth Notice routes
router.get('/birth-notice/year/:year', documentsController.getAllBirthNoticesByYear);
router.get('/birth-notice/:id', documentsController.getBirthNoticeById);
router.post('/birth-notice', documentsController.createBirthNotice);
router.patch('/birth-notice/:id', documentsController.updateBirthNotice);
router.delete('/birth-notice/:id', documentsController.deleteBirthNotice);

// Birth Declaration routes
router.get('/birth-declaration/year/:year', documentsController.getAllBirthDeclarationsByYear);
router.get('/birth-declaration/:id', documentsController.getBirthDeclarationById);
router.post('/birth-declaration', documentsController.createBirthDeclaration);
router.patch('/birth-declaration/:id', documentsController.updateBirthDeclaration);
router.delete('/birth-declaration/:id', documentsController.deleteBirthDeclaration);

// Operation Cost Declaration routes
router.get('/operation-cost-declaration/year/:year', documentsController.getAllOperationCostDeclarationsByYear);
router.get('/operation-cost-declaration/:id', documentsController.getOperationCostDeclarationById);
router.post('/operation-cost-declaration', documentsController.createOperationCostDeclaration);
router.patch('/operation-cost-declaration/:id', documentsController.updateOperationCostDeclaration);
router.delete('/operation-cost-declaration/:id', documentsController.deleteOperationCostDeclaration);

// Birth Certificate routes
router.get('/birth-certificate/year/:year', documentsController.getAllBirthCertificatesByYear);
router.get('/birth-certificate/:id', documentsController.getBirthCertificateById);
router.post('/birth-certificate', documentsController.createBirthCertificate);
router.patch('/birth-certificate/:id', documentsController.updateBirthCertificate);
router.delete('/birth-certificate/:id', documentsController.deleteBirthCertificate);

// Death Declaration routes
router.get('/death-declaration/year/:year', documentsController.getAllDeathDeclarationsByYear);
router.get('/death-declaration/:id', documentsController.getDeathDeclarationById);
router.post('/death-declaration', documentsController.createDeathDeclaration);
router.patch('/death-declaration/:id', documentsController.updateDeathDeclaration);
router.delete('/death-declaration/:id', documentsController.deleteDeathDeclaration);

// Hospital Stay Bulletin routes
router.get('/hospital-stay/year/:year', documentsController.getAllHospitalStayBulletinsByYear);
router.get('/hospital-stay/:id', documentsController.getHospitalStayBulletinById);
router.post('/hospital-stay', documentsController.createHospitalStayBulletin);
router.patch('/hospital-stay/:id', documentsController.updateHospitalStayBulletin);
router.delete('/hospital-stay/:id', documentsController.deleteHospitalStayBulletin);

module.exports = router;