import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function LeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getLeaveRequests();
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id, empName) => {
    try {
      await api.approveLeaveRequest(id, 'Approved by manager');
      addToast({ title: 'Leave Approved', message: `Approved leave for ${empName}`, type: 'success' });
      fetchRequests();
    } catch (err) {
      addToast({ title: 'Approval Failed', message: err.message, type: 'error' });
    }
  };

  const handleReject = async (id, empName) => {
    const reason = prompt('Please enter reason for rejection:', 'Team coverage constraints');
    if (reason === null) return;
    try {
      await api.rejectLeaveRequest(id, reason);
      addToast({ title: 'Leave Rejected', message: `Rejected leave for ${empName}`, type: 'info' });
      fetchRequests();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'employee_name',
      label: 'Employee Name',
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
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
          {val}
        </span>
      ),
    },
    {
      key: 'start_date',
      label: 'Date Range',
      render: (val, row) => (
        <div>
          <div className="font-mono text-xs text-slate-800 font-bold">{val} to {row.end_date}</div>
          <div className="text-[10px] text-slate-500 font-medium">{row.days_count} day(s)</div>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Applicant Reason',
      render: (val) => <span className="text-xs text-slate-600 line-clamp-1 italic">"{val}"</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Leave Requests & Approval Workflow
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review, approve, or reject employee time-off applications and deduct from balance quotas.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        searchKey="employee_name"
        searchPlaceholder="Search by employee name..."
        filterOptions={['All', 'Pending', 'Approved', 'Rejected']}
        filterKey="status"
        isLoading={loading}
        actions={(row) =>
          row.status === 'Pending' ? (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleApprove(row.id, row.employee_name)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                title="Approve"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleReject(row.id, row.employee_name)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1"
                title="Reject"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          ) : null
        }
      />
    </div>
  );
}
