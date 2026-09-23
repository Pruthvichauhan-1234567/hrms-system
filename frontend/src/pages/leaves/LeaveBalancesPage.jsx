import React, { useState, useEffect } from 'react';
import { Layers, Users, Calendar } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { api } from '../../services/api';

export function LeaveBalancesPage() {
  const [balances, setBalances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [balData, empData] = await Promise.all([
          api.getLeaveBalances(),
          api.getEmployees(),
        ]);
        setBalances(balData || []);
        setEmployees(empData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const columns = [
    {
      key: 'leave_type_name',
      label: 'Leave Category',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[10px] font-mono text-indigo-600 font-semibold">{row.leave_type_code}</div>
        </div>
      ),
    },
    {
      key: 'total_allocated',
      label: 'Annual Quota',
      align: 'center',
      render: (val) => <span className="font-mono text-xs font-semibold text-slate-700">{val} days</span>,
    },
    {
      key: 'used',
      label: 'Days Utilized',
      align: 'center',
      render: (val) => <span className="font-mono text-xs text-rose-600 font-bold">{val} days</span>,
    },
    {
      key: 'pending',
      label: 'Pending Approvals',
      align: 'center',
      render: (val) => <span className="font-mono text-xs text-amber-600 font-bold">{val} days</span>,
    },
    {
      key: 'available',
      label: 'Remaining Balance',
      align: 'center',
      render: (val) => (
        <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          {val} days available
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Workforce Leave Balances ({balances.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Annual quota allocations, utilized time-off, and remaining balances per employee.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={balances}
        searchKey="leave_type_name"
        searchPlaceholder="Search leave balances..."
        isLoading={loading}
      />
    </div>
  );
}
