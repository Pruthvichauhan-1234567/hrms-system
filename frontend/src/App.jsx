import React, { useState, useEffect } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/ui/GlobalSearchModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesListPage } from './pages/employees/EmployeesListPage';
import { EmployeeProfilePage } from './pages/employees/EmployeeProfilePage';
import { EmployeeDirectoryPage } from './pages/employees/EmployeeDirectoryPage';
import { AddEditEmployeeModal } from './pages/employees/AddEditEmployeeModal';

import { DepartmentsPage } from './pages/organization/DepartmentsPage';
import { DesignationsPage } from './pages/organization/DesignationsPage';
import { LocationsPage } from './pages/organization/LocationsPage';
import { TeamsPage } from './pages/organization/TeamsPage';
import { OrgHierarchyPage } from './pages/organization/OrgHierarchyPage';

import { JobOpeningsPage } from './pages/recruitment/JobOpeningsPage';
import { HiringPipelinePage } from './pages/recruitment/HiringPipelinePage';
import { InterviewsPage } from './pages/recruitment/InterviewsPage';

import { AttendanceRosterPage } from './pages/attendance/AttendanceRosterPage';
import { AttendanceCalendarPage } from './pages/attendance/AttendanceCalendarPage';
import { ShiftsPage } from './pages/attendance/ShiftsPage';
import { HolidaysPage } from './pages/attendance/HolidaysPage';

import { LeaveDashboardPage } from './pages/leaves/LeaveDashboardPage';
import { LeaveRequestsPage } from './pages/leaves/LeaveRequestsPage';
import { LeaveBalancesPage } from './pages/leaves/LeaveBalancesPage';

import { PayrollDashboardPage } from './pages/payroll/PayrollDashboardPage';
import { PayslipsPage } from './pages/payroll/PayslipsPage';

import { GoalsPage } from './pages/performance/GoalsPage';
import { ReviewsPage } from './pages/performance/ReviewsPage';

import { DocumentsPage } from './pages/documents/DocumentsPage';
import { AssetsPage } from './pages/assets/AssetsPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

import { api } from './services/api';

function AppContent() {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('SUPER_ADMIN'); // 'SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Employee Modal & Profile Navigation state
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);

  const fetchInitialData = async () => {
    try {
      const [notifs, emps] = await Promise.all([
        api.getNotifications(),
        api.getEmployees(),
      ]);
      setNotifications(notifs || []);
      if (emps?.length > 0) {
        setCurrentUser(emps[0]); // Default to first employee (CTO / Admin)
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleNavigate = (path) => {
    if (path.startsWith('/employees/')) {
      const id = path.replace('/employees/', '');
      setViewingProfileId(id);
      setCurrentPath('employees/profile');
      return;
    }
    if (path === 'employees/add') {
      setEditingEmployee(null);
      setIsAddEmployeeOpen(true);
      return;
    }
    setViewingProfileId(null);
    setCurrentPath(path);
  };

  const handleViewProfile = (empId) => {
    setViewingProfileId(empId);
    setCurrentPath('employees/profile');
  };

  const handleEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setIsAddEmployeeOpen(true);
  };

  // Render current view component
  const renderCurrentView = () => {
    // 360 Employee Profile View
    if (currentPath === 'employees/profile' && viewingProfileId) {
      return (
        <EmployeeProfilePage
          employeeId={viewingProfileId}
          onBack={() => setCurrentPath('employees/list')}
          onEdit={(emp) => handleEditEmployee(emp)}
        />
      );
    }

    switch (currentPath) {
      case 'dashboard':
        return (
          <DashboardPage
            currentRole={currentRole}
            onNavigate={handleNavigate}
            onOpenAddEmployee={() => {
              setEditingEmployee(null);
              setIsAddEmployeeOpen(true);
            }}
          />
        );

      // Employees
      case 'employees/list':
        return (
          <EmployeesListPage
            onNavigate={handleNavigate}
            onOpenAdd={() => {
              setEditingEmployee(null);
              setIsAddEmployeeOpen(true);
            }}
            onEditEmployee={handleEditEmployee}
            onViewProfile={handleViewProfile}
          />
        );
      case 'employees/directory':
        return (
          <EmployeeDirectoryPage
            onViewProfile={handleViewProfile}
            onBack={() => setCurrentPath('employees/list')}
          />
        );

      // Organization
      case 'organization/departments':
        return <DepartmentsPage />;
      case 'organization/designations':
        return <DesignationsPage />;
      case 'organization/locations':
        return <LocationsPage />;
      case 'organization/teams':
        return <TeamsPage />;
      case 'organization/hierarchy':
        return <OrgHierarchyPage onViewProfile={handleViewProfile} />;

      // Recruitment
      case 'recruitment/jobs':
        return <JobOpeningsPage onNavigate={handleNavigate} />;
      case 'recruitment/pipeline':
        return <HiringPipelinePage />;
      case 'recruitment/interviews':
        return <InterviewsPage />;

      // Attendance
      case 'attendance/roster':
        return <AttendanceRosterPage />;
      case 'attendance/calendar':
        return <AttendanceCalendarPage />;
      case 'attendance/shifts':
        return <ShiftsPage />;
      case 'attendance/holidays':
        return <HolidaysPage />;

      // Leaves
      case 'leave/dashboard':
        return (
          <LeaveDashboardPage
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        );
      case 'leave/requests':
        return <LeaveRequestsPage />;
      case 'leave/balances':
        return <LeaveBalancesPage />;

      // Payroll
      case 'payroll/dashboard':
      case 'payroll/processing':
        return <PayrollDashboardPage onNavigate={handleNavigate} />;
      case 'payroll/payslips':
        return <PayslipsPage />;

      // Performance
      case 'performance/goals':
        return <GoalsPage currentUser={currentUser} />;
      case 'performance/reviews':
        return <ReviewsPage />;

      // Documents, Assets, Notifications, Reports, Settings
      case 'documents':
        return <DocumentsPage />;
      case 'assets':
        return <AssetsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings/company':
      case 'settings/roles':
      case 'settings/policies':
      case 'settings':
        return <SettingsPage currentRole={currentRole} />;

      default:
        return (
          <DashboardPage
            currentRole={currentRole}
            onNavigate={handleNavigate}
            onOpenAddEmployee={() => {
              setEditingEmployee(null);
              setIsAddEmployeeOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        currentRole={currentRole}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          currentUser={currentUser}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          notifications={notifications}
          onRefreshNotifications={fetchInitialData}
        />

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto pb-16">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Command Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Add / Edit Employee Stepper Modal */}
      <AddEditEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        employee={editingEmployee}
        onSaved={fetchInitialData}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
