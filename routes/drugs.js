const drugController = require('../controller/drugController');
const express = require('express');
const router = express.Router();

router.route('/')
    .get(drugController.getAllDrugs)
    .post(drugController.createDrug);
router.route('/searchDrugByNameAndType')
    .get(drugController.searchDrugsByDrugTypeNameAndDrugTypeType);
router.route('/searchDrugBySerialNumberAndType')
    .get(drugController.searchDrugsBySerialNumberAndDrugTypeType);  
router.route('/getDrugBySerialNumber/:serialNumber')
    .get(drugController.getDrugBySerialNumber);    
router.route('/type')
    .get(drugController.getAllDrugTypes)
    .post(drugController.createDrugType);
router.route('/type/:id')
    .get(drugController.getDrugType)
    .patch(drugController.updateDrugType)
    .delete(drugController.deleteDrugType);
router.route('/typeBySerial/:serialNumber')
    .get(drugController.getDrugTypeBySerialNumber);
router.route('/getDrugByType/:id')
    .get(drugController.getDrugsofType);
router.route('/searchDrugType') 
    .get(drugController.searchDrugTypeByNameAndType);  

router.route('/takeDrug/:id')
    .patch(drugController.takeDrug);
router.route('/returnDrug/:id')    
.patch( drugController.returnDrug);
router.route('/drugHistory/searchDrugHistoryByNameDateType')
    .get(drugController.searchDrugHistoryByDateByDrugTypeNameType);
router.route('/drugHistory/PerDrugAndDateAndType/:date/:type')
    .get(drugController.getSumOfDrugHistoryPerTypeAndDate);       
router.route('/drugHistroy/byDrug/:id')
    .get(drugController.getDrugHistoryByDrugType);
router.route('/drugHistroy/byDate/:date')
    .get(drugController.getDrugHistoryByDate); 
router.route('/drugHistroy/byDateType/:date/:id')
    .get(drugController.getDrugHistoryByDrugTypeAndDate);
router.route('/drugHistroy/byServiceDate/:date')
    .get(drugController.searchByServiceAndDate);
router.route('/drugHistory/byPerson/:date')
    .get(drugController.searchByNameAndDate); 
router.route('/drugHistoryDetails/:id')
    .get(drugController.getDrugHistoryDetailsByDrugHistory)
    .post(drugController.addDrugHistoryDetails)
    .delete(drugController.deleteAllDrugHistoryDetails);
    
router.route('/drugHistoryDetailsbyID/:id')
.delete(drugController.deleteDrugHistoryDetails);
router.route('/statistics/totalQuantityOfEachDrugType')
    .get(drugController.getTotalQuantityOfEachDrugType);

router.route('/statistics/drugsNearExpiry')
    .get(drugController.getDrugsNearExpiry);

router.route('/statistics/mostUsedDrugs')
    .get(drugController.getMostUsedDrugs);

router.route('/statistics/drugUsageTrends')
    .get(drugController.getDrugUsageTrends);
router.route('/getDrugModifcations')
.get(drugController.getAllDrugModifcations);  
router.route('/getDrugModifications/:id')
    .get(drugController.getDrugModifications);    
router.route('/:id')
    .get(drugController.getDrug)     
    .patch(drugController.updateDrug)
    .delete(drugController.deleteDrug);
  

module.exports = router;