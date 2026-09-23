import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Check, User, Briefcase, DollarSign, Phone } from 'lucide-react';

export function AddEditEmployeeModal({ isOpen, onClose, employee = null, onSaved }) {
  const isEdit = Boolean(employee);
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);

  const [formData, setFormData] = useState({
    emp_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    date_of_birth: '1994-05-15',
    marital_status: 'Single',
    blood_group: 'O+',
    address: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postal_code: '560038',
    department: '',
    designation: '',
    location: '',
    joining_date: new Date().toISOString().split('T')[0],
    employment_type: 'Full-Time',
    status: 'Active',
    work_mode: 'Hybrid',
    annual_ctc: '1200000',
    basic_salary: '600000',
    hra: '300000',
    special_allowances: '300000',
    bank_name: 'HDFC Bank',
    account_number: '50100492819283',
    ifsc_code: 'HDFC0001234',
    pan_number: 'ABCDE1234F',
    emergency_contact_name: 'Family Contact',
    emergency_contact_relation: 'Parent',
    emergency_contact_phone: '+91 98450 99999',
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [depts, desigs, locs] = await Promise.all([
          api.getDepartments(),
          api.getDesignations(),
          api.getLocations(),
        ]);
        setDepartments(depts || []);
        setDesignations(desigs || []);
        setLocations(locs || []);

        if (depts?.length > 0 && !formData.department) {
          setFormData((p) => ({ ...p, department: depts[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) fetchDropdowns();
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        department: employee.department || '',
        designation: employee.designation || '',
        location: employee.location || '',
      });
    } else {
      setFormData((p) => ({
        ...p,
        emp_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      }));
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'annual_ctc') {
        const ctc = parseFloat(value) || 0;
        updated.basic_salary = (ctc * 0.5).toString();
        updated.hra = (ctc * 0.25).toString();
        updated.special_allowances = (ctc * 0.25).toString();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.updateEmployee(employee.id, formData);
        addToast({ title: 'Success', message: 'Employee updated successfully', type: 'success' });
      } else {
        await api.createEmployee(formData);
        addToast({ title: 'Success', message: 'New employee created successfully', type: 'success' });
      }
      onSaved();
      onClose();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal Details', icon: User },
    { num: 2, label: 'Work & Organization', icon: Briefcase },
    { num: 3, label: 'Compensation & Bank', icon: DollarSign },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Employee: ${employee?.full_name}` : 'Onboard New Employee'}
      subtitle="Complete profile registration with statutory and organizational allocation."
      maxWidth="max-w-3xl"
    >
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div
              onClick={() => setStep(s.num)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.num
                    ? 'bg-indigo-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  step === s.num ? 'text-indigo-600' : 'text-slate-600'
                }`}
              >
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && <div className="flex-1 h-0.5 bg-slate-100 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                name="emp_id"
                required
                value={formData.emp_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer Not to Say">Prefer Not to Say</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corporate Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Phone *</label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Current City & State</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="postal_code"
                  placeholder="PIN Code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EMPLOYMENT & WORK */}
        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Designation</option>
                {designations.map((des) => (
                  <option key={des.id} value={des.id}>
                    {des.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Base Office Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} - {loc.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Joining Date</label>
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Work Arrangement</label>
              <select
                name="work_mode"
                value={formData.work_mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Active">Active</option>
                <option value="Probation">Probation</option>
                <option value="On Notice">On Notice</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: COMPENSATION & STATUTORY */}
        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual CTC (INR) *</label>
              <input
                type="number"
                name="annual_ctc"
                required
                value={formData.annual_ctc}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Basic Salary (50%)</label>
              <input
                type="number"
                name="basic_salary"
                readOnly
                value={formData.basic_salary}
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Previous Step
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              Continue to Step {step + 1}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-50"
            >
              {loading ? 'Saving Profile...' : isEdit ? 'Update Employee' : 'Create Employee Record'}
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
