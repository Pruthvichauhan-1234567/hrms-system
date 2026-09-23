import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Plus, DollarSign, Users, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { StatsMetric } from '../../components/ui/StatsMetric';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function PayrollDashboardPage({ onNavigate, onOpenPayslip }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { addToast } = useToast();

  const [formMonth, setFormMonth] = useState(new Date().getMonth() + 1);
  const [formYear, setFormYear] = useState(new Date().getFullYear());

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const data = await api.getPayrollRuns();
      setRuns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await api.processMonthlyPayroll({
        month: formMonth,
        year: formYear,
        title: `Payroll - ${new Date(formYear, formMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
      });
      addToast({
        title: 'Payroll Processed',
        message: res.message || 'Payroll calculated and payslips generated',
        type: 'success',
      });
      setIsProcessModalOpen(false);
      fetchRuns();
    } catch (err) {
      addToast({ title: 'Processing Failed', message: err.message, type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDisburse = async (runId) => {
    if (!window.confirm('Confirm salary disbursement? This will mark all payslips as Paid.')) return;
    try {
      await api.disbursePayrollRun(runId);
      addToast({ title: 'Disbursed', message: 'Salaries marked as disbursed and credited', type: 'success' });
      fetchRuns();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const latest = runs[0] || {};
  const totalNet = Number(latest.total_net || 0);
  const totalGross = Number(latest.total_gross || 0);
  const totalDed = Number(latest.total_deductions || 0);

  const columns = [
    {
      key: 'title',
      label: 'Payroll Cycle',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[10px] text-slate-500 font-mono">Processed: {row.processed_date}</div>
        </div>
      ),
    },
    {
      key: 'total_employees',
      label: 'Beneficiaries',
      align: 'center',
      render: (val) => <span className="font-bold text-xs text-slate-800">{val} staff</span>,
    },
    {
      key: 'total_gross',
      label: 'Gross Earnings',
      align: 'right',
      render: (val) => <span className="font-mono text-xs text-slate-700">₹{Number(val).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'total_deductions',
      label: 'Total Deductions (PF+Tax)',
      align: 'right',
      render: (val) => <span className="font-mono text-xs text-rose-600">₹{Number(val).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'total_net',
      label: 'Net Disbursement',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          ₹{Number(val).toLocaleString('en-IN')}
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
            Payroll Operations & Compensation Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Automate monthly salary calculations, PF/TDS statutory compliance, and payslip generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('payroll/payslips')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl"
          >
            All Payslips Repository
          </button>
          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Process Monthly Payroll</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsMetric
          title="Current Month Net Outflow"
          value={`₹${totalNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`₹${totalGross.toLocaleString('en-IN', { maximumFractionDigits: 0 })} gross`}
          icon={CircleDollarSign}
          accentColor="emerald"
        />
        <StatsMetric
          title="Statutory Deductions"
          value={`₹${totalDed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle="Provident Fund + PT + TDS"
          icon={DollarSign}
          accentColor="amber"
        />
        <StatsMetric
          title="Active Beneficiaries"
          value={latest.total_employees || 0}
          subtitle="Employees in payroll run"
          icon={Users}
          accentColor="indigo"
        />
      </div>

      {/* Payroll Runs History */}
      <DataTable
        columns={columns}
        data={runs}
        searchKey="title"
        searchPlaceholder="Search payroll runs..."
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-2">
            {row.status === 'Calculated' && (
              <button
                onClick={() => handleDisburse(row.id)}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
              >
                Approve & Disburse
              </button>
            )}
            <button
              onClick={() => onNavigate('payroll/payslips')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              View Payslips
            </button>
          </div>
        )}
      />

      {/* Process Payroll Wizard Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title="Execute Monthly Payroll Calculation"
        subtitle="Calculates gross earnings, PF (12%), PT, and estimated TDS for all active employees."
      >
        <form onSubmit={handleRunPayroll} className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Automated Salary Component Processing:</h4>
            <ul className="list-disc pl-4 text-slate-600 space-y-1 text-[11px]">
              <li><strong>Basic Salary:</strong> 50% of annual CTC allocated monthly.</li>
              <li><strong>HRA:</strong> 25% of annual CTC.</li>
              <li><strong>Special Allowances:</strong> 25% of annual CTC.</li>
              <li><strong>Statutory Deductions:</strong> PF 12% + Professional Tax ₹200 + TDS Tax withholding.</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payroll Month</label>
              <select
                value={formMonth}
                onChange={(e) => setFormMonth(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {new Date(2026, m - 1, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Year</label>
              <select
                value={formYear}
                onChange={(e) => setFormYear(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProcessModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs disabled:opacity-50"
            >
              {processing ? 'Calculating Wages & Deductions...' : 'Run Payroll Calculation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
