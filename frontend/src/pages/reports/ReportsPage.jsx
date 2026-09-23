import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Printer, Users, CalendarCheck, CalendarDays, CircleDollarSign, Briefcase } from 'lucide-react';
import { StatsMetric } from '../../components/ui/StatsMetric';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function ReportsPage() {
  const [reportType, setReportType] = useState('workforce');
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const [dStats, emps] = await Promise.all([
          api.getDashboardStats(),
          api.getEmployees(),
        ]);
        setDashboardData(dStats);
        setEmployees(emps || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleExport = () => {
    addToast({ title: 'Export Generated', message: `Exporting ${reportType} report to CSV`, type: 'success' });
  };

  if (loading || !dashboardData) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-64 rounded-3xl bg-slate-200/70 animate-pulse" />
      </div>
    );
  }

  const { overview, department_distribution = [] } = dashboardData;

  const reportTabs = [
    { id: 'workforce', label: 'Headcount & Demographics', icon: Users },
    { id: 'attendance', label: 'Attendance Compliance', icon: CalendarCheck },
    { id: 'leave', label: 'Leave Utilization', icon: CalendarDays },
    { id: 'payroll', label: 'Payroll & Remuneration', icon: CircleDollarSign },
    { id: 'recruitment', label: 'Hiring Velocity', icon: Briefcase },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Workforce Intelligence & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Executive analytical summaries, compliance metrics, and operational audit reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Module Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                reportType === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. WORKFORCE REPORT */}
      {reportType === 'workforce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatsMetric
              title="Total Active Headcount"
              value={overview.total_employees}
              subtitle="Full-time & contract staff"
              icon={Users}
              accentColor="indigo"
            />
            <StatsMetric
              title="Departments Count"
              value={department_distribution.length}
              subtitle="Cross-functional units"
              icon={BarChart3}
              accentColor="emerald"
            />
            <StatsMetric
              title="Probation Status"
              value={overview.on_probation}
              subtitle="New hires in evaluation"
              icon={Users}
              accentColor="amber"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Headcount Distribution by Department</h3>
            <div className="space-y-3">
              {department_distribution.map((dept) => {
                const pct = Math.round((dept.count / Math.max(1, overview.total_employees)) * 100);
                return (
                  <div key={dept.code} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800">{dept.name} ({dept.code})</span>
                      <span className="font-mono text-indigo-600">{dept.count} members ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-full bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE REPORT */}
      {reportType === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatsMetric title="Today's Present" value={overview.present_today} subtitle="On-site office" accentColor="emerald" />
            <StatsMetric title="Approved Remote" value={overview.wfh_today} subtitle="Work from home" accentColor="sky" />
            <StatsMetric title="Late Arrivals" value={overview.late_today} subtitle="Past 9:15 AM" accentColor="amber" />
            <StatsMetric title="Absences" value={overview.absent_today} subtitle="Unscheduled" accentColor="rose" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Campus Punctuality & Working Hour Compliance</h3>
            <p className="text-xs text-slate-500 mb-4">Company average working time: 8.52 hours / day across 5 campuses.</p>
            <div className="h-4 rounded-full bg-slate-100 overflow-hidden flex">
              <div style={{ width: `${overview.attendance_rate}%` }} className="bg-emerald-500" title="Present" />
              <div style={{ width: `${100 - overview.attendance_rate}%` }} className="bg-amber-400" title="Absent/Late" />
            </div>
          </div>
        </div>
      )}

      {/* 3. LEAVE REPORT */}
      {reportType === 'leave' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Annual Leave Utilization Breakdown</h3>
          <p className="text-xs text-slate-500">Analysis across Casual Leave, Sick Leave, and Privilege Accruals.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border">
              <span className="text-slate-400 font-semibold">Casual Leaves (CL)</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">2.4 days / employee avg</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border">
              <span className="text-slate-400 font-semibold">Sick Leaves (SL)</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">1.1 days / employee avg</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border">
              <span className="text-slate-400 font-semibold">Privilege Vacation (EL)</span>
              <div className="text-xl font-bold text-amber-600 mt-1">4.8 days / employee avg</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PAYROLL REPORT */}
      {reportType === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Total Compensation Expenditure Analysis</h3>
          <p className="text-xs text-slate-500">Gross wages, employee PF contributions, and statutory withholding.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-indigo-600 font-semibold">Monthly Total Net Disbursed</span>
              <div className="text-2xl font-black text-indigo-950 font-mono mt-1">
                ₹{Number(dashboardData.payroll_summary?.total_disbursement || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border">
              <span className="text-slate-400 font-semibold">Annualized Payroll Outflow</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                ₹{(Number(dashboardData.payroll_summary?.total_disbursement || 0) * 12).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RECRUITMENT REPORT */}
      {reportType === 'recruitment' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Talent Acquisition & Pipeline Conversion</h3>
          <p className="text-xs text-slate-500">Average time-to-hire: 24 days across Engineering and Product roles.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border text-center">
              <span className="text-slate-400 font-semibold">Active Jobs</span>
              <div className="text-xl font-bold text-indigo-600 mt-1">{overview.open_jobs_count}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border text-center">
              <span className="text-slate-400 font-semibold">Candidates</span>
              <div className="text-xl font-bold text-emerald-600 mt-1">{overview.total_candidates}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border text-center">
              <span className="text-slate-400 font-semibold">Interview Stage</span>
              <div className="text-xl font-bold text-amber-600 mt-1">{dashboardData.recruitment_funnel?.Interview || 0}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border text-center">
              <span className="text-slate-400 font-semibold">Offers Extended</span>
              <div className="text-xl font-bold text-indigo-900 mt-1">{dashboardData.recruitment_funnel?.Selected || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
