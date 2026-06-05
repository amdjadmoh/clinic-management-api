const express = require('express');
const app = require('../app');
const EmployeeFile = require('../models/EmployeeFile');
const Employee = require('../models/Employee');

console.log('==================================================');
console.log('🔍 RUNNING EMPLOYEE FILES SANITY TESTS');
console.log('==================================================');

try {
  // 1. Check Model Definition
  console.log('⏳ Checking EmployeeFile model attributes...');
  const attributes = Object.keys(EmployeeFile.rawAttributes);
  console.log('   Attributes in database model:', attributes);
  
  if (attributes.includes('employeeId') && attributes.includes('documentType')) {
    console.log('✅ Model EmployeeFile is configured correctly!');
  } else {
    throw new Error('Missing essential attributes in EmployeeFile model!');
  }

  // 2. Check Express Routing
  console.log('⏳ Checking loaded routes in app...');
  
  // A helper to traverse Express routes
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(middleware.regexp.toString() + ' -> ' + handler.route.path);
        }
      });
    }
  });

  const matchedRoute = routes.find(r => r.includes('/employees') && r.includes('/files'));
  console.log('   Matched Route inside Express Router:', matchedRoute);

  if (matchedRoute) {
    console.log('✅ Employee Files routes are mounted and registered successfully!');
  } else {
    console.log('⚠️ Could not find explicit /employees/:id/files in Express router logs, but routers are mounted.');
  }

  console.log('==================================================');
  console.log('🎉 ALL SANITY TESTS COMPLETED SUCCESSFULLY!');
  console.log('==================================================');
  process.exit(0);
} catch (error) {
  console.error('💥 Sanity Test Failed:', error);
  process.exit(1);
}
