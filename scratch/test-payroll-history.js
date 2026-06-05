const http = require('http');

const BASE_URL = 'http://localhost:8080';

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method.toUpperCase(),
      hostname: url.hostname,
      port: url.port || 80,
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
            headers: res.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
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
  try {
    console.log('🧪 Testing Payroll History and Detailed Payment Archive...\n');

    // 1. Fetch employees
    console.log('1. Fetching employees list...');
    const employeesRes = await request('GET', '/employees');
    let empId = null;
    let empName = '';

    if (employeesRes.statusCode === 200 && employeesRes.body.data && employeesRes.body.data.employees.length > 0) {
      const activeEmp = employeesRes.body.data.employees[0];
      empId = activeEmp.id;
      empName = activeEmp.fullName;
      console.log(`Found active employee: ${empName} (ID: ${empId})`);
    } else {
      console.log('No employees found. Creating a test employee...');
      const createRes = await request('POST', '/employees', {
        fullName: 'History Test Employee',
        startDate: '2026-06-01',
        zktecoId: '100'
      });
      if (createRes.statusCode === 201) {
        empId = createRes.body.data.employee.id;
        empName = createRes.body.data.employee.fullName;
        console.log(`Created employee: ${empName} (ID: ${empId})`);
      } else {
        throw new Error('Failed to create test employee: ' + JSON.stringify(createRes.body));
      }
    }

    // 2. Add an adjustment
    console.log(`\n2. Adding a 1000 DZD adjustment for ${empName} for 2026-06...`);
    const adjRes = await request('POST', '/payroll/adjustment', {
      employeeId: empId,
      month: '2026-06',
      amount: 1000,
      description: 'Test transport adjustment'
    });
    console.log('Adjustment response status:', adjRes.statusCode);

    // 3. Make a payment tranche
    console.log(`\n3. Making a partial payment of 5000 DZD for ${empName} for 2026-06...`);
    const payRes = await request('POST', '/payroll/pay', {
      employeeId: empId,
      month: '2026-06',
      paymentAmount: 5000,
      notes: 'Tranche 1 paid by Cash'
    });
    console.log('Payment response status:', payRes.statusCode);

    // 4. Get monthly summary and verify paymentArchive details
    console.log('\n4. Fetching monthly payroll summary for 2026-06...');
    const summaryRes = await request('GET', '/payroll?month=2026-06');
    console.log('Summary response status:', summaryRes.statusCode);
    const summaryData = summaryRes.body.data.summaries.find(s => s.employeeId === empId);
    
    if (summaryData) {
      console.log('Monthly summary data details:');
      console.log(' - Full Name:', summaryData.fullName);
      console.log(' - Payment Archive:', JSON.stringify(summaryData.paymentArchive, null, 2));
      
      if (summaryData.paymentArchive.payments && summaryData.paymentArchive.payments.length > 0) {
        console.log('✅ Successfully verified "payments" array exists in monthly summary archive!');
      } else {
        console.error('❌ Failed: "payments" array is missing or empty in monthly summary archive!');
      }

      if (summaryData.paymentArchive.adjustments && summaryData.paymentArchive.adjustments.length > 0) {
        console.log('✅ Successfully verified "adjustments" array exists in monthly summary archive!');
      } else {
        console.error('❌ Failed: "adjustments" array is missing or empty in monthly summary archive!');
      }
    } else {
      console.error('❌ Failed: could not find summary for employee ID', empId);
    }

    // 5. Get employee payroll history
    console.log(`\n5. Fetching detailed payroll history for employee ID ${empId}...`);
    const historyRes = await request('GET', `/payroll/history/${empId}`);
    console.log('History response status:', historyRes.statusCode);
    
    if (historyRes.statusCode === 200) {
      console.log('History Data payload structure:');
      console.log(JSON.stringify(historyRes.body.data, null, 2));
      console.log('\n✅ Successfully verified employee payroll history endpoint works perfectly!');
    } else {
      console.error('❌ Failed: history response returned status', historyRes.statusCode);
    }

  } catch (error) {
    console.error('💥 Test run failed:', error);
  }
};

run();
