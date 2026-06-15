const db = require('../config/database');
const Ats = require('../models/Ats');
const AtsSalaryHistory = require('../models/AtsSalaryHistory');

(async () => {
    try {
        console.log('Dropping existing ATS tables (if any)...');
        await db.query('DROP TABLE IF EXISTS ats_salary_histories CASCADE;');
        await db.query('DROP TABLE IF EXISTS ats CASCADE;');

        console.log('Syncing Ats model...');
        await Ats.sync({ force: true });
        console.log('Syncing AtsSalaryHistory model...');
        await AtsSalaryHistory.sync({ force: true });
        
        console.log('ATS models synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing ATS models:', error);
        process.exit(1);
    }
})();
