import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, Building2, MapPin, ArrowLeft, Filter } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';

export function EmployeeDirectoryPage({ onViewProfile, onBack }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await api.getEmployees();
        setEmployees(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const departments = ['All', ...new Set(employees.map((e) => e.department_name).filter(Boolean))];

  const filtered = employees.filter((e) => {
    if (department !== 'All' && e.department_name !== department) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.full_name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q) ||
      e.designation_name?.toLowerCase().includes(q) ||
      e.emp_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Table View</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Employee Directory ({filtered.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Visual organizational directory of team members across global offices.
          </p>
        </div>

        {/* Search & Department Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">No employees match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              onClick={() => onViewProfile(emp.id)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar name={emp.full_name} src={emp.avatar_url} size="xl" status="active" />
                <h3 className="text-sm font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                  {emp.full_name}
                </h3>
                <span className="text-[11px] font-semibold text-indigo-600">
                  {emp.designation_name || 'Specialist'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {emp.department_name || 'General'}
                </span>
                <div className="mt-2.5">
                  <StatusBadge status={emp.status} size="xs" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{emp.location_name || 'Bengaluru HQ'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
