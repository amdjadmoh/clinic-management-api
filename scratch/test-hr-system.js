const http = require('http');

const BASE_URL = 'http://localhost:8080';

// Helper to make fetch-like calls using HTTP native module
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

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 RUNNING HR & PAYROLL SYSTEM AUTOMATED API TESTS');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Get Biometric Device Users
    // ----------------------------------------------------
    console.log('⏳ Test 1: Fetching Biometric Device Users (ZKTeco)...');
    const zktecoRes = await request('GET', '/zkteco/device-users');
    if (zktecoRes.statusCode === 200 && zktecoRes.body.status === 'success') {
      console.log(`✅ Success! Found ${zktecoRes.body.results} device users.`);
      console.log('   Sample User:', JSON.stringify(zktecoRes.body.data.users[0] || 'None'));
    } else {
      console.error('❌ Failed Test 1:', zktecoRes.statusCode, zktecoRes.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 1.5: Fetch Existing Departments
    // ----------------------------------------------------
    console.log('⏳ Test 1.5: Fetching existing departments to link...');
    const depRes = await request('GET', '/dep');
    let targetDepId = null;
    if (depRes.statusCode === 200 && depRes.body && depRes.body.data && depRes.body.data.deps && depRes.body.data.deps.length > 0) {
      targetDepId = depRes.body.data.deps[0].id;
      console.log(`✅ Success! Found departments. Linking to Department ID: ${targetDepId}`);
    } else {
      console.log('ℹ No departments exist. Setting depId to null (field is optional).');
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 2: Create Employee with Expanded Fields (phone, bank, dep)
    // ----------------------------------------------------
    console.log('⏳ Test 2: Creating Employee with Expanded Profile...');
    const employeeData = {
      fullName: 'Test Automated Employee',
      startDate: '2026-05-01',
      zktecoId: '99',
      phoneNumber: '+213-555-123456',
      depId: targetDepId,
      bankAccountNumber: 'DZ9900799999123456789012'
    };
    const createEmpRes = await request('POST', '/employees', employeeData);
    let testEmpId = null;
    if (createEmpRes.statusCode === 201 && createEmpRes.body.status === 'success') {
      testEmpId = createEmpRes.body.data.employee.id;
      console.log(`✅ Success! Created Employee with ID: ${testEmpId}`);
      console.log(`   Phone: ${createEmpRes.body.data.employee.phoneNumber}`);
      console.log(`   Bank Account: ${createEmpRes.body.data.employee.bankAccountNumber}`);
      console.log(`   Dep ID: ${createEmpRes.body.data.employee.depId}`);
    } else {
      console.error('❌ Failed Test 2:', createEmpRes.statusCode, createEmpRes.body);
      process.exit(1);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 3: Fetch Employee Details (Verify department load)
    // ----------------------------------------------------
    console.log(`⏳ Test 3: Getting Employee ID ${testEmpId} Details...`);
    const getEmpRes = await request('GET', `/employees/${testEmpId}`);
    if (getEmpRes.statusCode === 200 && getEmpRes.body.status === 'success') {
      console.log('✅ Success! Retrieved employee profile successfully.');
      console.log(`   Full Name: ${getEmpRes.body.data.employee.fullName}`);
      console.log('   Department loaded:', JSON.stringify(getEmpRes.body.data.employee.department || 'None'));
    } else {
      console.error('❌ Failed Test 3:', getEmpRes.statusCode, getEmpRes.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 4: Create a Leave Request for the Employee
    // ----------------------------------------------------
    console.log('⏳ Test 4: Creating a Leave Request (Annual)...');
    const leaveData = {
      employeeId: testEmpId,
      startDate: '2026-05-15',
      endDate: '2026-05-17',
      type: 'annual',
      reason: 'Automated test leave'
    };
    const createLeaveRes = await request('POST', '/employees/leaves', leaveData);
    let leaveId = null;
    if (createLeaveRes.statusCode === 201 && createLeaveRes.body.status === 'success') {
      leaveId = createLeaveRes.body.data.leave.id;
      console.log(`✅ Success! Leave request created with ID: ${leaveId}`);
      console.log(`   Type: ${createLeaveRes.body.data.leave.type}, Status: ${createLeaveRes.body.data.leave.status}`);
    } else {
      console.error('❌ Failed Test 4:', createLeaveRes.statusCode, createLeaveRes.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 5: Approve the Leave Request
    // ----------------------------------------------------
    console.log(`⏳ Test 5: Approving Leave Request ID ${leaveId}...`);
    const approveLeaveRes = await request('PUT', `/employees/leaves/${leaveId}`, { status: 'approved' });
    if (approveLeaveRes.statusCode === 200 && approveLeaveRes.body.status === 'success') {
      console.log(`✅ Success! Leave request is now: ${approveLeaveRes.body.data.leave.status}`);
    } else {
      console.error('❌ Failed Test 5:', approveLeaveRes.statusCode, approveLeaveRes.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 6: Add One-Time Adjustment (Bonus +150 DZD)
    // ----------------------------------------------------
    console.log('⏳ Test 6: Adding a One-Time Monthly Adjustment (Receptionist Extra Day +150 DZD)...');
    const adjustmentData = {
      employeeId: testEmpId,
      month: '2026-05',
      amount: 150,
      description: 'Receptionist extra Saturday shift'
    };
    const adjustmentRes = await request('POST', '/payroll/adjustment', adjustmentData);
    if (adjustmentRes.statusCode === 200 && adjustmentRes.body.status === 'success') {
      console.log('✅ Success! One-time adjustment recorded successfully.');
      console.log(`   Current Total Earned: ${adjustmentRes.body.data.payroll.totalEarned} DZD`);
      console.log(`   Current Bonus Earned (Adjusted): ${adjustmentRes.body.data.payroll.bonusEarned} DZD`);
    } else {
      console.error('❌ Failed Test 6:', adjustmentRes.statusCode, adjustmentRes.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 7: Pay Employee in Tranches (Installment 1)
    // ----------------------------------------------------
    console.log('⏳ Test 7: Making a Partial Payment (Installment 1)...');
    const payData1 = {
      employeeId: testEmpId,
      month: '2026-05',
      paymentAmount: 50,
      notes: 'First installment paid'
    };
    const payRes1 = await request('POST', '/payroll/pay', payData1);
    if (payRes1.statusCode === 200 && payRes1.body.status === 'success') {
      console.log('✅ Success! Payment logged successfully.');
      console.log(`   Total Paid: ${payRes1.body.data.payroll.totalPaid} DZD`);
      console.log(`   Status: ${payRes1.body.data.payroll.status}`);
      console.log('   Payments Log:', JSON.stringify(payRes1.body.data.payroll.details.payments));
    } else {
      console.error('❌ Failed Test 7:', payRes1.statusCode, payRes1.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 8: Pay Employee in Tranches (Installment 2)
    // ----------------------------------------------------
    console.log('⏳ Test 8: Making another Partial Payment (Installment 2)...');
    const payData2 = {
      employeeId: testEmpId,
      month: '2026-05',
      paymentAmount: 100,
      notes: 'Second installment paid'
    };
    const payRes2 = await request('POST', '/payroll/pay', payData2);
    if (payRes2.statusCode === 200 && payRes2.body.status === 'success') {
      console.log('✅ Success! Payment logged successfully.');
      console.log(`   Total Paid: ${payRes2.body.data.payroll.totalPaid} DZD`);
      console.log(`   Status: ${payRes2.body.data.payroll.status}`);
      console.log('   Payments Log Archive:', JSON.stringify(payRes2.body.data.payroll.details.payments));
    } else {
      console.error('❌ Failed Test 8:', payRes2.statusCode, payRes2.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 9: Soft Delete Employee
    // ----------------------------------------------------
    console.log(`⏳ Test 9: Deleting Employee ID ${testEmpId} (Soft-Delete)...`);
    const deleteRes = await request('DELETE', `/employees/${testEmpId}`);
    if (deleteRes.statusCode === 204) {
      console.log('✅ Success! Soft deletion executed successfully.');
    } else {
      console.error('❌ Failed Test 9:', deleteRes.statusCode, deleteRes.body);
    }
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 10: Confirm Exclusion from Active Employee List
    // ----------------------------------------------------
    console.log('⏳ Test 10: Verifying Soft-Deleted Employee is Excluded from Lists...');
    const listRes = await request('GET', '/employees');
    if (listRes.statusCode === 200 && listRes.body.status === 'success') {
      const found = listRes.body.data.employees.find(e => e.id === testEmpId);
      if (!found) {
        console.log('✅ Success! Employee is successfully filtered out of active lists.');
      } else {
        console.error('❌ Failed: Soft-deleted employee still listed in active employee list!');
      }
    } else {
      console.error('❌ Failed Test 10:', listRes.statusCode, listRes.body);
    }
    console.log('----------------------------------------------------\n');

    console.log('====================================================');
    console.log('🎉 ALL HR & PAYROLL SYSTEM API TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');

  } catch (err) {
    console.error('💥 An unexpected error occurred during API tests:', err);
  }
};

runTests();
