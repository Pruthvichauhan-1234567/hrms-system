import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Plus, Filter, Users, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function AttendanceRosterPage() {
  const [records, setRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getAttendanceRecords({ date: selectedDate });
      setRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedDate]);

  const statuses = ['All', 'Present', 'Work From Home', 'Late', 'On Leave', 'Absent'];

  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} src={row.avatar_url} size="sm" />
          <div>
            <div className="text-xs font-bold text-slate-900">{val}</div>
            <div className="text-[10px] text-slate-400 font-mono">{row.emp_id}</div>
          </div>
        </div>
      ),
    },
    { key: 'department_name', label: 'Department', sortable: true },
    {
      key: 'check_in',
      label: 'Check In',
      render: (val) => <span className="font-mono text-xs text-slate-800">{val?.slice(0, 5) || '--:--'}</span>,
    },
    {
      key: 'check_out',
      label: 'Check Out',
      render: (val) => <span className="font-mono text-xs text-slate-800">{val?.slice(0, 5) || '--:--'}</span>,
    },
    {
      key: 'work_hours',
      label: 'Effective Hours',
      align: 'right',
      render: (val) => <span className="font-mono text-xs font-bold text-slate-900">{val} hrs</span>,
    },
    {
      key: 'overtime_hours',
      label: 'Overtime',
      align: 'right',
      render: (val) => (
        <span className="font-mono text-xs text-slate-600">
          {val > 0 ? `+${val} hrs` : '-'}
        </span>
      ),
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
            Daily Attendance Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time campus biometric logs, working hours, and grace-period compliance.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Log Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        searchKey="employee_name"
        searchPlaceholder="Search attendance logs..."
        filterOptions={statuses}
        filterKey="status"
        isLoading={loading}
      />
    </div>
  );
}
