import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Filter,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar
} from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function EmployeesListPage({ onNavigate, onOpenAdd, onEditEmployee, onViewProfile }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const { addToast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', message: 'Failed to load employees', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete employee ${name}?`)) return;
    try {
      await api.deleteEmployee(id);
      addToast({
        title: 'Employee Deleted',
        message: `${name} has been removed from system`,
        type: 'success',
      });
      fetchEmployees();
    } catch (err) {
      addToast({ title: 'Delete Failed', message: err.message, type: 'error' });
    }
  };

  const departments = ['All', ...new Set(employees.map((e) => e.department_name).filter(Boolean))];

  const columns = [
    {
      key: 'emp_id',
      label: 'Emp ID',
      sortable: true,
      render: (val, row) => (
        <span
          onClick={() => onViewProfile(row.id)}
          className="font-mono text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          {val}
        </span>
      ),
    },
    {
      key: 'full_name',
      label: 'Employee Name',
      sortable: true,
      render: (val, row) => (
        <div
          onClick={() => onViewProfile(row.id)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Avatar name={val} src={row.avatar_url} size="md" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {val}
            </div>
            <div className="text-[11px] text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department_name',
      label: 'Department',
      sortable: true,
      render: (val) => (
        <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{val || 'General'}</span>
        </div>
      ),
    },
    {
      key: 'designation_name',
      label: 'Designation',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-medium text-slate-800">{val || 'Team Member'}</span>
      ),
    },
    {
      key: 'manager_name',
      label: 'Manager',
      render: (val) => (
        <span className="text-xs text-slate-600">{val || 'Executive Board'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'work_mode',
      label: 'Mode',
      render: (val) => (
        <span className="text-xs text-slate-600 font-medium px-2 py-0.5 rounded-md bg-slate-100">
          {val || 'Hybrid'}
        </span>
      ),
    },
    {
      key: 'annual_ctc',
      label: 'Annual CTC (INR)',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-900">
          ₹{Number(val || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            All Employees ({employees.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage complete workforce profiles, reporting hierarchy, and statutory compensation records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('employees/directory')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Grid Directory View
          </button>
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={employees}
        searchKey="full_name"
        searchPlaceholder="Search employees by name, email, or designation..."
        filterOptions={departments}
        filterKey="department_name"
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onViewProfile(row.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View 360° Profile"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditEmployee(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Edit Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.id, row.full_name)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Employee"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
