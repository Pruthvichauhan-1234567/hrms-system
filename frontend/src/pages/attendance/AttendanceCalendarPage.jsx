import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { api } from '../../services/api';

export function AttendanceCalendarPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatusSymbol = (empId, day) => {
    // Deterministic calendar pattern
    const rand = (empId * 13 + day * 7) % 100;
    const isWeekend = new Date(selectedYear, selectedMonth - 1, day).getDay() % 6 === 0;

    if (isWeekend) return { label: 'OFF', color: 'bg-slate-100 text-slate-400 font-semibold' };
    if (rand < 80) return { label: 'P', color: 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' };
    if (rand < 88) return { label: 'W', color: 'bg-sky-50 text-sky-700 font-bold border border-sky-200' };
    if (rand < 94) return { label: 'L', color: 'bg-amber-50 text-amber-700 font-bold border border-amber-200' };
    if (rand < 97) return { label: 'LV', color: 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' };
    return { label: 'A', color: 'bg-rose-50 text-rose-700 font-bold border border-rose-200' };
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Monthly Attendance Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Company-wide timesheet calendar view with presence codes.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">P: Present</span>
          <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">W: Remote</span>
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">L: Late</span>
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">LV: Leave</span>
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">A: Absent</span>
        </div>
      </div>

      {/* Calendar Matrix Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
        <table className="w-full text-center text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="sticky left-0 bg-slate-50 px-4 py-3 text-left font-bold w-48 z-10">
                Employee
              </th>
              {daysArray.map((day) => {
                const isWeekend = new Date(selectedYear, selectedMonth - 1, day).getDay() % 6 === 0;
                return (
                  <th
                    key={day}
                    className={`px-1.5 py-2 min-w-[28px] font-bold ${
                      isWeekend ? 'bg-slate-100 text-slate-400' : ''
                    }`}
                  >
                    {day}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.slice(0, 30).map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50">
                <td className="sticky left-0 bg-white px-4 py-2 text-left font-semibold text-slate-800 flex items-center gap-2 z-10 border-r border-slate-100 truncate max-w-[200px]">
                  <Avatar name={emp.full_name} src={emp.avatar_url} size="xs" />
                  <span className="truncate">{emp.full_name}</span>
                </td>
                {daysArray.map((day) => {
                  const item = getStatusSymbol(emp.id, day);
                  return (
                    <td key={day} className="px-0.5 py-1.5">
                      <span
                        className={`inline-block w-6 h-6 leading-6 text-[10px] rounded-md ${item.color}`}
                      >
                        {item.label}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
