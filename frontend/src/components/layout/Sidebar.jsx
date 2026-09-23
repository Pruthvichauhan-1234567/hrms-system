import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  TrendingUp,
  FileText,
  Laptop,
  Bell,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  UserPlus,
  GitBranch,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  Award,
  ShieldCheck,
  X
} from 'lucide-react';

export function Sidebar({
  currentPath = 'dashboard',
  onNavigate,
  currentRole = 'SUPER_ADMIN',
  isMobileOpen = false,
  onCloseMobile,
}) {
  const [openGroups, setOpenGroups] = useState({
    employees: true,
    organization: true,
    recruitment: false,
    attendance: false,
    leave: false,
    payroll: false,
    performance: false,
    settings: false,
  });

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 13 Primary Navigation Modules with role-based filtering
  const navigationSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: 'dashboard',
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: Users,
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'],
      subItems: [
        { label: 'All Employees', path: 'employees/list' },
        { label: 'Employee Directory', path: 'employees/directory' },
        { label: 'Add Employee', path: 'employees/add' },
      ],
    },
    {
      id: 'organization',
      label: 'Organization',
      icon: Building2,
      roles: ['SUPER_ADMIN', 'HR_ADMIN'],
      subItems: [
        { label: 'Departments', path: 'organization/departments' },
        { label: 'Designations', path: 'organization/designations' },
        { label: 'Locations', path: 'organization/locations' },
        { label: 'Teams', path: 'organization/teams' },
        { label: 'Org Hierarchy Tree', path: 'organization/hierarchy' },
      ],
    },
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: Briefcase,
      roles: ['SUPER_ADMIN', 'HR_ADMIN'],
      subItems: [
        { label: 'Job Openings', path: 'recruitment/jobs' },
        { label: 'Hiring Pipeline (Kanban)', path: 'recruitment/pipeline' },
        { label: 'Interviews & Feedback', path: 'recruitment/interviews' },
      ],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
      subItems: [
        { label: 'Daily Attendance Roster', path: 'attendance/roster' },
        { label: 'Monthly Matrix & Calendar', path: 'attendance/calendar' },
        { label: 'Shifts & Rules', path: 'attendance/shifts' },
        { label: 'Holiday Calendar', path: 'attendance/holidays' },
      ],
    },
    {
      id: 'leave',
      label: 'Leave Management',
      icon: CalendarDays,
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
      subItems: [
        { label: 'Leave Dashboard', path: 'leave/dashboard' },
        { label: 'Leave Requests & Approvals', path: 'leave/requests' },
        { label: 'Leave Balances & Types', path: 'leave/balances' },
      ],
    },
    {
      id: 'payroll',
      label: 'Payroll Operations',
      icon: CircleDollarSign,
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'EMPLOYEE'],
      subItems: [
        { label: 'Payroll Dashboard', path: 'payroll/dashboard' },
        { label: 'Process Monthly Payroll', path: 'payroll/processing' },
        { label: 'Payslips & Breakdown', path: 'payroll/payslips' },
      ],
    },
    {
      id: 'performance',
      label: 'Performance & OKRs',
      icon: TrendingUp,
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
      subItems: [
        { label: 'Goals & OKR Tracker', path: 'performance/goals' },
        { label: '360° Review Cycles', path: 'performance/reviews' },
      ],
    },
    {
      id: 'documents',
      label: 'Document Repository',
      icon: FileText,
      path: 'documents',
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      id: 'assets',
      label: 'Asset Management',
      icon: Laptop,
      path: 'assets',
      roles: ['SUPER_ADMIN', 'HR_ADMIN'],
    },
    {
      id: 'notifications',
      label: 'Notification Center',
      icon: Bell,
      path: 'notifications',
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: BarChart3,
      path: 'reports',
      roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'],
    },
    {
      id: 'settings',
      label: 'Settings & Security',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'HR_ADMIN'],
      subItems: [
        { label: 'Company Profile', path: 'settings/company' },
        { label: 'Role Permissions & RBAC', path: 'settings/roles' },
        { label: 'Working Schedules & Policies', path: 'settings/policies' },
      ],
    },
  ];

  // Filter sections by current user role
  const allowedSections = navigationSections.filter(
    (sec) => !sec.roles || sec.roles.includes(currentRole)
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white/95 text-gray-700 select-none border-r border-gray-200/80">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-gray-200/80 bg-white/70">
        <div
          onClick={() => {
            onNavigate('dashboard');
            if (onCloseMobile) onCloseMobile();
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#3B4CCA] flex items-center justify-center text-white font-bold shadow-2xs">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
              PeoplePulse
              <span className="text-[10px] font-semibold tracking-wide bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Enterprise Workforce OS</div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-xs font-medium">
        <div className="px-3 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          Enterprise Operations
        </div>

        {allowedSections.map((sec) => {
          const Icon = sec.icon;
          const hasSub = sec.subItems && sec.subItems.length > 0;
          const isGroupOpen = openGroups[sec.id];
          const isCurrentSec =
            currentPath === sec.path ||
            (sec.subItems && sec.subItems.some((s) => s.path === currentPath));

          return (
            <div key={sec.id} className="space-y-0.5">
              {hasSub ? (
                <div>
                  <button
                    onClick={() => toggleGroup(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      isCurrentSec
                        ? 'bg-gray-100/90 text-gray-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isCurrentSec ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className="text-xs">{sec.label}</span>
                    </div>
                    {isGroupOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>

                  {isGroupOpen && (
                    <div className="ml-4 pl-3 border-l border-gray-200 py-1 space-y-1">
                      {sec.subItems.map((sub) => {
                        const isSubActive = currentPath === sub.path;
                        return (
                          <button
                            key={sub.path}
                            onClick={() => {
                              onNavigate(sub.path);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left cursor-pointer ${
                              isSubActive
                                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-2xs'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <span>{sub.label}</span>
                            {isSubActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    onNavigate(sec.path);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                    currentPath === sec.path
                      ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60 shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${currentPath === sec.path ? 'text-indigo-600' : 'text-gray-400'}`} />
                  <span className="text-xs">{sec.label}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-gray-200/80 bg-gray-50/50 text-[11px] text-gray-500">
        <div className="flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-700 font-medium">Django API Connected</span>
          </div>
          <span className="text-gray-400 font-mono text-[10px]">v1.4.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
