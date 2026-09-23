import React, { useState, useEffect } from 'react';
import { FileText, Eye, Printer, Download, DollarSign, Building2, Sparkles } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function PayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const { addToast } = useToast();

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const [slipData, sets] = await Promise.all([
        api.getPayslips(),
        api.getCompanySettings(),
      ]);
      setPayslips(slipData || []);
      if (sets?.length > 0) setCompanySettings(sets[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      key: 'payslip_number',
      label: 'Payslip Ref',
      sortable: true,
      render: (val, row) => (
        <span
          onClick={() => setSelectedSlip(row)}
          className="font-mono text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
        >
          {val}
        </span>
      ),
    },
    {
      key: 'employee_name',
      label: 'Employee Name',
      sortable: true,
      render: (val, row) => (
        <div
          onClick={() => setSelectedSlip(row)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <Avatar name={val} src={row.avatar_url} size="sm" />
          <div>
            <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {val}
            </div>
            <div className="text-[10px] text-slate-500">{row.department_name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'month',
      label: 'Pay Period',
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {new Date(row.year, val - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'gross_earnings',
      label: 'Gross Pay',
      align: 'right',
      render: (val) => <span className="font-mono text-xs text-slate-800">₹{Number(val).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'total_deductions',
      label: 'Deductions',
      align: 'right',
      render: (val) => <span className="font-mono text-xs text-rose-600">-₹{Number(val).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'net_salary',
      label: 'Net Take-Home',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          ₹{Number(val).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Payslips Repository ({payslips.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Individual itemized salary slips with PF, tax deduction schedules and bank remittance logs.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payslips}
        searchKey="employee_name"
        searchPlaceholder="Search payslips by employee..."
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setSelectedSlip(row)}
              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View Salary Slip"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Printable / Viewable Enterprise Payslip Modal */}
      <Modal
        isOpen={Boolean(selectedSlip)}
        onClose={() => setSelectedSlip(null)}
        title="Enterprise Salary Payslip"
        subtitle={`Period: ${selectedSlip?.month}/${selectedSlip?.year} • ${selectedSlip?.payslip_number}`}
        maxWidth="max-w-3xl"
      >
        {selectedSlip && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Printable Container */}
            <div id="payslip-document" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
              {/* Slip Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5 gap-4">
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    {companySettings?.legal_name || 'PeoplePulse Tech Solutions India Pvt. Ltd.'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 max-w-sm leading-relaxed">
                    {companySettings?.address || 'Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Email: {companySettings?.contact_email || 'payroll@peoplepulse.io'}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-200 uppercase">
                    Official Payslip
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-900 mt-1.5">
                    {selectedSlip.payslip_number}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Pay Month: <strong>{new Date(selectedSlip.year, selectedSlip.month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>
                  </div>
                </div>
              </div>

              {/* Employee Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 font-medium">Employee Name</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{selectedSlip.employee_name}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Employee ID</span>
                  <div className="font-mono font-bold text-indigo-600 mt-0.5">{selectedSlip.emp_id}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Designation</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedSlip.designation_name || 'Specialist'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedSlip.department_name || 'Core Operations'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Bank Account</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">{selectedSlip.account_number || '501004928192'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Bank Name</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{selectedSlip.bank_name || 'HDFC Bank'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">PAN Number</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">{selectedSlip.pan_number || 'ABCDE1234F'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Paid Days</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedSlip.paid_days} / {selectedSlip.working_days} Days</div>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown Tables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 font-bold text-xs text-slate-900 border-b border-slate-200 flex justify-between">
                    <span>Earnings Component</span>
                    <span>Amount (INR)</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Basic Salary</span>
                      <span className="font-mono font-bold">₹{Number(selectedSlip.basic_salary).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">House Rent Allowance (HRA)</span>
                      <span className="font-mono font-bold">₹{Number(selectedSlip.hra).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Special Allowances</span>
                      <span className="font-mono font-bold">₹{Number(selectedSlip.special_allowance).toLocaleString('en-IN')}</span>
                    </div>
                    {Number(selectedSlip.performance_bonus) > 0 && (
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-600">Performance Bonus</span>
                        <span className="font-mono font-bold text-emerald-600">₹{Number(selectedSlip.performance_bonus).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t font-bold text-slate-900 bg-slate-50/50 -mx-3 px-3 py-1.5">
                      <span>Total Gross Earnings</span>
                      <span className="font-mono">₹{Number(selectedSlip.gross_earnings).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3.5 py-2 font-bold text-xs text-slate-900 border-b border-slate-200 flex justify-between">
                    <span>Statutory Deductions</span>
                    <span>Amount (INR)</span>
                  </div>
                  <div className="p-3 space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Provident Fund (PF - 12%)</span>
                      <span className="font-mono font-bold text-rose-600">₹{Number(selectedSlip.provident_fund).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Professional Tax (PT)</span>
                      <span className="font-mono font-bold text-rose-600">₹{Number(selectedSlip.professional_tax).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-600">Income Tax (TDS)</span>
                      <span className="font-mono font-bold text-rose-600">₹{Number(selectedSlip.income_tax_tds).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t font-bold text-slate-900 bg-slate-50/50 -mx-3 px-3 py-1.5">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-600">₹{Number(selectedSlip.total_deductions).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Net Monthly Salary Payable</span>
                  <div className="text-2xl font-black font-mono">
                    ₹{Number(selectedSlip.net_salary).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-xs text-indigo-200">
                  Status: <strong>{selectedSlip.payment_status}</strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Payslip</span>
              </button>
              <button
                onClick={() => {
                  window.print();
                  addToast({ title: 'Downloading', message: 'Generating printable PDF', type: 'info' });
                }}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
