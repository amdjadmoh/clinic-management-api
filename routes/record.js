const router = require('express').Router();
const recordController = require('../controller/recordController');

router.route('/')
    .get(recordController.getAllRecords)
    .post(recordController.createRecord);
router.route('/byPatient/:id')
    .get(recordController.getRecordByPatient);    
router.route('/:id')
    .get(recordController.getRecord)
    .patch(recordController.updateRecord)
    .delete(recordController.deleteRecord);
        
module.exports = router;