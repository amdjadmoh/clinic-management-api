// Global Application State
const state = {
  activeTab: 'dashboard',
  employees: [],
  jobs: [],
  departments: [],
  users: [],
  doctors: [],
  procedures: [],
  selectedEmployeeId: null,
  payrollMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
  payrollSummaries: []
};

// API Base URL config (Relative to dashboard location)
const API = {
  employees: '/employees',
  jobs: '/employees/jobs',
  leaves: '/employees/leaves',
  payroll: '/payroll',
  zkteco: '/zkteco',
  departments: '/dep',
  users: '/users',
  doctors: '/doctors',
  procedures: '/preDefinedProcedure',
  hr: '/hr'
};

// ================= DOM ELEMENT SELECTORS =================
const elements = {
  // Sidebar & Layout
  menuItems: document.querySelectorAll('.menu-item'),
  panes: document.querySelectorAll('.tab-pane'),
  tabTitle: document.getElementById('active-tab-title'),
  tabDesc: document.getElementById('active-tab-desc'),
  systemTime: document.getElementById('system-time'),
  quickSyncBtn: document.getElementById('quick-sync-btn'),
  quickLeaveBtn: document.getElementById('quick-leave-btn'),
  toastContainer: document.getElementById('toast-container'),

  // Modals & Forms
  modals: document.querySelectorAll('.modal'),
  modalCloseBtns: document.querySelectorAll('.modal-close, .modal-close-btn'),
  
  // Dashboard Pane
  statsTotalEmployees: document.getElementById('stats-total-employees'),
  statsTotalJobs: document.getElementById('stats-total-jobs'),
  statsActiveLeaves: document.getElementById('stats-active-leaves'),
  statsSyncTime: document.getElementById('stats-sync-time'),
  visitsFilterForm: document.getElementById('visits-filter-form'),
  visitsStart: document.getElementById('visits-start'),
  visitsEnd: document.getElementById('visits-end'),
  visitsOldStart: document.getElementById('visits-old-start'),
  visitsOldEnd: document.getElementById('visits-old-end'),
  visitsStatus: document.getElementById('visits-status'),
  visitsEmptyState: document.getElementById('visits-empty-state'),
  visitsResultsTable: document.getElementById('visits-results-table'),
  visitsResultsBody: document.getElementById('visits-results-body'),

  // Employees Pane
  employeeSearch: document.getElementById('employee-search-input'),
  employeeStatusFilter: document.getElementById('employee-status-filter'),
  addEmployeeBtn: document.getElementById('add-employee-btn'),
  employeesLoading: document.getElementById('employees-loading'),
  employeesEmpty: document.getElementById('employees-empty'),
  employeesContainer: document.getElementById('employees-container'),
  employeeCountBadge: document.getElementById('employee-count-badge'),
  
  // Selected Employee Details
  detailPlaceholder: document.getElementById('detail-pane-placeholder'),
  detailCard: document.getElementById('employee-detail-card'),
  detailFullName: document.getElementById('detail-fullName'),
  detailJobTitle: document.getElementById('detail-jobTitle'),
  detailStatusBadge: document.getElementById('detail-status-badge'),
  detailDepBadge: document.getElementById('detail-dep-badge'),
  detailAvatarLetters: document.getElementById('detail-avatar-letters'),
  detailPhone: document.getElementById('detail-phone'),
  detailStartDate: document.getElementById('detail-start-date'),
  detailBank: document.getElementById('detail-bank'),
  detailSsn: document.getElementById('detail-ssn'),
  detailUserId: document.getElementById('detail-userId'),
  detailDoctorId: document.getElementById('detail-doctorId'),
  detailZktecoId: document.getElementById('detail-zktecoId'),
  editProfileBtn: document.getElementById('edit-employee-profile-btn'),
  deleteEmployeeBtn: document.getElementById('delete-employee-btn'),
  
  // Selected Employee Subtabs
  detailSubtabs: document.querySelectorAll('.subtab-item'),
  detailSubpanes: document.querySelectorAll('.subtab-pane'),
  
  // Employee Subtab - Payment Settings
  addPaymentRowBtn: document.getElementById('add-payment-row-btn'),
  paymentSettingsForm: document.getElementById('payment-settings-form'),
  paymentSettingsRows: document.getElementById('payment-settings-rows'),
  
  // Employee Subtab - Schedule
  scheduleForm: document.getElementById('schedule-setup-form'),
  clearScheduleBtn: document.getElementById('clear-schedule-btn'),
  
  // Employee Subtab - Attendance
  attendanceFilterMonth: document.getElementById('attendance-filter-month'),
  addAttendanceBtn: document.getElementById('add-attendance-btn'),
  attendanceListBody: document.getElementById('attendance-list-body'),
  
  // Employee Subtab - Leaves
  empLeavesListBody: document.getElementById('emp-leaves-list-body'),
  
  // Employee Subtab - Files
  documentUploadForm: document.getElementById('document-upload-form'),
  docTypeInput: document.getElementById('doc-type-input'),
  docDescriptionInput: document.getElementById('doc-description-input'),
  docFileInput: document.getElementById('doc-file-input'),
  empFilesContainer: document.getElementById('emp-files-container'),

  // Jobs Pane
  createJobBtn: document.getElementById('create-job-btn'),
  jobsTableBody: document.getElementById('jobs-table-body'),

  // Leaves Pane
  leaveStatusFilter: document.getElementById('leave-status-filter'),
  addLeaveRequestBtn: document.getElementById('add-leave-request-btn'),
  leavesTableBody: document.getElementById('leaves-table-body'),

  // Payroll Pane
  payrollMonthInput: document.getElementById('payroll-month-input'),
  calculatePayrollBtn: document.getElementById('calculate-payroll-btn'),
  bulkConfirmPayrollBtn: document.getElementById('bulk-confirm-payroll-btn'),
  payrollTableBody: document.getElementById('payroll-table-body'),

  // ZKTeco Pane
  syncZktecoBtn: document.getElementById('sync-zkteco-btn'),
  fetchZktecoUsersBtn: document.getElementById('fetch-zkteco-users-btn'),
  clearConsoleBtn: document.getElementById('clear-console-btn'),
  zktecoConsole: document.getElementById('zkteco-console'),
  zktecoUsersBody: document.getElementById('zkteco-users-body'),
  simulateScanForm: document.getElementById('simulate-scan-form'),
  simulateZktecoId: document.getElementById('simulate-zkteco-id'),
  simulatePunchType: document.getElementById('simulate-punch-type'),
  simulateTimestamp: document.getElementById('simulate-timestamp')
};

// ================= INITIALIZATION =================
document.addEventListener('DOMContentLoaded', async () => {
  initRealtimeClock();
  setupEventListeners();
  setDefaultDates();
  
  // Fetch initial base configurations
  await Promise.all([
    fetchJobs(),
    fetchDepartments(),
    fetchUsers(),
    fetchDoctors(),
    fetchProcedures()
  ]);
  
  // Load initial active tab (Dashboard)
  await handleTabChange('dashboard');
});

// Clock Tracker
function initRealtimeClock() {
  const formatTime = () => {
    const date = new Date();
    elements.systemTime.textContent = date.toLocaleTimeString();
  };
  formatTime();
  setInterval(formatTime, 1000);
}

// Set Default Inputs Dates
function setDefaultDates() {
  const today = new Date();
  
  // Months default: YYYY-MM
  const currentMonthStr = today.toISOString().substring(0, 7);
  elements.payrollMonthInput.value = currentMonthStr;
  elements.attendanceFilterMonth.value = currentMonthStr;
  
  // Dates default: YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  elements.visitsStart.value = formatDate(startOfCurrentMonth);
  elements.visitsEnd.value = formatDate(today);
  
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  elements.visitsOldStart.value = formatDate(startOfLastMonth);
  elements.visitsOldEnd.value = formatDate(endOfLastMonth);
}

// ================= TOAST NOTIFICATION UTILITY =================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ================= GENERAL API HANDLERS =================
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    
    if (response.status === 204) return null;
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Request Failure [${url}]:`, err);
    showToast(err.message, 'error');
    throw err;
  }
}

// Base Fetchers
async function fetchJobs() {
  try {
    const res = await request(API.jobs);
    state.jobs = res?.data?.jobs || [];
  } catch (e) { state.jobs = []; }
}

async function fetchDepartments() {
  try {
    const res = await request(API.departments);
    state.departments = res?.data?.deps || res?.data?.departments || [];
  } catch (e) { state.departments = []; }
}

async function fetchUsers() {
  try {
    const res = await request(API.users);
    state.users = res?.data?.users || res || [];
  } catch (e) { state.users = []; }
}

async function fetchDoctors() {
  try {
    const res = await request(API.doctors);
    state.doctors = res?.data?.doctors || res || [];
  } catch (e) { state.doctors = []; }
}

async function fetchProcedures() {
  try {
    const res = await request(API.procedures);
    state.procedures = res?.data?.preDefinedProcedures || res?.data?.procedures || [];
  } catch (e) { state.procedures = []; }
}

// ================= EVENT LISTENERS SETUP =================
function setupEventListeners() {
  // Sidebar navigation links click
  elements.menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      handleTabChange(tab);
    });
  });

  // Quick action headers buttons
  elements.quickSyncBtn.addEventListener('click', triggerZktecoSync);
  elements.quickLeaveBtn.addEventListener('click', () => openModal('leave-request-modal'));

  // Setup generic modal dismiss listeners
  elements.modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeAllModals();
    });
  });
  
  // Close modal when clicking dark overlay
  elements.modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // --- TAB: DASHBOARD EVENTS ---
  elements.visitsFilterForm.addEventListener('submit', handleVisitsWidgetSubmit);

  // --- TAB: EMPLOYEES EVENTS ---
  elements.employeeSearch.addEventListener('input', renderEmployeeList);
  elements.employeeStatusFilter.addEventListener('change', renderEmployeeList);
  elements.addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
  elements.editProfileBtn.addEventListener('click', () => openEmployeeModal(state.selectedEmployeeId));
  elements.deleteEmployeeBtn.addEventListener('click', () => archiveEmployee(state.selectedEmployeeId));

  // Employee detail sub-tabs click
  elements.detailSubtabs.forEach(subtab => {
    subtab.addEventListener('click', () => {
      const paneId = subtab.getAttribute('data-subtab');
      handleSubtabChange(paneId);
    });
  });

  // Employee detail subtab submits
  elements.addPaymentRowBtn.addEventListener('click', () => addPaymentSettingRow({}, elements.paymentSettingsRows));
  elements.paymentSettingsForm.addEventListener('submit', handlePaymentSettingsSubmit);
  elements.scheduleForm.addEventListener('submit', handleScheduleSubmit);
  elements.clearScheduleBtn.addEventListener('click', handleClearSchedule);
  
  elements.attendanceFilterMonth.addEventListener('change', () => loadEmployeeAttendance(state.selectedEmployeeId));
  elements.addAttendanceBtn.addEventListener('click', () => {
    document.getElementById('attendance-employee-id').value = state.selectedEmployeeId;
    document.getElementById('attendance-record-id').value = '';
    document.getElementById('attendance-date-input').value = new Date().toISOString().split('T')[0];
    document.getElementById('attendance-clockIn-input').value = '';
    document.getElementById('attendance-clockOut-input').value = '';
    document.getElementById('attendance-status-input').value = 'present';
    document.getElementById('attendance-modal').querySelector('.modal-header h3').textContent = 'Record Manual Attendance Row';
    openModal('attendance-modal');
  });
  document.getElementById('attendance-form').addEventListener('submit', handleAttendanceSubmit);
  
  elements.documentUploadForm.addEventListener('submit', handleDocumentUploadSubmit);

  // --- TAB: JOBS EVENTS ---
  elements.createJobBtn.addEventListener('click', () => openJobModal());
  document.getElementById('job-add-payment-btn').addEventListener('click', () => addPaymentSettingRow({}, document.getElementById('job-payment-rows')));
  document.getElementById('job-form').addEventListener('submit', handleJobSubmit);

  // --- TAB: LEAVES EVENTS ---
  elements.leaveStatusFilter.addEventListener('change', fetchAndRenderLeaves);
  elements.addLeaveRequestBtn.addEventListener('click', () => openLeaveRequestModal());
  document.getElementById('leave-request-form').addEventListener('submit', handleLeaveRequestSubmit);
  document.getElementById('leave-approve-form').addEventListener('submit', handleLeaveApprovalConfirm);

  // --- TAB: PAYROLL EVENTS ---
  elements.calculatePayrollBtn.addEventListener('click', handleCalculatePayroll);
  elements.bulkConfirmPayrollBtn.addEventListener('click', () => triggerConfirmPayroll(null)); // null means ALL
  document.getElementById('payroll-payment-form').addEventListener('submit', handleRecordPaymentSubmit);
  document.getElementById('payroll-adjustment-form').addEventListener('submit', handleAddAdjustmentSubmit);

  // --- TAB: ZKTECO EVENTS ---
  elements.syncZktecoBtn.addEventListener('click', triggerZktecoSync);
  elements.fetchZktecoUsersBtn.addEventListener('click', queryZktecoUsers);
  elements.clearConsoleBtn.addEventListener('click', () => { elements.zktecoConsole.textContent = 'Ready...'; });
  
  if (elements.simulateScanForm) {
    elements.simulateScanForm.addEventListener('submit', simulateZktecoScan);
  }
}

// ================= MODAL MANAGERS =================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeAllModals() {
  elements.modals.forEach(m => m.classList.remove('active'));
}

// ================= TAB MANAGEMENT =================
async function handleTabChange(tab) {
  state.activeTab = tab;
  
  // Highlight sidebar item
  elements.menuItems.forEach(item => {
    if (item.getAttribute('data-tab') === tab) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch view pane
  elements.panes.forEach(pane => {
    if (pane.getAttribute('id') === `tab-${tab}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Update headers description
  let title = 'Dashboard Overview';
  let desc = 'Real-time indicators and metrics across clinical operations.';
  
  if (tab === 'employees') {
    title = 'Employees Directory';
    desc = 'Configure contract settings, working hours, file uploads, and attendance calendars.';
    await fetchEmployees();
  } else if (tab === 'jobs') {
    title = 'Job Careers & Roles';
    desc = 'Create standard positions and configure default compensation packages.';
    await fetchJobs();
    renderJobs();
  } else if (tab === 'leaves') {
    title = 'Leaves Review Board';
    desc = 'Review administrative leave requests, approve absences, or configure paid parameters.';
    await fetchAndRenderLeaves();
  } else if (tab === 'payroll') {
    title = 'Payroll Control Deck';
    desc = 'Run salary calculations, apply bonuses/deductions, confirm balances, and log payouts.';
    await handleCalculatePayroll();
  } else if (tab === 'zkteco') {
    title = 'ZKTeco Hardware Logs';
    await populateSimulateDropdown();
    desc = 'Establish biometric connections, sync machine log registries, and query users.';
  } else {
    // Dashboard general view
    await loadDashboardSummary();
  }
  
  elements.tabTitle.textContent = title;
  elements.tabDesc.textContent = desc;
}

// ================= VIEW: DASHBOARD =================
async function loadDashboardSummary() {
  try {
    // Hit employees route to count active ones
    const empRes = await request(API.employees);
    const employees = empRes?.data?.employees || [];
    const activeEmployees = employees.filter(e => e.status === 'active');
    
    // Hit leaves
    const leavesRes = await request(API.leaves);
    const leaves = leavesRes?.data?.leaves || [];
    const pendingLeaves = leaves.filter(l => l.status === 'pending');
    
    // Hydrate cards
    elements.statsTotalEmployees.textContent = activeEmployees.length;
    elements.statsTotalJobs.textContent = state.jobs.length;
    elements.statsActiveLeaves.textContent = pendingLeaves.length;
  } catch (e) {
    console.error('Failed to load dashboard summaries', e);
  }
}

async function handleVisitsWidgetSubmit(e) {
  e.preventDefault();
  
  const query = new URLSearchParams({
    startDate: elements.visitsStart.value,
    endDate: elements.visitsEnd.value,
    oldStartDate: elements.visitsOldStart.value,
    oldEndDate: elements.visitsOldEnd.value,
    status: elements.visitsStatus.value
  });
  
  try {
    const res = await request(`${API.hr}/visitsPerDepInDateRange?${query.toString()}`);
    const results = res?.data?.visitsPerDep || {};
    
    elements.visitsEmptyState.classList.add('hidden');
    elements.visitsResultsTable.classList.remove('hidden');
    elements.visitsResultsBody.innerHTML = '';
    
    const keys = Object.keys(results);
    if (keys.length === 0) {
      elements.visitsResultsBody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center font-muted">No visits recorded in this range</td>
        </tr>
      `;
      return;
    }
    
    keys.forEach(k => {
      const item = results[k];
      const imp = parseFloat(item.improvementPercentage) || 0;
      let impClass = 'text-center';
      let impIcon = '';
      
      if (imp > 0) {
        impClass = 'stat-trend positive';
        impIcon = '<i class="fa-solid fa-arrow-trend-up"></i>';
      } else if (imp < 0) {
        impClass = 'stat-trend warning';
        impIcon = '<i class="fa-solid fa-arrow-trend-down"></i>';
      }
      
      elements.visitsResultsBody.innerHTML += `
        <tr>
          <td><strong>${item.depName || `Dept ID: ${item.depID}`}</strong></td>
          <td>${item.visitsNumber} visits</td>
          <td>
            <span class="${impClass}">
              ${impIcon} ${imp.toFixed(1)}%
            </span>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    showToast('Failed to calculate department statistics', 'error');
  }
}

// ================= VIEW: EMPLOYEES DIRECTORY =================
async function fetchEmployees() {
  elements.employeesLoading.classList.remove('hidden');
  elements.employeesContainer.innerHTML = '';
  
  try {
    const res = await request(API.employees);
    state.employees = res?.data?.employees || [];
    renderEmployeeList();
  } catch (err) {
    elements.employeesLoading.classList.add('hidden');
  }
}

function renderEmployeeList() {
  elements.employeesLoading.classList.add('hidden');
  elements.employeesContainer.innerHTML = '';
  
  const searchVal = elements.employeeSearch.value.toLowerCase().trim();
  const statusFilter = elements.employeeStatusFilter.value;
  
  const filtered = state.employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchVal) || 
                          (emp.job?.name && emp.job.name.toLowerCase().includes(searchVal));
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  elements.employeeCountBadge.textContent = filtered.length;
  
  if (filtered.length === 0) {
    elements.employeesEmpty.classList.remove('hidden');
    return;
  }
  
  elements.employeesEmpty.classList.add('hidden');
  
  filtered.forEach(emp => {
    const card = document.createElement('div');
    card.className = `employee-card ${state.selectedEmployeeId === emp.id ? 'selected' : ''}`;
    card.setAttribute('data-id', emp.id);
    
    const initials = emp.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    card.innerHTML = `
      <div class="emp-card-details">
        <h4>${emp.fullName}</h4>
        <p>${emp.job?.name || 'No role defined'} • ${emp.dep?.depName || 'Unassigned'}</p>
      </div>
      <span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-outline'}">${emp.status}</span>
    `;
    
    card.addEventListener('click', () => selectEmployee(emp.id));
    elements.employeesContainer.appendChild(card);
  });
}

// Select Employee and open detail panel
async function selectEmployee(id) {
  state.selectedEmployeeId = id;
  
  // Highlight card
  document.querySelectorAll('.employee-card').forEach(card => {
    if (parseInt(card.getAttribute('data-id')) === id) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Fetch full details
  try {
    const res = await request(`${API.employees}/${id}`);
    const emp = res?.data?.employee;
    if (!emp) return;
    
    // Hide placeholder, show card
    elements.detailPlaceholder.classList.add('hidden');
    elements.detailCard.classList.remove('hidden');
    
    // Load metadata
    elements.detailFullName.textContent = emp.fullName;
    elements.detailJobTitle.textContent = emp.job?.name || 'No standard position defined';
    elements.detailStatusBadge.textContent = emp.status;
    elements.detailStatusBadge.className = `badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}`;
    elements.detailDepBadge.textContent = emp.dep?.depName || 'Unassigned';
    
    // Set avatar initials
    elements.detailAvatarLetters.textContent = emp.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    elements.detailPhone.textContent = emp.phoneNumber || '-';
    elements.detailStartDate.textContent = emp.startDate || '-';
    elements.detailBank.textContent = emp.bankAccountNumber || '-';
    elements.detailSsn.textContent = emp.socialSecurityNumber || '-';
    elements.detailUserId.textContent = emp.userId || '-';
    elements.detailDoctorId.textContent = emp.doctorId || '-';
    elements.detailZktecoId.textContent = emp.zktecoId || '-';
    
    // Load default detail tab (Payments)
    const activeSubtab = document.querySelector('.subtab-item.active').getAttribute('data-subtab');
    await handleSubtabChange(activeSubtab);
  } catch (err) {
    showToast('Failed to retrieve employee profile data', 'error');
  }
}

// Subtabs management
async function handleSubtabChange(subtabId) {
  elements.detailSubtabs.forEach(btn => {
    if (btn.getAttribute('data-subtab') === subtabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  elements.detailSubpanes.forEach(pane => {
    if (pane.getAttribute('id') === `subtab-${subtabId}`) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  const empId = state.selectedEmployeeId;
  if (!empId) return;

  if (subtabId === 'payments') {
    await loadEmployeePaymentSettings(empId);
  } else if (subtabId === 'schedule') {
    await loadEmployeeSchedule(empId);
  } else if (subtabId === 'attendance') {
    await loadEmployeeAttendance(empId);
  } else if (subtabId === 'leaves') {
    await loadEmployeeLeaves(empId);
  } else if (subtabId === 'files') {
    await loadEmployeeFiles(empId);
  }
}

// Subtab Pane: Payment Settings
async function loadEmployeePaymentSettings(empId) {
  elements.paymentSettingsRows.innerHTML = '';
  try {
    const res = await request(`${API.employees}/${empId}`);
    const settings = res?.data?.employee?.employee_payment_settings || [];
    
    if (settings.length === 0) {
      addPaymentSettingRow({}, elements.paymentSettingsRows);
    } else {
      settings.forEach(s => addPaymentSettingRow(s, elements.paymentSettingsRows));
    }
  } catch (e) {
    addPaymentSettingRow({}, elements.paymentSettingsRows);
  }
}

function addPaymentSettingRow(setting = {}, container) {
  const row = document.createElement('div');
  row.className = 'payment-setting-row';
  
  // Create unique id for DOM elements
  const rowId = Math.random().toString(36).substring(2, 9);
  
  // Types options
  const types = [
    { value: 'fixed_monthly', label: 'Fixed Monthly Salary' },
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'consultation_percentage', label: 'Consultation Commission' },
    { value: 'procedure_percentage', label: 'Procedure Commission' },
    { value: 'fixed_extra_bonus', label: 'Fixed Extra Allowance' }
  ];
  
  let typeOptionsHtml = types.map(t => `
    <option value="${t.value}" ${setting.type === t.value ? 'selected' : ''}>${t.label}</option>
  `).join('');
  
  // Predefined Procedures options
  let procedureOptionsHtml = `<option value="">All Procedures</option>`;
  state.procedures.forEach(p => {
    procedureOptionsHtml += `
      <option value="${p.id}" ${setting.procedureId === p.id ? 'selected' : ''}>${p.procedureName} (ID: ${p.id})</option>
    `;
  });

  row.innerHTML = `
    <div class="form-group">
      <label>Calculation Element</label>
      <select class="setting-type" data-row-id="${rowId}" required>
        ${typeOptionsHtml}
      </select>
    </div>
    
    <div class="form-group">
      <label>Rate / Amount</label>
      <input type="number" class="setting-value" value="${setting.value || 0}" required min="0" step="any">
    </div>
    
    <div class="form-group" id="expected-days-group-${rowId}">
      <label>Expected Days</label>
      <input type="number" class="setting-expected-days" value="${setting.expectedDays || 30}" min="1" max="31">
    </div>
    
    <div class="form-group hidden" id="procedure-group-${rowId}">
      <label>Procedure Filter</label>
      <select class="setting-procedure-id">
        ${procedureOptionsHtml}
      </select>
    </div>

    <div class="form-group">
      <label>Custom Label</label>
      <input type="text" class="setting-description" value="${setting.description || ''}" placeholder="e.g. Transport bonus">
    </div>
    
    <button type="button" class="btn btn-icon btn-danger remove-setting-row-btn" style="margin-bottom: 2px;">
      <i class="fa-solid fa-trash-can"></i>
    </button>
  `;
  
  // Event listener to change fields visibility based on Type selection
  const typeSelect = row.querySelector('.setting-type');
  const expDaysGrp = row.querySelector(`#expected-days-group-${rowId}`);
  const procGrp = row.querySelector(`#procedure-group-${rowId}`);
  
  const toggleFields = (val) => {
    if (val === 'fixed_monthly') {
      expDaysGrp.classList.remove('hidden');
    } else {
      expDaysGrp.classList.add('hidden');
    }
    
    if (val === 'procedure_percentage') {
      procGrp.classList.remove('hidden');
    } else {
      procGrp.classList.add('hidden');
    }
  };
  
  typeSelect.addEventListener('change', (e) => toggleFields(e.target.value));
  toggleFields(setting.type || 'fixed_monthly'); // run initial config

  row.querySelector('.remove-setting-row-btn').addEventListener('click', () => {
    row.remove();
  });
  
  container.appendChild(row);
}

async function handlePaymentSettingsSubmit(e) {
  e.preventDefault();
  
  const settings = [];
  const rows = elements.paymentSettingsRows.querySelectorAll('.payment-setting-row');
  
  rows.forEach(row => {
    const type = row.querySelector('.setting-type').value;
    const value = parseFloat(row.querySelector('.setting-value').value) || 0;
    const expectedDays = parseInt(row.querySelector('.setting-expected-days').value) || 30;
    const procSelect = row.querySelector('.setting-procedure-id');
    const procedureId = (type === 'procedure_percentage' && procSelect.value) ? parseInt(procSelect.value) : null;
    const description = row.querySelector('.setting-description').value.trim();
    
    settings.push({ type, value, expectedDays, procedureId, description });
  });
  
  try {
    await request(`${API.employees}/${state.selectedEmployeeId}/payment-settings`, {
      method: 'PUT',
      body: JSON.stringify({ settings })
    });
    
    showToast('Payment settings saved successfully', 'success');
    await selectEmployee(state.selectedEmployeeId);
  } catch (err) {}
}

// Subtab Pane: Schedule
async function loadEmployeeSchedule(empId) {
  // Reset all rows
  elements.scheduleForm.querySelectorAll('.schedule-day-row').forEach(row => {
    row.querySelector('.day-enabled').checked = false;
    row.querySelector('.start-time').disabled = true;
    row.querySelector('.end-time').disabled = true;
  });
  
  try {
    const res = await request(`${API.employees}/${empId}/schedule`);
    const schedule = res?.data?.schedule || [];
    
    schedule.forEach(entry => {
      const row = elements.scheduleForm.querySelector(`.schedule-day-row[data-day="${entry.dayOfWeek}"]`);
      if (row) {
        row.querySelector('.day-enabled').checked = true;
        row.querySelector('.start-time').disabled = false;
        row.querySelector('.end-time').disabled = false;
        row.querySelector('.start-time').value = entry.startTime.substring(0, 5); // HH:MM
        row.querySelector('.end-time').value = entry.endTime.substring(0, 5); // HH:MM
      }
    });
  } catch (e) {}

  // Toggle time input availability on checkbox clicks
  elements.scheduleForm.querySelectorAll('.day-enabled').forEach(box => {
    box.onchange = (e) => {
      const row = box.closest('.schedule-day-row');
      const inputs = row.querySelectorAll('.time-input');
      inputs.forEach(inp => inp.disabled = !e.target.checked);
    };
  });
}

async function handleScheduleSubmit(e) {
  e.preventDefault();
  
  const schedule = [];
  elements.scheduleForm.querySelectorAll('.schedule-day-row').forEach(row => {
    const dayOfWeek = parseInt(row.getAttribute('data-day'));
    const isChecked = row.querySelector('.day-enabled').checked;
    const startTime = row.querySelector('.start-time').value;
    const endTime = row.querySelector('.end-time').value;
    
    if (isChecked) {
      // API expects HH:mm:ss structure
      schedule.push({
        dayOfWeek,
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`
      });
    }
  });

  try {
    await request(`${API.employees}/${state.selectedEmployeeId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ schedule })
    });
    showToast('Schedule parameters saved successfully', 'success');
  } catch (e) {}
}

async function handleClearSchedule(e) {
  e.preventDefault();
  if (!confirm('Are you sure you want to completely clear this schedule?')) return;
  
  try {
    await request(`${API.employees}/${state.selectedEmployeeId}/schedule`, {
      method: 'DELETE'
    });
    showToast('Schedule cleared successfully', 'success');
    await loadEmployeeSchedule(state.selectedEmployeeId);
  } catch (e) {}
}

// Subtab Pane: Attendance
async function loadEmployeeAttendance(empId) {
  elements.attendanceListBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center font-muted"><i class="fa-solid fa-spinner fa-spin"></i> Retrieving attendance rows...</td>
    </tr>
  `;
  
  const month = elements.attendanceFilterMonth.value;
  if (!month) return;
  
  try {
    const res = await request(`${API.employees}/${empId}/attendance?month=${month}`);
    const list = res?.data?.attendances || [];
    
    elements.attendanceListBody.innerHTML = '';
    if (list.length === 0) {
      elements.attendanceListBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center font-muted">No attendance logs logged this month</td>
        </tr>
      `;
      return;
    }
    
    list.forEach(row => {
      // Format clockIn/clockOut for display: show time only if full datetime
      const fmtTime = (val) => {
        if (!val) return '-';
        return val.includes(' ') ? val.split(' ')[1].substring(0, 5) : val.substring(0, 5);
      };
      
      elements.attendanceListBody.innerHTML += `
        <tr>
          <td><strong>${row.date}</strong></td>
          <td>${fmtTime(row.clockIn)}</td>
          <td>${fmtTime(row.clockOut)}</td>
          <td>${row.hoursWorked ? parseFloat(row.hoursWorked).toFixed(2) + ' hrs' : '-'}</td>
          <td><span class="badge ${row.status === 'present' ? 'badge-success' : 'badge-outline'}">${row.status}</span></td>
          <td>
            <button class="btn btn-icon btn-secondary edit-attendance-btn" data-id="${row.id}" title="Edit">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-icon btn-danger delete-attendance-btn" data-id="${row.id}" title="Delete">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
    });

    elements.attendanceListBody.querySelectorAll('.edit-attendance-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rowId = parseInt(btn.getAttribute('data-id'));
        const row = list.find(r => r.id === rowId);
        if (row) openEditAttendanceModal(row);
      });
    });

    elements.attendanceListBody.querySelectorAll('.delete-attendance-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rowId = parseInt(btn.getAttribute('data-id'));
        handleDeleteAttendance(rowId);
      });
    });
  } catch (e) {
    elements.attendanceListBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center font-muted">Failed to retrieve attendance history</td>
      </tr>
    `;
  }
}

async function handleAttendanceSubmit(e) {
  e.preventDefault();
  
  const recordId = document.getElementById('attendance-record-id').value;
  const body = {
    employeeId: parseInt(document.getElementById('attendance-employee-id').value),
    date: document.getElementById('attendance-date-input').value,
    clockIn: document.getElementById('attendance-clockIn-input').value ? `${document.getElementById('attendance-clockIn-input').value}:00` : null,
    clockOut: document.getElementById('attendance-clockOut-input').value ? `${document.getElementById('attendance-clockOut-input').value}:00` : null,
    status: document.getElementById('attendance-status-input').value
  };

  const isEdit = !!recordId;
  const url = isEdit ? `${API.employees}/attendance/${recordId}` : `${API.employees}/attendance`;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    await request(url, { method, body: JSON.stringify(body) });
    closeAllModals();
    showToast(isEdit ? 'Attendance updated' : 'Attendance recorded', 'success');
    await loadEmployeeAttendance(state.selectedEmployeeId);
  } catch (err) {}
}

function openEditAttendanceModal(row) {
  document.getElementById('attendance-modal').querySelector('.modal-header h3').textContent = 'Edit Attendance Record';
  document.getElementById('attendance-record-id').value = row.id;
  document.getElementById('attendance-employee-id').value = state.selectedEmployeeId;
  document.getElementById('attendance-date-input').value = row.date;

  const fmtTimeVal = (val) => {
    if (!val) return '';
    return val.includes(' ') ? val.split(' ')[1].substring(0, 5) : val.substring(0, 5);
  };

  document.getElementById('attendance-clockIn-input').value = fmtTimeVal(row.clockIn);
  document.getElementById('attendance-clockOut-input').value = fmtTimeVal(row.clockOut);
  document.getElementById('attendance-status-input').value = row.status;
  openModal('attendance-modal');
}

async function handleDeleteAttendance(recordId) {
  if (!confirm('Delete this attendance record permanently?')) return;
  try {
    await request(`${API.employees}/attendance/${recordId}`, { method: 'DELETE' });
    showToast('Attendance record deleted', 'success');
    await loadEmployeeAttendance(state.selectedEmployeeId);
  } catch (err) {}
}

// Subtab Pane: Leaves
async function loadEmployeeLeaves(empId) {
  elements.empLeavesListBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center font-muted">Loading leave logs...</td>
    </tr>
  `;
  
  try {
    const res = await request(`${API.employees}/${empId}/leaves`);
    const leaves = res?.data?.leaves || [];
    
    elements.empLeavesListBody.innerHTML = '';
    if (leaves.length === 0) {
      elements.empLeavesListBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center font-muted">No leaves requested</td>
        </tr>
      `;
      return;
    }
    
    leaves.forEach(l => {
      let badgeClass = 'badge-outline';
      if (l.status === 'approved') badgeClass = 'badge-success';
      if (l.status === 'rejected') badgeClass = 'badge-danger';
      
      elements.empLeavesListBody.innerHTML += `
        <tr>
          <td><strong>${l.startDate}</strong> to <strong>${l.endDate}</strong></td>
          <td>${l.type}</td>
          <td>${l.paidPercentage || 100}%</td>
          <td>${l.paidDays !== null ? l.paidDays : '-'}</td>
          <td><span class="badge ${badgeClass}">${l.status}</span></td>
          <td>${l.reason || ''}</td>
        </tr>
      `;
    });
  } catch (e) {
    elements.empLeavesListBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center font-muted">Failed to load leaves</td>
      </tr>
    `;
  }
}

// Subtab Pane: Files
async function loadEmployeeFiles(empId) {
  elements.empFilesContainer.innerHTML = '<div class="loading-indicator">Retrieving document templates...</div>';
  
  try {
    const res = await request(`${API.employees}/${empId}/files`);
    const files = res?.data?.files || [];
    
    elements.empFilesContainer.innerHTML = '';
    if (files.length === 0) {
      elements.empFilesContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open"></i>
          <p>No documents uploaded for this employee</p>
        </div>
      `;
      return;
    }
    
    files.forEach(f => {
      const fileCard = document.createElement('div');
      fileCard.className = 'file-row';
      
      const sizeMb = (parseInt(f.fileSize) / (1024 * 1024)).toFixed(2);
      
      fileCard.innerHTML = `
        <div class="file-details">
          <h4>${f.filename}</h4>
          <p>${f.documentType.toUpperCase()} • ${sizeMb} MB • Uploaded ${new Date(f.createdAt).toLocaleDateString()}</p>
          ${f.description ? `<p class="font-muted" style="margin-top: 4px; font-style: italic;">"${f.description}"</p>` : ''}
        </div>
        <div class="file-actions">
          <a href="${API.employees}/${empId}/files/${f.id}/download" class="btn btn-icon btn-secondary" title="Download file" target="_blank">
            <i class="fa-solid fa-download"></i>
          </a>
          <button class="btn btn-icon btn-danger delete-file-btn" data-id="${f.id}" title="Delete file">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
      
      fileCard.querySelector('.delete-file-btn').addEventListener('click', () => deleteEmployeeFile(f.id));
      elements.empFilesContainer.appendChild(fileCard);
    });
  } catch (e) {
    elements.empFilesContainer.innerHTML = '<div class="loading-indicator text-danger">Failed to load documents</div>';
  }
}

async function handleDocumentUploadSubmit(e) {
  e.preventDefault();
  
  const fileInput = elements.docFileInput;
  if (fileInput.files.length === 0) {
    showToast('Please select a file to upload', 'error');
    return;
  }
  
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', elements.docTypeInput.value);
  formData.append('description', elements.docDescriptionInput.value.trim());

  try {
    const url = `${API.employees}/${state.selectedEmployeeId}/files`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData // Content-Type header left blank to allow browser boundary injection
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'File upload failed');
    
    showToast('Document uploaded successfully', 'success');
    elements.documentUploadForm.reset();
    await loadEmployeeFiles(state.selectedEmployeeId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteEmployeeFile(fileId) {
  if (!confirm('Are you sure you want to permanently delete this file?')) return;
  
  try {
    await request(`${API.employees}/${state.selectedEmployeeId}/files/${fileId}`, {
      method: 'DELETE'
    });
    showToast('File deleted successfully', 'success');
    await loadEmployeeFiles(state.selectedEmployeeId);
  } catch (e) {}
}

// Add/Edit Employee profile details
async function openEmployeeModal(empId = null) {
  const form = document.getElementById('employee-form');
  form.reset();
  
  // Hydrate options
  const jobSelect = document.getElementById('emp-jobId-input');
  jobSelect.innerHTML = '<option value="">-- Choose Job --</option>';
  state.jobs.forEach(j => {
    jobSelect.innerHTML += `<option value="${j.id}">${j.name}</option>`;
  });
  
  const depSelect = document.getElementById('emp-depId-input');
  depSelect.innerHTML = '<option value="">-- Choose Department --</option>';
  state.departments.forEach(d => {
    depSelect.innerHTML += `<option value="${d.id}">${d.depName}</option>`;
  });
  
  const userSelect = document.getElementById('emp-userId-input');
  userSelect.innerHTML = '<option value="">None (No System User)</option>';
  state.users.forEach(u => {
    userSelect.innerHTML += `<option value="${u.id}">${u.username || u.fullName || `User ID: ${u.id}`}</option>`;
  });
  
  const docSelect = document.getElementById('emp-doctorId-input');
  docSelect.innerHTML = '<option value="">None (No Doctor Profile)</option>';
  state.doctors.forEach(d => {
    docSelect.innerHTML += `<option value="${d.id}">${d.doctorName || `Doctor ID: ${d.id}`}</option>`;
  });
  
  if (empId) {
    document.getElementById('employee-modal-title').textContent = 'Edit Employee Profile';
    document.getElementById('employee-form-id').value = empId;
    
    // Fetch current details to populate
    try {
      const res = await request(`${API.employees}/${empId}`);
      const emp = res?.data?.employee;
      if (emp) {
        document.getElementById('emp-fullName-input').value = emp.fullName;
        document.getElementById('emp-jobId-input').value = emp.jobId || '';
        document.getElementById('emp-depId-input').value = emp.depId || '';
        document.getElementById('emp-startDate-input').value = emp.startDate;
        document.getElementById('emp-phone-input').value = emp.phoneNumber || '';
        document.getElementById('emp-status-input').value = emp.status;
        document.getElementById('emp-userId-input').value = emp.userId || '';
        document.getElementById('emp-doctorId-input').value = emp.doctorId || '';
        document.getElementById('emp-zktecoId-input').value = emp.zktecoId || '';
        document.getElementById('emp-bank-input').value = emp.bankAccountNumber || '';
        document.getElementById('emp-ssn-input').value = emp.socialSecurityNumber || '';
      }
    } catch (e) { return; }
  } else {
    document.getElementById('employee-modal-title').textContent = 'Add New Employee';
    document.getElementById('employee-form-id').value = '';
    document.getElementById('emp-startDate-input').value = new Date().toISOString().split('T')[0];
  }
  
  openModal('employee-modal');
}

document.getElementById('employee-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const empId = document.getElementById('employee-form-id').value;
  const body = {
    fullName: document.getElementById('emp-fullName-input').value,
    jobId: document.getElementById('emp-jobId-input').value ? parseInt(document.getElementById('emp-jobId-input').value) : null,
    depId: document.getElementById('emp-depId-input').value ? parseInt(document.getElementById('emp-depId-input').value) : null,
    startDate: document.getElementById('emp-startDate-input').value,
    phoneNumber: document.getElementById('emp-phone-input').value || null,
    status: document.getElementById('emp-status-input').value,
    userId: document.getElementById('emp-userId-input').value ? parseInt(document.getElementById('emp-userId-input').value) : null,
    doctorId: document.getElementById('emp-doctorId-input').value ? parseInt(document.getElementById('emp-doctorId-input').value) : null,
    zktecoId: document.getElementById('emp-zktecoId-input').value || null,
    bankAccountNumber: document.getElementById('emp-bank-input').value || null,
    socialSecurityNumber: document.getElementById('emp-ssn-input').value || null,
  };

  try {
    if (empId) {
      await request(`${API.employees}/${empId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      showToast('Employee profile updated', 'success');
    } else {
      await request(API.employees, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('New employee registered successfully', 'success');
    }
    
    closeAllModals();
    await fetchEmployees();
    if (empId) await selectEmployee(empId);
  } catch (err) {}
});

async function archiveEmployee(id) {
  if (!confirm('Are you sure you want to archive this employee? This will update status to deleted.')) return;
  
  try {
    await request(`${API.employees}/${id}`, {
      method: 'DELETE'
    });
    showToast('Employee archived', 'success');
    state.selectedEmployeeId = null;
    elements.detailCard.classList.add('hidden');
    elements.detailPlaceholder.classList.remove('hidden');
    await fetchEmployees();
  } catch (e) {}
}

// ================= VIEW: JOBS CAREER MANAGEMENT =================
function renderJobs() {
  elements.jobsTableBody.innerHTML = '';
  
  if (state.jobs.length === 0) {
    elements.jobsTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center font-muted">No career jobs defined yet. Click 'Create Job Role' to start.</td>
      </tr>
    `;
    return;
  }
  
  state.jobs.forEach(j => {
    const defaults = j.defaultSettings || [];
    let settingsBadges = defaults.map(s => `
      <span class="badge badge-outline">${s.type} (Val: ${s.value})</span>
    `).join(' ') || '<span class="font-muted">No default salary parts</span>';
    
    elements.jobsTableBody.innerHTML += `
      <tr>
        <td><strong>${j.name}</strong></td>
        <td>${j.description || '-'}</td>
        <td><div class="badges-row" style="flex-wrap: wrap;">${settingsBadges}</div></td>
        <td>
          <button class="btn btn-icon btn-secondary edit-job-btn" data-id="${j.id}" title="Edit Position">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-icon btn-danger delete-job-btn" data-id="${j.id}" title="Delete Position">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  });

  // Assign buttons
  elements.jobsTableBody.querySelectorAll('.edit-job-btn').forEach(btn => {
    btn.addEventListener('click', () => openJobModal(parseInt(btn.getAttribute('data-id'))));
  });
  elements.jobsTableBody.querySelectorAll('.delete-job-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteJob(parseInt(btn.getAttribute('data-id'))));
  });
}

function openJobModal(jobId = null) {
  const form = document.getElementById('job-form');
  form.reset();
  
  const container = document.getElementById('job-payment-rows');
  container.innerHTML = '';
  
  if (jobId) {
    document.getElementById('job-modal-title').textContent = 'Edit Job Position';
    document.getElementById('job-form-id').value = jobId;
    
    const job = state.jobs.find(j => j.id === jobId);
    if (job) {
      document.getElementById('job-name-input').value = job.name;
      document.getElementById('job-desc-input').value = job.description || '';
      
      const defaults = job.defaultSettings || [];
      defaults.forEach(d => addPaymentSettingRow(d, container));
    }
  } else {
    document.getElementById('job-modal-title').textContent = 'Create Job Position';
    document.getElementById('job-form-id').value = '';
    addPaymentSettingRow({}, container);
  }
  
  openModal('job-modal');
}

async function handleJobSubmit(e) {
  e.preventDefault();
  
  const jobId = document.getElementById('job-form-id').value;
  const container = document.getElementById('job-payment-rows');
  const rows = container.querySelectorAll('.payment-setting-row');
  
  const defaultSettings = [];
  rows.forEach(row => {
    const type = row.querySelector('.setting-type').value;
    const value = parseFloat(row.querySelector('.setting-value').value) || 0;
    const expectedDays = parseInt(row.querySelector('.setting-expected-days').value) || 30;
    const procSelect = row.querySelector('.setting-procedure-id');
    const procedureId = (type === 'procedure_percentage' && procSelect.value) ? parseInt(procSelect.value) : null;
    const description = row.querySelector('.setting-description').value.trim();
    
    defaultSettings.push({ type, value, expectedDays, procedureId, description });
  });

  const body = {
    name: document.getElementById('job-name-input').value,
    description: document.getElementById('job-desc-input').value || null,
    defaultSettings
  };

  try {
    if (jobId) {
      await request(`${API.jobs}/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });
      showToast('Job position updated', 'success');
    } else {
      await request(API.jobs, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      showToast('New job position created', 'success');
    }
    
    closeAllModals();
    await fetchJobs();
    renderJobs();
  } catch (err) {}
}

async function deleteJob(id) {
  if (!confirm('Are you sure you want to delete this job position?')) return;
  
  try {
    await request(`${API.jobs}/${id}`, {
      method: 'DELETE'
    });
    showToast('Job position deleted', 'success');
    await fetchJobs();
    renderJobs();
  } catch (e) {}
}

// ================= VIEW: LEAVE REQUEST PORTAL =================
async function fetchAndRenderLeaves() {
  elements.leavesTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="text-center font-muted">Loading leave registry...</td>
    </tr>
  `;
  
  const filter = elements.leaveStatusFilter.value;
  let url = API.leaves;
  if (filter !== 'all') {
    url += `?status=${filter}`;
  }
  
  try {
    const res = await request(url);
    const leaves = res?.data?.leaves || [];
    
    elements.leavesTableBody.innerHTML = '';
    if (leaves.length === 0) {
      elements.leavesTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center font-muted">No leave requests found.</td>
        </tr>
      `;
      return;
    }
    
    leaves.forEach(l => {
      let badgeClass = 'badge-outline';
      if (l.status === 'approved') badgeClass = 'badge-success';
      if (l.status === 'rejected') badgeClass = 'badge-danger';
      
      let actionsHtml = '';
      if (l.status === 'pending') {
        actionsHtml = `
          <button class="btn btn-xs btn-primary approve-leave-btn" data-id="${l.id}" title="Approve Request">
            <i class="fa-solid fa-check"></i> Approve
          </button>
          <button class="btn btn-xs btn-danger reject-leave-btn" data-id="${l.id}" title="Reject Request">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
        `;
      } else {
        actionsHtml = `<span class="font-muted">Completed</span>`;
      }
      
      elements.leavesTableBody.innerHTML += `
        <tr>
          <td><strong>${l.employee?.fullName || `Employee ID: ${l.employeeId}`}</strong></td>
          <td><strong>${l.startDate}</strong> to <strong>${l.endDate}</strong></td>
          <td>${l.type}</td>
          <td>${l.reason || '-'}</td>
          <td>${l.paidPercentage}%</td>
          <td>${l.paidDays !== null ? l.paidDays : '-'}</td>
          <td><span class="badge ${badgeClass}">${l.status}</span></td>
          <td>
            <div style="display:flex; gap: 6px;">
              ${actionsHtml}
            </div>
          </td>
        </tr>
      `;
    });

    // Wire actions
    elements.leavesTableBody.querySelectorAll('.approve-leave-btn').forEach(btn => {
      btn.addEventListener('click', () => openLeaveApprovalModal(parseInt(btn.getAttribute('data-id'))));
    });
    
    elements.leavesTableBody.querySelectorAll('.reject-leave-btn').forEach(btn => {
      btn.addEventListener('click', () => updateLeaveStatus(parseInt(btn.getAttribute('data-id')), 'rejected'));
    });
  } catch (e) {
    elements.leavesTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center font-muted">Failed to retrieve leaves board</td>
      </tr>
    `;
  }
}

async function openLeaveRequestModal() {
  const form = document.getElementById('leave-request-form');
  form.reset();
  
  // Hydrate employees option dropdown
  const select = document.getElementById('leave-employeeId-input');
  select.innerHTML = '<option value="">-- Select Employee --</option>';
  
  // Fetch employees list
  try {
    const res = await request(API.employees);
    const employees = res?.data?.employees || [];
    employees.forEach(e => {
      select.innerHTML += `<option value="${e.id}">${e.fullName}</option>`;
    });
  } catch (e) {}

  document.getElementById('leave-startDate-input').value = new Date().toISOString().split('T')[0];
  document.getElementById('leave-endDate-input').value = new Date().toISOString().split('T')[0];
  
  openModal('leave-request-modal');
}

async function handleLeaveRequestSubmit(e) {
  e.preventDefault();
  
  const body = {
    employeeId: parseInt(document.getElementById('leave-employeeId-input').value),
    startDate: document.getElementById('leave-startDate-input').value,
    endDate: document.getElementById('leave-endDate-input').value,
    type: document.getElementById('leave-type-input').value,
    paidPercentage: parseFloat(document.getElementById('leave-paidPercentage-input').value) || 100,
    reason: document.getElementById('leave-reason-input').value.trim()
  };

  try {
    await request(API.leaves, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    
    closeAllModals();
    showToast('Leave request submitted successfully', 'success');
    
    if (state.activeTab === 'leaves') {
      await fetchAndRenderLeaves();
    } else if (state.activeTab === 'employees' && state.selectedEmployeeId === body.employeeId) {
      await loadEmployeeLeaves(body.employeeId);
    }
  } catch (e) {}
}

async function openLeaveApprovalModal(id) {
  // First fetch the leave request object to check if the employee has a schedule
  try {
    const res = await request(API.leaves);
    const leaves = res?.data?.leaves || [];
    const leave = leaves.find(l => l.id === id);
    if (!leave) return;
    
    document.getElementById('leave-approve-id').value = id;
    document.getElementById('leave-approve-pct-input').value = leave.paidPercentage || 100;
    
    // Check if employee has schedule
    const schedRes = await request(`${API.employees}/${leave.employeeId}/schedule`);
    const schedule = schedRes?.data?.schedule || [];
    
    const infoText = document.getElementById('leave-approve-info');
    const daysGrp = document.getElementById('leave-approve-days-group');
    const daysInput = document.getElementById('leave-approve-days-input');
    
    if (schedule.length > 0) {
      infoText.innerHTML = `
        <i class="fa-solid fa-circle-check text-success" style="color:var(--success);"></i> 
        Employee has a schedule configured. The system will <strong>auto-calculate</strong> the paid days (ignoring off-days).
      `;
      daysGrp.classList.add('hidden');
      daysInput.required = false;
      daysInput.value = '';
    } else {
      infoText.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation" style="color:var(--warning);"></i> 
        Employee has <strong>no schedule</strong>. Please enter the number of working days to credit/charge for this leave.
      `;
      daysGrp.classList.remove('hidden');
      daysInput.required = false;
      daysInput.value = '';
    }
    
    openModal('leave-approve-modal');
  } catch (e) {}
}

async function handleLeaveApprovalConfirm(e) {
  e.preventDefault();
  
  const id = document.getElementById('leave-approve-id').value;
  const daysVal = document.getElementById('leave-approve-days-input').value;
  const pctVal = document.getElementById('leave-approve-pct-input').value;
  
  const body = {
    status: 'approved',
    paidPercentage: parseFloat(pctVal) || 100
  };
  
  if (daysVal !== '') {
    body.paidDays = parseFloat(daysVal);
  }

  try {
    await request(`${API.leaves}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
    
    closeAllModals();
    showToast('Leave request approved', 'success');
    await fetchAndRenderLeaves();
  } catch (e) {}
}

async function updateLeaveStatus(id, status) {
  if (status === 'rejected' && !confirm('Are you sure you want to reject this leave request?')) return;
  
  try {
    await request(`${API.leaves}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    showToast(`Leave request ${status}`, 'success');
    await fetchAndRenderLeaves();
  } catch (e) {}
}

// ================= VIEW: PAYROLL CONSOLE =================
async function handleCalculatePayroll() {
  const month = elements.payrollMonthInput.value;
  if (!month) {
    showToast('Please select a reporting month', 'error');
    return;
  }
  
  elements.payrollTableBody.innerHTML = `
    <tr>
      <td colspan="9" class="text-center font-muted"><i class="fa-solid fa-spinner fa-spin"></i> Recalculating salaries from live database...</td>
    </tr>
  `;
  
  try {
    const res = await request(`${API.payroll}?month=${month}`);
    state.payrollMonth = res?.data?.month || month;
    state.payrollSummaries = res?.data?.summaries || [];
    
    renderPayroll();
  } catch (e) {
    elements.payrollTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center font-muted">Failed to retrieve payroll logs</td>
      </tr>
    `;
  }
}

function renderPayroll() {
  elements.payrollTableBody.innerHTML = '';
  
  if (state.payrollSummaries.length === 0) {
    elements.payrollTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center font-muted">No employee summaries generated for this period</td>
      </tr>
    `;
    return;
  }
  
  state.payrollSummaries.forEach(s => {
    const { breakdown, paymentArchive, employeeId, fullName } = s;
    const { fixedSalaryEarned, hourlySalaryEarned, commissionEarned, bonusEarned, totalEarned } = breakdown;
    const { totalPaid, status } = paymentArchive;
    
    let badgeClass = 'badge-outline';
    if (status === 'confirmed') badgeClass = 'badge-outline';
    if (status === 'paid') badgeClass = 'badge-success';
    if (status === 'partially_paid') badgeClass = 'badge-warning';
    
    // Status Action items based on payroll state
    let actionButtons = '';
    
    if (status === 'draft') {
      actionButtons = `
        <button class="btn btn-xs btn-primary confirm-payroll-btn" data-id="${employeeId}">Confirm</button>
        <button class="btn btn-xs btn-secondary adjust-payroll-btn" data-id="${employeeId}">Adjust</button>
      `;
    } else if (status === 'confirmed' || status === 'partially_paid') {
      actionButtons = `
        <button class="btn btn-xs btn-primary pay-payroll-btn" data-id="${employeeId}"><i class="fa-solid fa-coins"></i> Pay</button>
        ${status === 'confirmed' ? `<button class="btn btn-xs btn-danger unlock-payroll-btn" data-id="${employeeId}"><i class="fa-solid fa-lock-open"></i> Unlock</button>` : ''}
      `;
    } else if (status === 'paid') {
      actionButtons = `
        <span class="font-muted">Fulfilled</span>
      `;
    }
    
    elements.payrollTableBody.innerHTML += `
      <tr>
        <td>
          <strong>${fullName}</strong><br>
          <span class="font-muted" style="font-size:0.75rem;">Started: ${s.startDate} • Present: ${s.presentDays}d (Abs: ${s.absences}d)</span>
        </td>
        <td>${fixedSalaryEarned.toLocaleString()} DZD</td>
        <td>${hourlySalaryEarned.toLocaleString()} DZD</td>
        <td>${commissionEarned.toLocaleString()} DZD</td>
        <td>${bonusEarned.toLocaleString()} DZD</td>
        <td><strong>${totalEarned.toLocaleString()} DZD</strong></td>
        <td>${totalPaid.toLocaleString()} DZD</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
        <td>
          <div style="display:flex; gap: 4px; align-items:center;">
            ${actionButtons}
            <button class="btn btn-icon btn-secondary btn-xs view-payroll-audit-btn" data-id="${employeeId}" title="Audit Logs">
              <i class="fa-solid fa-receipt"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  // Wire buttons events
  elements.payrollTableBody.querySelectorAll('.confirm-payroll-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerConfirmPayroll(parseInt(btn.getAttribute('data-id'))));
  });
  
  elements.payrollTableBody.querySelectorAll('.unlock-payroll-btn').forEach(btn => {
    btn.addEventListener('click', () => triggerUnlockPayroll(parseInt(btn.getAttribute('data-id'))));
  });
  
  elements.payrollTableBody.querySelectorAll('.adjust-payroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('adjustment-employee-id').value = btn.getAttribute('data-id');
      document.getElementById('adjustment-month').value = state.payrollMonth;
      openModal('payroll-adjustment-modal');
    });
  });
  
  elements.payrollTableBody.querySelectorAll('.pay-payroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const empId = parseInt(btn.getAttribute('data-id'));
      const summary = state.payrollSummaries.find(s => s.employeeId === empId);
      const balance = (summary.breakdown.totalEarned - summary.paymentArchive.totalPaid);
      
      document.getElementById('payment-employee-id').value = empId;
      document.getElementById('payment-month').value = state.payrollMonth;
      document.getElementById('payment-amount-input').value = balance > 0 ? balance : 0;
      openModal('payroll-payment-modal');
    });
  });

  elements.payrollTableBody.querySelectorAll('.view-payroll-audit-btn').forEach(btn => {
    btn.addEventListener('click', () => openPayrollAuditLogs(parseInt(btn.getAttribute('data-id'))));
  });
}

async function triggerConfirmPayroll(empId) {
  const body = { month: state.payrollMonth };
  if (empId) body.employeeId = empId;

  try {
    await request(`${API.payroll}/confirm`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    showToast(empId ? 'Salary parameters confirmed and frozen' : 'All payroll salaries confirmed', 'success');
    await handleCalculatePayroll();
  } catch (e) {}
}

async function triggerUnlockPayroll(empId) {
  try {
    await request(`${API.payroll}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ employeeId: empId, month: state.payrollMonth })
    });
    showToast('Payroll record unlocked and reverted to draft', 'success');
    await handleCalculatePayroll();
  } catch (e) {}
}

async function handleRecordPaymentSubmit(e) {
  e.preventDefault();
  
  const body = {
    employeeId: parseInt(document.getElementById('payment-employee-id').value),
    month: document.getElementById('payment-month').value,
    paymentAmount: parseFloat(document.getElementById('payment-amount-input').value),
    notes: document.getElementById('payment-notes-input').value.trim()
  };

  try {
    await request(`${API.payroll}/pay`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    closeAllModals();
    showToast('Payment recorded successfully', 'success');
    await handleCalculatePayroll();
  } catch (e) {}
}

async function handleAddAdjustmentSubmit(e) {
  e.preventDefault();
  
  const body = {
    employeeId: parseInt(document.getElementById('adjustment-employee-id').value),
    month: document.getElementById('adjustment-month').value,
    amount: parseFloat(document.getElementById('adjustment-amount-input').value),
    description: document.getElementById('adjustment-desc-input').value.trim()
  };

  try {
    await request(`${API.payroll}/adjustment`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    closeAllModals();
    showToast('Adjustment applied successfully', 'success');
    await handleCalculatePayroll();
  } catch (e) {}
}

async function openPayrollAuditLogs(empId) {
  // Populate general info from state summaries
  const summary = state.payrollSummaries.find(s => s.employeeId === empId);
  if (!summary) return;
  
  document.getElementById('audit-fullName').textContent = summary.fullName;
  document.getElementById('audit-jobTitle').textContent = `Compensation Audit Logs • Month: ${state.payrollMonth}`;
  
  // Render live logic logs
  const logsList = document.getElementById('audit-logs-list');
  logsList.innerHTML = '';
  const logs = summary.breakdown.logs || [];
  if (logs.length === 0) {
    logsList.innerHTML = '<li>No calculation logs logged.</li>';
  } else {
    logs.forEach(l => {
      logsList.innerHTML += `<li>${l}</li>`;
    });
  }

  // Populate payments list
  const payBody = document.getElementById('audit-payments-body');
  payBody.innerHTML = '';
  const payments = summary.paymentArchive?.payments || [];
  if (payments.length === 0) {
    payBody.innerHTML = '<tr><td colspan="3" class="text-center font-muted">No payments recorded yet.</td></tr>';
  } else {
    payments.forEach(p => {
      payBody.innerHTML += `
        <tr>
          <td>${new Date(p.date || p.createdAt).toLocaleString()}</td>
          <td>${p.notes || '-'}</td>
          <td><strong>${p.amount.toLocaleString()} DZD</strong></td>
        </tr>
      `;
    });
  }

  // Populate adjustments list
  const adjBody = document.getElementById('audit-adjustments-body');
  adjBody.innerHTML = '';
  const adjustments = summary.paymentArchive?.adjustments || [];
  if (adjustments.length === 0) {
    adjBody.innerHTML = '<tr><td colspan="3" class="text-center font-muted">No adjustment factors applied.</td></tr>';
  } else {
    adjustments.forEach(a => {
      adjBody.innerHTML += `
        <tr>
          <td>${new Date(a.date || a.createdAt).toLocaleDateString()}</td>
          <td>${a.description || '-'}</td>
          <td><strong>${a.amount.toLocaleString()} DZD</strong></td>
        </tr>
      `;
    });
  }

  // Pull employee payroll history archive
  const histBody = document.getElementById('audit-history-body');
  histBody.innerHTML = '<tr><td colspan="5" class="text-center font-muted">Querying historical ledger...</td></tr>';
  
  try {
    const res = await request(`${API.payroll}/history/${empId}`);
    const history = res?.data?.history || [];
    
    histBody.innerHTML = '';
    if (history.length === 0) {
      histBody.innerHTML = '<tr><td colspan="5" class="text-center font-muted">No historical payroll periods found</td></tr>';
    } else {
      history.forEach(h => {
        let snapText = '-';
        if (h.settingsSnapshot && Array.isArray(h.settingsSnapshot)) {
          snapText = h.settingsSnapshot.map(s => `${s.type}: ${s.value}`).join(' | ');
        }
        
        histBody.innerHTML += `
          <tr>
            <td><strong>${h.month}</strong></td>
            <td>${h.totalEarned.toLocaleString()} DZD</td>
            <td>${h.totalPaid.toLocaleString()} DZD</td>
            <td style="font-size:0.75rem;" class="font-muted">${snapText}</td>
            <td><span class="badge ${h.status === 'paid' ? 'badge-success' : 'badge-warning'}">${h.status}</span></td>
          </tr>
        `;
      });
    }
  } catch (e) {
    histBody.innerHTML = '<tr><td colspan="5" class="text-center font-muted text-danger">Failed to retrieve history ledger</td></tr>';
  }

  openModal('payroll-audit-modal');
}

// ================= VIEW: ZKTECO HARDWARE PANEL =================
async function triggerZktecoSync() {
  elements.zktecoConsole.textContent = 'Contacting biometric hardware terminal...\n';
  showToast('Initializing ZKTeco device synchronization...', 'info');
  
  try {
    const res = await request(`${API.zkteco}/sync`, {
      method: 'POST'
    });
    
    elements.zktecoConsole.textContent += JSON.stringify(res, null, 2);
    showToast('Biometric attendance logs synced successfully', 'success');
    elements.statsSyncTime.innerHTML = `<i class="fa-solid fa-history"></i> Just synced`;
  } catch (err) {
    elements.zktecoConsole.textContent += `Sync Failure: ${err.message}`;
  }
}

async function queryZktecoUsers() {
  elements.zktecoConsole.textContent = 'Querying users list on terminal...\n';
  elements.zktecoUsersBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center font-muted"><i class="fa-solid fa-spinner fa-spin"></i> Polling hardware registered users...</td>
    </tr>
  `;
  
  try {
    const res = await request(`${API.zkteco}/device-users`);
    elements.zktecoConsole.textContent += `Retrieved users list successfully.\n`;
    
    elements.zktecoUsersBody.innerHTML = '';
    const users = res?.data || res || [];
    
    if (users.length === 0) {
      elements.zktecoUsersBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center font-muted">No users found configured on this hardware</td>
        </tr>
      `;
      return;
    }
    
    users.forEach(u => {
      elements.zktecoUsersBody.innerHTML += `
        <tr>
          <td>${u.uid || '-'}</td>
          <td><strong>${u.userId || u.id || '-'}</strong></td>
          <td>${u.name || '-'}</td>
          <td>${u.role || '-'}</td>
          <td>${u.cardno || '-'}</td>
        </tr>
      `;
    });
  } catch (err) {
    elements.zktecoConsole.textContent += `Failed to query terminal users: ${err.message}`;
    elements.zktecoUsersBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger">Error retrieving users. Check console.</td>
      </tr>`;
  }
}

// ================= SIMULATE ZKTECO SCAN =================
async function populateSimulateDropdown() {
  if (!elements.simulateZktecoId) return;
  elements.simulateZktecoId.innerHTML = '<option value="">Loading...</option>';
  
  if (!state.employees || state.employees.length === 0) {
    try {
      const res = await request(API.employees);
      state.employees = res?.data?.employees || [];
    } catch (err) {
      state.employees = [];
    }
  }

  elements.simulateZktecoId.innerHTML = '<option value="">-- Select Employee --</option>';
  
  const validEmployees = state.employees.filter(e => e.status === 'active' && e.zktecoId);
  
  validEmployees.forEach(emp => {
    const option = document.createElement('option');
    option.value = emp.zktecoId;
    option.textContent = `${emp.fullName} (ID: ${emp.zktecoId})`;
    elements.simulateZktecoId.appendChild(option);
  });
}

async function simulateZktecoScan(e) {
  e.preventDefault();
  const zktecoId = elements.simulateZktecoId.value;
  const punchType = elements.simulatePunchType?.value || 'I';
  const timestamp = elements.simulateTimestamp.value;
  
  if (!zktecoId || !timestamp) {
    return showToast('Please select an employee and time', 'error');
  }

  elements.zktecoConsole.textContent = `Simulating scan for ZKTeco ID: ${zktecoId} at ${timestamp}...\n`;
  showToast('Simulating biometric scan...', 'info');

  try {
    const res = await request(`${API.zkteco}/simulate`, {
      method: 'POST',
      body: JSON.stringify({ zktecoId, punchType, timestamp })
    });
    showToast('Scan simulated successfully!', 'success');
    elements.zktecoConsole.textContent += JSON.stringify(res, null, 2);
    elements.zktecoConsole.textContent += '\n\n** Please click "Synchronize Attendance Logs" to process this scan. **\n';
  } catch (err) {
    showToast('Failed to simulate scan', 'error');
    elements.zktecoConsole.textContent += `Simulation Failure: ${err.message}\n`;
  }
}
