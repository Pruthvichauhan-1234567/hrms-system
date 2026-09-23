import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { StatsMetric } from '../../components/ui/StatsMetric';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function LeaveDashboardPage({ onNavigate, currentUser }) {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    employee: '',
    leave_type: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    days_count: 1.0,
    reason: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqData, typeData, empData] = await Promise.all([
        api.getLeaveRequests(),
        api.getLeaveTypes(),
        api.getEmployees(),
      ]);
      setRequests(reqData || []);
      setLeaveTypes(typeData || []);
      setEmployees(empData || []);

      if (empData?.length > 0 && !formData.employee) {
        setFormData((p) => ({
          ...p,
          employee: currentUser?.id || empData[0].id,
          leave_type: typeData[0]?.id || '',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.createLeaveRequest(formData);
      addToast({ title: 'Leave Submitted', message: 'Your leave application has been submitted for manager review', type: 'success' });
      setIsApplyModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({ title: 'Application Error', message: err.message, type: 'error' });
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;

  const columns = [
    {
      key: 'employee_name',
      label: 'Applicant',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} src={row.avatar_url} size="sm" />
          <div>
            <div className="text-xs font-bold text-slate-900">{val}</div>
            <div className="text-[10px] text-slate-500">{row.department_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type_name',
      label: 'Leave Category',
      sortable: true,
      render: (val, row) => (
        <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {val}
        </span>
      ),
    },
    {
      key: 'start_date',
      label: 'Duration',
      render: (val, row) => (
        <div>
          <div className="font-mono text-xs text-slate-800 font-bold">{val} to {row.end_date}</div>
          <div className="text-[11px] text-slate-500">{row.days_count} business day(s)</div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (val) => <span className="text-xs text-slate-600 line-clamp-1 italic">"{val}"</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Leave Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor company leave utilization, balance quotas, and pending manager approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('leave/requests')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
          >
            Review Approvals Tray ({pendingCount})
          </button>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsMetric
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting manager action"
          icon={Clock}
          accentColor="amber"
          badge="Action Needed"
        />
        <StatsMetric
          title="Approved This Month"
          value={approvedCount}
          subtitle="Processed leave days"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatsMetric
          title="Leave Types Configured"
          value={leaveTypes.length}
          subtitle="CL, SL, EL, WFH, LWP"
          icon={CalendarDays}
          accentColor="indigo"
        />
      </div>

      {/* Leave Types Policy Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Enterprise Leave Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {leaveTypes.map((lt) => (
            <div key={lt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="font-bold text-slate-900">{lt.name}</div>
              <div className="text-[11px] text-indigo-600 font-mono font-semibold mt-0.5">
                {lt.days_allowed_per_year} days / year
              </div>
              <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">{lt.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Leave Requests */}
      <DataTable
        columns={columns}
        data={requests}
        searchKey="employee_name"
        searchPlaceholder="Search leave requests..."
        isLoading={loading}
      />

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply For Leave"
        subtitle="Submit time-off request with category and dates."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
              <select
                required
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.emp_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Leave Category *</label>
              <select
                required
                value={formData.leave_type}
                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {leaveTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Days Count</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formData.days_count}
                onChange={(e) => setFormData({ ...formData, days_count: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason for Leave *</label>
            <textarea
              rows={3}
              required
              placeholder="State reason for leave and handoff coverage plan..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
