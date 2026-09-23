import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Users, MapPin, DollarSign, Calendar, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function JobOpeningsPage({ onNavigate }) {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    job_code: '',
    department: '',
    experience_min: 3,
    experience_max: 6,
    salary_min: '1200000',
    salary_max: '2000000',
    vacancies: 2,
    description: '',
    requirements: '',
    status: 'Open',
    opened_date: new Date().toISOString().split('T')[0],
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const [jobData, deptData] = await Promise.all([
        api.getJobOpenings(),
        api.getDepartments(),
      ]);
      setJobs(jobData || []);
      setDepartments(deptData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createJobOpening(formData);
      addToast({ title: 'Success', message: 'Job opening posted successfully', type: 'success' });
      setIsModalOpen(false);
      fetchJobs();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Position Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.job_code}</div>
        </div>
      ),
    },
    { key: 'department_name', label: 'Department', sortable: true },
    {
      key: 'vacancies',
      label: 'Openings',
      align: 'center',
      render: (val) => <span className="font-bold text-xs text-slate-900">{val} slots</span>,
    },
    {
      key: 'candidates_count',
      label: 'Applicants',
      align: 'center',
      render: (val, row) => (
        <button
          onClick={() => onNavigate('recruitment/pipeline')}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md hover:bg-indigo-100"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{val || 0} candidates</span>
        </button>
      ),
    },
    {
      key: 'salary_min',
      label: 'Compensation Range',
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-700">
          ₹{(val / 100000).toFixed(1)}L - ₹{(row.salary_max / 100000).toFixed(1)}L
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
            Job Openings ({jobs.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage active vacancies, candidate requisition quotas, and job postings.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              job_code: `JOB-${Date.now().toString().slice(-4)}`,
              department: departments[0]?.id || '',
              experience_min: 3,
              experience_max: 6,
              salary_min: '1200000',
              salary_max: '2000000',
              vacancies: 2,
              description: 'We are looking for a talented team player...',
              requirements: 'Demonstrated experience with modern software stacks...',
              status: 'Open',
              opened_date: new Date().toISOString().split('T')[0],
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Job Posting</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={jobs}
        searchKey="title"
        searchPlaceholder="Search jobs by title..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post New Job Opening"
        subtitle="Specify position details, salary band, and experience criteria."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lead Full-Stack Engineer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vacancies Count</label>
              <input
                type="number"
                min="1"
                value={formData.vacancies}
                onChange={(e) => setFormData({ ...formData, vacancies: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Salary (Annual INR)</label>
              <input
                type="number"
                value={formData.salary_min}
                onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Salary (Annual INR)</label>
              <input
                type="number"
                value={formData.salary_max}
                onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              Publish Job Opening
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
