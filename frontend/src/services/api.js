// PeoplePulse Enterprise REST API Client

const API_HOST = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${API_HOST}/api/v1`;

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Core & Dashboard
  getDashboardStats: () => request('/core/dashboard-stats/'),
  getOrgTree: () => request('/core/org-tree/'),
  globalSearch: (q) => request(`/core/global-search/?q=${encodeURIComponent(q)}`),
  getCompanySettings: () => request('/core/settings/'),
  updateCompanySettings: (id, data) => request(`/core/settings/${id}/`, { method: 'PATCH', body: data }),
  getNotifications: () => request('/core/notifications/'),
  markNotificationsRead: () => request('/core/notifications/mark_all_read/', { method: 'POST' }),

  // Organization
  getDepartments: () => request('/core/departments/'),
  createDepartment: (data) => request('/core/departments/', { method: 'POST', body: data }),
  updateDepartment: (id, data) => request(`/core/departments/${id}/`, { method: 'PUT', body: data }),
  deleteDepartment: (id) => request(`/core/departments/${id}/`, { method: 'DELETE' }),

  getDesignations: () => request('/core/designations/'),
  createDesignation: (data) => request('/core/designations/', { method: 'POST', body: data }),
  updateDesignation: (id, data) => request(`/core/designations/${id}/`, { method: 'PUT', body: data }),
  deleteDesignation: (id) => request(`/core/designations/${id}/`, { method: 'DELETE' }),

  getLocations: () => request('/core/locations/'),
  createLocation: (data) => request('/core/locations/', { method: 'POST', body: data }),
  getTeams: () => request('/core/teams/'),
  createTeam: (data) => request('/core/teams/', { method: 'POST', body: data }),

  // Employees
  getEmployees: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.department && params.department !== 'All') searchParams.append('department', params.department);
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.employment_type && params.employment_type !== 'All') searchParams.append('employment_type', params.employment_type);
    const qs = searchParams.toString();
    return request(`/employees/${qs ? `?${qs}` : ''}`);
  },
  getEmployeeDetail: (id) => request(`/employees/${id}/`),
  getEmployeeFullProfile: (id) => request(`/employees/${id}/full_profile/`),
  createEmployee: (data) => request('/employees/', { method: 'POST', body: data }),
  updateEmployee: (id, data) => request(`/employees/${id}/`, { method: 'PATCH', body: data }),
  deleteEmployee: (id) => request(`/employees/${id}/`, { method: 'DELETE' }),

  // Recruitment
  getJobOpenings: () => request('/recruitment/jobs/'),
  createJobOpening: (data) => request('/recruitment/jobs/', { method: 'POST', body: data }),
  updateJobOpening: (id, data) => request(`/recruitment/jobs/${id}/`, { method: 'PATCH', body: data }),
  deleteJobOpening: (id) => request(`/recruitment/jobs/${id}/`, { method: 'DELETE' }),

  getCandidates: () => request('/recruitment/candidates/'),
  createCandidate: (data) => request('/recruitment/candidates/', { method: 'POST', body: data }),
  updateCandidateStage: (id, stage) => request(`/recruitment/candidates/${id}/update_stage/`, { method: 'POST', body: { stage } }),
  deleteCandidate: (id) => request(`/recruitment/candidates/${id}/`, { method: 'DELETE' }),

  getInterviews: () => request('/recruitment/interviews/'),
  createInterview: (data) => request('/recruitment/interviews/', { method: 'POST', body: data }),

  // Attendance
  getAttendanceRecords: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/attendance/records/${qs ? `?${qs}` : ''}`);
  },
  recordPunch: (data) => request('/attendance/records/punch/', { method: 'POST', body: data }),
  getShifts: () => request('/attendance/shifts/'),
  createShift: (data) => request('/attendance/shifts/', { method: 'POST', body: data }),
  getHolidays: () => request('/attendance/holidays/'),
  createHoliday: (data) => request('/attendance/holidays/', { method: 'POST', body: data }),
  getAttendanceCorrections: () => request('/attendance/corrections/'),
  createAttendanceCorrection: (data) => request('/attendance/corrections/', { method: 'POST', body: data }),

  // Leaves
  getLeaveTypes: () => request('/leaves/types/'),
  createLeaveType: (data) => request('/leaves/types/', { method: 'POST', body: data }),
  getLeaveBalances: (empId) => request(`/leaves/balances/${empId ? `?employee_id=${empId}` : ''}`),
  getLeaveRequests: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/leaves/requests/${qs ? `?${qs}` : ''}`);
  },
  createLeaveRequest: (data) => request('/leaves/requests/', { method: 'POST', body: data }),
  approveLeaveRequest: (id, remarks) => request(`/leaves/requests/${id}/approve/`, { method: 'POST', body: { remarks } }),
  rejectLeaveRequest: (id, remarks) => request(`/leaves/requests/${id}/reject/`, { method: 'POST', body: { remarks } }),

  // Payroll
  getPayrollRuns: () => request('/payroll/runs/'),
  processMonthlyPayroll: (data) => request('/payroll/runs/process_month/', { method: 'POST', body: data }),
  disbursePayrollRun: (id) => request(`/payroll/runs/${id}/approve_and_disburse/`, { method: 'POST' }),
  getPayslips: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/payroll/payslips/${qs ? `?${qs}` : ''}`);
  },
  getPayslipDetail: (id) => request(`/payroll/payslips/${id}/`),

  // Performance
  getPerformanceCycles: () => request('/performance/cycles/'),
  createPerformanceCycle: (data) => request('/performance/cycles/', { method: 'POST', body: data }),
  getGoals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/performance/goals/${qs ? `?${qs}` : ''}`);
  },
  createGoal: (data) => request('/performance/goals/', { method: 'POST', body: data }),
  updateGoalProgress: (id, progress) => request(`/performance/goals/${id}/update_progress/`, { method: 'POST', body: { progress } }),
  getPerformanceReviews: (empId) => request(`/performance/reviews/${empId ? `?employee_id=${empId}` : ''}`),
  createPerformanceReview: (data) => request('/performance/reviews/', { method: 'POST', body: data }),

  // Documents
  getDocuments: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/documents/${qs ? `?${qs}` : ''}`);
  },
  createDocument: (data) => request('/documents/', { method: 'POST', body: data }),
  deleteDocument: (id) => request(`/documents/${id}/`, { method: 'DELETE' }),

  // Assets
  getAssets: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/assets/inventory/${qs ? `?${qs}` : ''}`);
  },
  createAsset: (data) => request('/assets/inventory/', { method: 'POST', body: data }),
  updateAsset: (id, data) => request(`/assets/inventory/${id}/`, { method: 'PATCH', body: data }),
  deleteAsset: (id) => request(`/assets/inventory/${id}/`, { method: 'DELETE' }),
  assignAsset: (id, employeeId) => request(`/assets/inventory/${id}/assign/`, { method: 'POST', body: { employee_id: employeeId } }),
  returnAsset: (id) => request(`/assets/inventory/${id}/return_asset/`, { method: 'POST' }),
  getMaintenanceRecords: () => request('/assets/maintenance/'),
  createMaintenanceRecord: (data) => request('/assets/maintenance/', { method: 'POST', body: data }),
};
