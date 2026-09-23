import React, { useState, useEffect } from 'react';
import {
  Users,
  CalendarCheck,
  Clock,
  Briefcase,
  Calendar,
  Gift,
  Check,
  X,
  ChevronRight,
  Plus,
  Building2,
  DollarSign
} from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';

export function DashboardPage({ currentRole, onNavigate, onOpenAddEmployee }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApproveLeave = async (id, empName) => {
    try {
      await api.approveLeaveRequest(id, 'Approved via dashboard');
      addToast({
        title: 'Leave Approved',
        message: `Approved leave request for ${empName}`,
        type: 'success',
      });
      fetchStats();
    } catch (err) {
      addToast({ title: 'Approval Failed', message: err.message, type: 'error' });
    }
  };

  const handleRejectLeave = async (id, empName) => {
    try {
      await api.rejectLeaveRequest(id, 'Rejected due to project deadlines');
      addToast({
        title: 'Leave Rejected',
        message: `Rejected leave request for ${empName}`,
        type: 'info',
      });
      fetchStats();
    } catch (err) {
      addToast({ title: 'Action Failed', message: err.message, type: 'error' });
    }
  };

  if (loading || !data) {
    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-20 rounded-xl bg-gray-200/60 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-200/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const {
    overview,
    pending_leaves = [],
    recruitment_funnel = {},
    upcoming_interviews = [],
    payroll_summary = {},
    upcoming_birthdays = [],
    upcoming_holidays = [],
    department_distribution = [],
  } = data;

  const todayFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Clean Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Overview
            </h1>
            <span className="text-xs text-gray-500 font-medium px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200">
              {todayFormatted}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time operations across workforce attendance, hiring pipelines, and payroll.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {['SUPER_ADMIN', 'HR_ADMIN'].includes(currentRole) && (
            <button
              onClick={() => onNavigate('employees/add')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg bg-[#3B4CCA] hover:bg-[#313FA8] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('leave/requests')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Apply Leave</span>
          </button>
          <button
            onClick={() => onNavigate('attendance/roster')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Daily Attendance</span>
          </button>
        </div>
      </div>

      {/* 2. Structured Metric Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total Workforce</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">
            {overview.total_employees}
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {overview.active_employees} active • {overview.on_probation} on probation
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Attendance Today</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">
            {overview.attendance_rate}%
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {overview.present_today} on campus • {overview.wfh_today} remote
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Pending Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">
            {overview.pending_leaves_count}
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            Leave & regularizations pending
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Open Requisitions</span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">
            {overview.open_jobs_count}
          </div>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            {overview.total_candidates} candidates in pipeline
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Attendance Compliance & Pending Approvals & Departments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Compliance Live Snapshot */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Attendance Compliance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Live breakdown across all office locations</p>
              </div>
              <button
                onClick={() => onNavigate('attendance/roster')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B4CCA] hover:underline cursor-pointer"
              >
                <span>Full Roster</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Present</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{overview.present_today}</div>
                <span className="text-[11px] text-gray-500">On-Site</span>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">WFH</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{overview.wfh_today}</div>
                <span className="text-[11px] text-gray-500">Remote</span>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Late</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{overview.late_today}</div>
                <span className="text-[11px] text-gray-500">Grace past</span>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">On Leave</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{overview.on_leave_today}</div>
                <span className="text-[11px] text-gray-500">Approved</span>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80 text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">Absent</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{overview.absent_today}</div>
                <span className="text-[11px] text-gray-500">Unexcused</span>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-600 mb-1.5 font-medium">
                <span>Compliance Rate</span>
                <span className="font-semibold text-gray-900">{overview.attendance_rate}% Target Achieved</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden flex">
                <div style={{ width: `${overview.attendance_rate}%` }} className="bg-[#3B4CCA] rounded-full" />
              </div>
            </div>
          </div>

          {/* Pending Leave Requests Approval Tray */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Pending Leave Approvals</h3>
                <p className="text-xs text-gray-500 mt-0.5">Requests awaiting review and action</p>
              </div>
              <button
                onClick={() => onNavigate('leave/requests')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B4CCA] hover:underline cursor-pointer"
              >
                <span>View All ({overview.pending_leaves_count})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100 mt-1">
              {pending_leaves.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No pending leave requests at this time.
                </div>
              ) : (
                pending_leaves.map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={req.employee_name} src={req.employee_avatar} size="md" />
                      <div>
                        <div className="text-xs font-semibold text-gray-900">{req.employee_name}</div>
                        <div className="text-[11px] text-gray-500">
                          {req.department} • <span className="font-medium text-gray-800">{req.leave_type}</span> ({req.days} days)
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5 max-w-sm truncate">
                          "{req.reason}"
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveLeave(req.id, req.employee_name)}
                        className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md border border-green-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Approve Request"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectLeave(req.id, req.employee_name)}
                        className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Reject Request"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Department Headcount Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Headcount by Department</h3>
                <p className="text-xs text-gray-500 mt-0.5">Resource distribution across functional teams</p>
              </div>
              <button
                onClick={() => onNavigate('organization/departments')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3B4CCA] hover:underline cursor-pointer"
              >
                <span>Manage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {department_distribution.map((dept) => (
                <div key={dept.code} className="p-3 rounded-lg bg-gray-50 border border-gray-200/80">
                  <div className="text-xs font-medium text-gray-600 truncate">{dept.name}</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {dept.count} <span className="text-xs font-normal text-gray-500">members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Hiring Funnel, Payroll Status, Birthdays & Holidays */}
        <div className="space-y-6">
          {/* Recruitment Funnel Widget */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Hiring Pipeline</h3>
              <button
                onClick={() => onNavigate('recruitment/pipeline')}
                className="text-xs font-semibold text-[#3B4CCA] hover:underline cursor-pointer"
              >
                Kanban View
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {Object.entries(recruitment_funnel).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">{stage}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, count * 20)}%` }}
                        className="h-full bg-[#3B4CCA] rounded-full"
                      />
                    </div>
                    <span className="font-semibold text-gray-900 w-4 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Interviews */}
            {upcoming_interviews.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Upcoming Interviews
                </div>
                {upcoming_interviews.map((inv) => (
                  <div key={inv.id} className="p-2.5 rounded-lg bg-gray-50 border border-gray-200/80 text-xs">
                    <div className="font-semibold text-gray-900">{inv.candidate_name}</div>
                    <div className="text-[11px] text-gray-500">{inv.position} • {inv.interview_type}</div>
                    <div className="text-[11px] font-medium text-gray-600 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{inv.time} with {inv.interviewer}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payroll Summary Widget */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Current Payroll</h3>
              </div>
              <StatusBadge status={payroll_summary.status || 'Calculated'} />
            </div>

            <div className="mt-3 space-y-1">
              <div className="text-xs text-gray-500">{payroll_summary.title}</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{Number(payroll_summary.total_disbursement || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-gray-500">Calculated net salary payout</div>
            </div>

            <button
              onClick={() => onNavigate('payroll/dashboard')}
              className="mt-4 w-full py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            >
              Open Payroll Console
            </button>
          </div>

          {/* Upcoming Holidays & Celebrations */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
            {/* Holidays */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Upcoming Holidays (2026)</span>
              </div>
              <div className="space-y-2">
                {upcoming_holidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-gray-50 border border-gray-100">
                    <div>
                      <div className="font-medium text-gray-800">{h.name}</div>
                      <div className="text-[11px] text-gray-500">{h.day}</div>
                    </div>
                    <span className="font-mono text-gray-600 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200">
                      {h.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Birthdays */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 mb-2">
                <Gift className="w-4 h-4 text-gray-500" />
                <span>Upcoming Celebrations</span>
              </div>
              <div className="space-y-2">
                {upcoming_birthdays.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar name={b.name} src={b.avatar} size="sm" />
                      <div>
                        <div className="font-medium text-gray-800">{b.name}</div>
                        <div className="text-[10px] text-gray-500">{b.department}</div>
                      </div>
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">{b.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

