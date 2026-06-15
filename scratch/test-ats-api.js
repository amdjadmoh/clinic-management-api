const http = require('http');
const app = require('../app');
const db = require('../config/database');
const Ats = require('../models/Ats');

const PORT = 8091;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to make HTTP requests
const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const run = async () => {
  console.log('Starting DB Connection...');
  await db.authenticate();
  console.log('Database connected successfully.');

  // Start the server
  const server = app.listen(PORT, async () => {
    console.log(`Test server is running on port ${PORT}`);

    try {
      // 1. Test POST /ats (Create ATS)
      console.log('\n--- TEST 1: POST /ats (Create ATS) ---');
      const atsPayload = {
        agence: 'CNAS Alger',
        centrePaiement: '5501',
        employerName: 'Hospital Clinic',
        employerAdherentNumber: '1122334455',
        employerAddress: 'Main St, Alger',
        employeeNom: 'Zidane',
        employeePrenom: 'Zinedine',
        employeeSocialSecurityNumber: '998877665544',
        employeeProfession: 'Lead Surgeon',
        dateRecrutement: '2022-09-01',
        dateDernierJourTravail: '2026-06-01',
        volumeHoraireJournalier: 8.00,
        faitA: 'Alger',
        faitLe: '2026-06-10',
        signataireNomPrenomQualite: 'Clinic Admin',
        salaryHistory: [
          {
            referencePeriod: 'MAI 2026',
            joursTravailles: '30 jours',
            motifAbsence: '/',
            salaireCotisable: 150000.00,
            cotisationOuvriere: 13500.00
          },
          {
            referencePeriod: 'AVRIL 2026',
            joursTravailles: '30 jours',
            motifAbsence: '2 jours maladie',
            salaireCotisable: 140000.00,
            cotisationOuvriere: 12600.00
          }
        ]
      };

      const createRes = await request('POST', '/ats', atsPayload);
      console.log('POST Response Code:', createRes.statusCode);
      if (createRes.statusCode !== 201) {
        throw new Error(`Failed to create ATS: ${JSON.stringify(createRes.body)}`);
      }
      
      const createdAts = createRes.body.data.ats;
      const createdSalaries = createRes.body.data.salaryHistory;
      console.log('✅ Created ATS ID:', createdAts.id);
      console.log('✅ Employee Nom:', createdAts.employeeNom);
      console.log('✅ Employee Prenom:', createdAts.employeePrenom);
      console.log('✅ Salary History Count:', createdSalaries.length);

      if (createdAts.employeeNom !== 'Zidane' || createdAts.employeePrenom !== 'Zinedine') {
        throw new Error('Name storage failed');
      }

      // 2. Test GET /ats (Get all)
      console.log('\n--- TEST 2: GET /ats (Retrieve all documents) ---');
      const listRes = await request('GET', '/ats');
      console.log('GET /ats Response Code:', listRes.statusCode);
      console.log('Documents count:', listRes.body.results);
      if (listRes.body.results < 1) {
        throw new Error('GET /ats did not return any records');
      }

      // 3. Test GET /ats/:id (Get single with details)
      console.log(`\n--- TEST 3: GET /ats/${createdAts.id} (Retrieve single) ---`);
      const singleRes = await request('GET', `/ats/${createdAts.id}`);
      console.log('GET /ats/:id Response Code:', singleRes.statusCode);
      const atsDetails = singleRes.body.data.ats;
      console.log('Retrieved ATS ID:', atsDetails.id);
      console.log('Retrieved Salary History Rows:', atsDetails.atsSalaryHistories.length);
      if (atsDetails.atsSalaryHistories.length !== 2) {
        throw new Error('Salary history did not load correctly with include statement');
      }

      // 4. Test PUT /ats/:id (Update fields & replace salary records)
      console.log(`\n--- TEST 4: PUT /ats/${createdAts.id} (Update details & salaries) ---`);
      const updatePayload = {
        agence: 'CNAS Alger Centre (Updated)',
        nonReprisCeJour: true,
        salaryHistory: [
          {
            referencePeriod: 'JUIN 2026 (New Month)',
            joursTravailles: '22 jours',
            motifAbsence: 'Vacation',
            salaireCotisable: 160000.00,
            cotisationOuvriere: 14400.00
          }
        ]
      };

      const updateRes = await request('PUT', `/ats/${createdAts.id}`, updatePayload);
      console.log('PUT Response Code:', updateRes.statusCode);
      const updatedAts = updateRes.body.data.ats;
      const updatedSalaries = updateRes.body.data.salaryHistory;
      console.log('✅ Updated Agence:', updatedAts.agence);
      console.log('✅ Updated NonReprisCeJour:', updatedAts.nonReprisCeJour);
      console.log('✅ Updated Salary History Count:', updatedSalaries.length);

      if (updatedAts.agence !== 'CNAS Alger Centre (Updated)' || updatedAts.nonReprisCeJour !== true) {
        throw new Error('Update of main fields failed');
      }

      // 5. Test DELETE /ats/:id (Delete and verify cascade)
      console.log(`\n--- TEST 5: DELETE /ats/${createdAts.id} (Delete document) ---`);
      const deleteRes = await request('DELETE', `/ats/${createdAts.id}`);
      console.log('DELETE Response Code:', deleteRes.statusCode);
      if (deleteRes.statusCode !== 204) {
        throw new Error('DELETE request failed');
      }

      // Verify it's gone
      const verifyRes = await request('GET', `/ats/${createdAts.id}`);
      console.log('Verification GET Response Code (expected 404):', verifyRes.statusCode);
      if (verifyRes.statusCode !== 404) {
        throw new Error('ATS was not deleted successfully');
      }

      console.log('\n🎉 ALL ATS API ENDPOINT TESTS PASSED SUCCESSFULLY! 🎉');

    } catch (error) {
      console.error('\n💥 TEST FAILURE:', error.message);
    } finally {
      // Close the server and exit
      server.close(() => {
        console.log('Test server closed.');
        process.exit(0);
      });
    }
  });
};

run().catch(err => {
  console.error('Initial error:', err);
  process.exit(1);
});
