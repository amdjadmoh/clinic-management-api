'use strict';

const path = require('path');
const xlsx = require('xlsx');

const XLSX_PATH = path.join(__dirname, '..', 'NOMENCLATURE.VERSION.AVRIL_.2026-.xlsx');
const SHEET_NAME = 'Nomenclature Avril 2026';

const COL = {
    code:            2,   // CODE
    medicineComName: 3,   // DENOMINATION COMMUNE INTERNATIONALE
    medicineName:    4,   // NOM DE MARQUE
    forme:           5,   // FORME
    dosage:          6,   // DOSAGE
    packaging:       7,   // CONDITIONNEMENT
};

function loadMedicines() {
    const wb = xlsx.readFile(XLSX_PATH);
    const ws = wb.Sheets[SHEET_NAME];
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });

    const medicines = [];
    for (let i = 5; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[COL.medicineName]) continue;
        // skip duplicate header row
        if (String(row[COL.medicineName]).trim().toUpperCase() === 'NOM DE MARQUE') continue;

        medicines.push({
            code:            String(row[COL.code]            || '').trim() || null,
            medicineName:    String(row[COL.medicineName]    || '').trim() || null,
            medicineComName: String(row[COL.medicineComName] || '').trim() || null,
            forme:           String(row[COL.forme]           || '').trim() || null,
            dosage:          String(row[COL.dosage]          || '').trim() || null,
            packaging:       String(row[COL.packaging]       || '').trim() || null,
        });
    }
    return medicines;
}

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const cols = await queryInterface.describeTable('medicines');

        // Add only new columns — never touch existing ones
        if (!cols.code)      await queryInterface.addColumn('medicines', 'code',      { type: Sequelize.TEXT, allowNull: true });
        else                 await queryInterface.changeColumn('medicines', 'code',      { type: Sequelize.TEXT, allowNull: true });
        if (!cols.forme)     await queryInterface.addColumn('medicines', 'forme',     { type: Sequelize.STRING, allowNull: true });
        if (!cols.packaging) await queryInterface.addColumn('medicines', 'packaging', { type: Sequelize.TEXT, allowNull: true });
        else                 await queryInterface.changeColumn('medicines', 'packaging', { type: Sequelize.TEXT, allowNull: true });

        // Clear old medicines and insert updated nomenclature
        await queryInterface.bulkDelete('medicines', null, {
            truncate: true,
            restartIdentity: true,
        });

        const medicines = loadMedicines();
        const CHUNK = 500;
        for (let i = 0; i < medicines.length; i += CHUNK) {
            await queryInterface.bulkInsert('medicines', medicines.slice(i, i + CHUNK));
        }

        console.log(`Inserted ${medicines.length} medicines from April 2026 nomenclature.`);
    },

    down: async (queryInterface) => {
        await queryInterface.bulkDelete('medicines', null, { truncate: true, restartIdentity: true });

        const cols = await queryInterface.describeTable('medicines');
        if (cols.code)      await queryInterface.removeColumn('medicines', 'code');
        if (cols.forme)     await queryInterface.removeColumn('medicines', 'forme');
        if (cols.packaging) await queryInterface.removeColumn('medicines', 'packaging');
    },
};
