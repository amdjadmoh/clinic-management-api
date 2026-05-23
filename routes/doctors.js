const exporess=require('express');
const doctorsController=require('../controller/doctorsController');
const certificateController=require('../controller/certificateController');

const router=exporess.Router();

router
.route('/')
.get(doctorsController.getAllDoctors)
.post(doctorsController.createDoctor);
router 
.route('/search')
.get(doctorsController.searchDoctor);
router
    .route('/:doctorID/logs')
    .get(doctorsController.getDoctorLogs)
    .post(doctorsController.createLog);

router
    .route('/logs/:id')
    .get(doctorsController.getLog)
    .delete(doctorsController.deleteLog);

router
    .route('/:doctorID/logs/date-range')
    .get(doctorsController.getDoctorLogInDateRange);

router
    .route('/:doctorID/logs/date-range-by-proc')
    .get(doctorsController.getDoctorLogInDateRangeByProc);

router
    .route('/:doctorID/certificate-templates')
    .get(certificateController.getDoctorTemplates)
    .post(certificateController.upsertDoctorTemplate);

router
    .route('/:doctorID/certificate-templates/:certificateType')
    .get(certificateController.getDoctorTemplateByType);

router
.route('/:id')
.get(doctorsController.getDoctor)
.patch(doctorsController.updateDoctor)
.delete(doctorsController.deleteDoctor);

module.exports=router;
