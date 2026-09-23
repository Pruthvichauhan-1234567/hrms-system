import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Building2, Clock, Check, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function SettingsPage({ currentRole }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    company_name: '',
    legal_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    address: '',
    currency: 'INR (₹)',
    working_days_per_week: 5,
    default_work_hours_per_day: 8.5,
    attendance_grace_period_mins: 15,
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanySettings();
      if (data && data.length > 0) {
        setSettings(data[0]);
        setFormData(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settings?.id) {
        await api.updateCompanySettings(settings.id, formData);
      }
      addToast({ title: 'Settings Saved', message: 'Company settings updated successfully', type: 'success' });
      fetchSettings();
    } catch (err) {
      addToast({ title: 'Save Failed', message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const rolesMatrix = [
    { module: 'Dashboard & Metrics', superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: 'Employee Management (Full CRUD)', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: 'Organization Structure & Teams', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: 'Recruitment & Job Openings', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: 'Attendance Regularization', superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: 'Leave Approvals & Workflow', superAdmin: true, hrAdmin: true, manager: true, employee: false },
    { module: 'Payroll Processing & Disbursement', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: 'Download Personal Payslips', superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: 'Performance Reviews & OKRs', superAdmin: true, hrAdmin: true, manager: true, employee: true },
    { module: 'Asset Assignment & Inventory', superAdmin: true, hrAdmin: true, manager: false, employee: false },
    { module: 'System & Security Settings', superAdmin: true, hrAdmin: false, manager: false, employee: false },
  ];

  if (loading || !settings) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-64 rounded-2xl bg-slate-200/70 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Enterprise Settings & RBAC
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Company corporate profile, working schedule parameters, and role-based access permissions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'company'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'rbac'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Role Permissions Matrix (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
            activeTab === 'policies'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Working Policies
        </button>
      </div>

      {/* 1. COMPANY PROFILE */}
      {activeTab === 'company' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Display Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Legal Registered Entity Name</label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate HR Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Headquarters Registered Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. RBAC MATRIX */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900">Role-Based Access Control (RBAC) Permission Matrix</h3>
            <p className="text-[11px] text-slate-500">Configured authorization levels per organizational role persona.</p>
          </div>
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="px-4 py-3">Module Feature</th>
                <th className="px-3 py-3 text-center">Super Admin</th>
                <th className="px-3 py-3 text-center">HR Admin</th>
                <th className="px-3 py-3 text-center">Dept Manager</th>
                <th className="px-3 py-3 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rolesMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-semibold text-slate-800">{item.module}</td>
                  <td className="px-3 py-2.5 text-center">
                    {item.superAdmin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {item.hrAdmin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {item.manager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {item.employee ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. WORKING POLICIES */}
      {activeTab === 'policies' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Working Days Per Week</label>
              <input
                type="number"
                min="4"
                max="6"
                value={formData.working_days_per_week}
                onChange={(e) => setFormData({ ...formData, working_days_per_week: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Work Hours / Day</label>
              <input
                type="number"
                step="0.5"
                value={formData.default_work_hours_per_day}
                onChange={(e) => setFormData({ ...formData, default_work_hours_per_day: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={formData.attendance_grace_period_mins}
                onChange={(e) => setFormData({ ...formData, attendance_grace_period_mins: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Policy Rules</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
