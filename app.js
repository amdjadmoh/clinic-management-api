const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const usersroutes = require('./routes/users');
const doctorsroutes = require('./routes/doctors');
const patientroutes = require('./routes/patient');
const deproutes=require('./routes/deps');
const queueroutes = require('./routes/queue');
const appointmentroutes = require('./routes/appointment');
const medicalRecordroutes = require('./routes/medicalRecord');
const prescriptionroutes = require('./routes/prescription');
const medicineRoutes = require('./routes/medicine');
const prescriptionDetailsRoutes=require('./routes/prescriptionDetails');
const globalErrorHandler = require('./controller/errorController');
const ChronicDiseasesRoutes = require('./routes/chronicDiseases');
const PreDefinedProcedureRoutes = require('./routes/PreDefinedProcedure');
const InvoiceRoutes = require('./routes/Invoice');
const ProcedureRoutes = require('./routes/patientProcedure');
const app = express();
const cors = require('cors');
const contactUsRouter = require('./routes/contactUs');
const drugRoutes = require('./routes/drugs');
const recordRoutes = require('./routes/record');
const enterpriseRoutes = require('./routes/enterprise');
const factureRoutes = require('./routes/facture');
const statsRoutes= require('./routes/stats');
const documentsRoutes = require('./routes/documents');
const filesRoutes = require('./routes/files');
const notificationsRoutes = require('./routes/notifications');


// enable cors for all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific HTTP methods
  allowedHeaders: 'Content-Type, Authorization' // Allow specific headers
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Database

const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));
// Handle all other routes by serving the frontend's index.html
app.get('/labo', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'), (err) => {
        if (err) {
            res.status(500).send('Error loading the frontend');
        }
    });
});
app.use('/users',usersroutes);
app.use('/doctors',doctorsroutes);
app.use('/dep',deproutes);
app.use('/patient',patientroutes);
app.use('/queue',queueroutes);
app.use('/appointment',appointmentroutes);
app.use('/medicalRecord',medicalRecordroutes);
app.use('/prescription',prescriptionroutes);
app.use('/medicine',medicineRoutes);
app.use('/prescriptionDetails',prescriptionDetailsRoutes);
app.use('/chronicDiseases', ChronicDiseasesRoutes);
app.use('/preDefinedProcedure', PreDefinedProcedureRoutes);  
app.use('/invoices', InvoiceRoutes);
app.use('/procedure',ProcedureRoutes);
app.use('/resultType',require('./routes/resultType'));
app.use('/result',require('./routes/results'));
app.use('/contact-us', contactUsRouter);
app.use('/drug', drugRoutes);
app.use('/hr', require('./routes/hr'));
app.use('/record', recordRoutes);
app.use('/enterprise', enterpriseRoutes);
app.use('/facture', factureRoutes);
app.use('/stats', statsRoutes);
app.use('/documents', documentsRoutes);
app.use('/files', filesRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/bloodTest', require('./routes/bloodTest'));
app.use('/laboPrices', require('./routes/laboPrices'));
const {notficationController} = require('./controller/notificationController');
// Send appointment notifications every hour
const cron = require('node-cron');
const notificationController = require('./controller/notificationController');

// Run once at startup
(async () => {
  try {
    console.log('Running initial appointment notifications check...');
    await notificationController.sendAppointmentNotification();
    console.log('Successfully sent initial appointment notifications');
  } catch (error) {
    console.error('Error sending initial appointment notifications:', error);
  }
})();

// Then schedule for every hour
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running scheduled appointment notifications...');
    await notificationController.sendAppointmentNotification();
    console.log('Successfully sent appointment notifications');
  } catch (error) {
    console.error('Error sending appointment notifications:', error);
  }
});
    // Catch-all route for undefined routes
app.use((req, res, next) => {
    res.status(404).send({ error: 'Route not found' });
});
app.use(globalErrorHandler);

 module.exports = app;