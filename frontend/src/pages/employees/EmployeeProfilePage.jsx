import React, { useState, useEffect } from 'react';
import {
  User,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Laptop,
  FileText,
  TrendingUp,
  Clock,
  ArrowLeft,
  Edit2,
  CheckCircle2,
  Download,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function EmployeeProfilePage({ employeeId, onBack, onEdit }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getEmployeeFullProfile(employeeId);
        setProfile(data);
      } catch (err) {
        console.error(err);
        addToast({ title: 'Profile Error', message: 'Failed to load employee 360 profile', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) fetchProfile();
  }, [employeeId]);

  if (loading || !profile) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-40 rounded-3xl bg-slate-200/70 animate-pulse" />
        <div className="h-96 rounded-3xl bg-slate-200/70 animate-pulse" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'personal', label: 'Personal & Emergency' },
    { id: 'employment', label: 'Employment & Work' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'leaves', label: 'Leaves' },
    { id: 'payroll', label: 'Payroll & CTC' },
    { id: 'assets', label: 'Hardware Assets' },
    { id: 'documents', label: 'Documents' },
    { id: 'performance', label: 'Performance' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Employees</span>
        </button>

        <button
          onClick={() => onEdit(profile)}
          className="inline-flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Hero 360 Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <Avatar
              name={profile.full_name}
              src={profile.avatar_url}
              size="2xl"
              status="active"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {profile.full_name}
                </h1>
                <StatusBadge status={profile.status} />
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {profile.emp_id}
                </span>
              </div>

              <div className="text-sm font-semibold text-indigo-600">
                {profile.designation_name || 'Senior Specialist'} • {profile.department_name || 'Engineering'}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.city}, {profile.state}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Annual CTC</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{Number(profile.annual_ctc || 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Joined on {new Date(profile.joining_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="mt-8 border-t border-slate-100 pt-3 flex overflow-x-auto gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quick Stats Grid */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Workforce Highlights</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Reporting Manager</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">{profile.manager_name || 'Executive Level'}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Work Mode</span>
                    <div className="text-xs font-bold text-indigo-600 mt-1">{profile.work_mode}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Employment</span>
                    <div className="text-xs font-bold text-slate-900 mt-1">{profile.employment_type}</div>
                  </div>
                </div>
              </div>

              {/* Leave Balances snapshot */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Available Leave Balances</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {profile.leave_balances?.map((lb) => (
                    <div key={lb.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-xs font-semibold text-slate-600">{lb.type_code}</span>
                      <div className="text-lg font-black text-slate-900 mt-0.5">{lb.available} <span className="text-xs font-normal text-slate-400">/ {lb.total}</span></div>
                      <span className="text-[10px] text-slate-400">{lb.type_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Assets summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Assigned Hardware Assets</h3>
                <div className="space-y-2.5">
                  {profile.assigned_assets?.length === 0 ? (
                    <div className="text-xs text-slate-400 py-4 text-center">No assigned assets</div>
                  ) : (
                    profile.assigned_assets?.map((ast) => (
                      <div key={ast.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{ast.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{ast.serial_number}</div>
                        </div>
                        <StatusBadge status={ast.condition} size="xs" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PERSONAL TAB */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Gender</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.gender}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date of Birth</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.date_of_birth || 'Not specified'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Marital Status</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.marital_status}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Blood Group</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.blood_group}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium">Residential Address</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.address}, {profile.city}, {profile.state} - {profile.postal_code}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Emergency Contact</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Contact Person</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.emergency_contact_name || 'Primary Contact'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Relationship</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.emergency_contact_relation || 'Family'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium">Emergency Phone</span>
                  <div className="font-semibold text-slate-800 mt-0.5">{profile.emergency_contact_phone || profile.phone}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. EMPLOYMENT & HIERARCHY */}
        {activeTab === 'employment' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Employment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Department</span>
                <div className="font-bold text-slate-900 mt-0.5">{profile.department_name}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Designation</span>
                <div className="font-bold text-slate-900 mt-0.5">{profile.designation_name}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Team Unit</span>
                <div className="font-bold text-slate-900 mt-0.5">{profile.team_name || 'Core Operations'}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Base Office Location</span>
                <div className="font-bold text-slate-900 mt-0.5">{profile.location_name || 'Bengaluru HQ'}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Work Arrangement</span>
                <div className="font-bold text-indigo-600 mt-0.5">{profile.work_mode}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Direct Reports Count</span>
                <div className="font-bold text-slate-900 mt-0.5">{profile.direct_reports_count} direct team members</div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ATTENDANCE LOGS */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Recent Attendance Logs</h3>
            <div className="divide-y divide-slate-100">
              {profile.attendance_logs?.map((att) => (
                <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{att.date}</span>
                    <span className="text-slate-400 ml-2 font-mono">In: {att.check_in} | Out: {att.check_out}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-600">{att.work_hours} hrs</span>
                    <StatusBadge status={att.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. LEAVES */}
        {activeTab === 'leaves' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Leave Allocations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.leave_balances?.map((lb) => (
                  <div key={lb.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-xs font-semibold text-slate-600">{lb.type_name}</div>
                    <div className="text-xl font-black text-indigo-600 mt-1">{lb.available} left</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{lb.used} used • {lb.pending} pending</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Leave Request History</h3>
              <div className="divide-y divide-slate-100">
                {profile.leave_requests?.map((lr) => (
                  <div key={lr.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{lr.type_name} ({lr.days} days)</div>
                      <div className="text-[11px] text-slate-500">{lr.start_date} to {lr.end_date} • "{lr.reason}"</div>
                    </div>
                    <StatusBadge status={lr.status} size="xs" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. PAYROLL & CTC */}
        {activeTab === 'payroll' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Monthly Compensation Breakdown (INR)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Basic Salary (Annual)</span>
                  <div className="text-base font-bold text-slate-900 mt-1">₹{Number(profile.basic_salary).toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-slate-400">50% of CTC</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">HRA (Annual)</span>
                  <div className="text-base font-bold text-slate-900 mt-1">₹{Number(profile.hra).toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-slate-400">25% of CTC</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 font-medium">Special Allowances</span>
                  <div className="text-base font-bold text-slate-900 mt-1">₹{Number(profile.special_allowances).toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-slate-400">25% of CTC</span>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-indigo-600 font-semibold">Total CTC (Annual)</span>
                  <div className="text-base font-black text-indigo-900 mt-1">₹{Number(profile.annual_ctc).toLocaleString('en-IN')}</div>
                  <span className="text-[11px] text-indigo-700">₹{(profile.annual_ctc / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })} / month</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Banking & Statutory Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Bank Name</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{profile.bank_name}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Account Number</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">{profile.account_number}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">PAN Number</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">{profile.pan_number}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">UAN Number</span>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">{profile.uan_number}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. HARDWARE ASSETS */}
        {activeTab === 'assets' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Company Assets Assigned</h3>
            <div className="divide-y divide-slate-100">
              {profile.assigned_assets?.map((ast) => (
                <div key={ast.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{ast.name} ({ast.category})</div>
                    <div className="text-[11px] text-slate-500 font-mono">Serial: {ast.serial_number} • Brand: {ast.brand_model}</div>
                  </div>
                  <StatusBadge status={ast.condition} size="xs" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Uploaded Employee Documents</h3>
            <div className="divide-y divide-slate-100">
              {profile.documents?.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="font-bold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-500">{doc.type} • {doc.size_kb} KB ({doc.format})</div>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} size="xs" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. PERFORMANCE */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Key Objectives & Goals (OKRs)</h3>
              <div className="space-y-3">
                {profile.goals?.map((g) => (
                  <div key={g.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{g.title}</span>
                      <StatusBadge status={g.status} size="xs" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div style={{ width: `${g.progress}%` }} className="h-full bg-indigo-600 rounded-full" />
                      </div>
                      <span className="font-bold text-indigo-600 w-10 text-right">{g.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">360° Review History</h3>
              <div className="space-y-3">
                {profile.reviews?.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{rev.cycle_title}</span>
                      <span className="font-black text-amber-600 text-sm bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ★ {rev.overall_rating} / 5.0
                      </span>
                    </div>
                    <p className="text-slate-600 italic">"{rev.manager_feedback}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
