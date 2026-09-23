import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, CheckCircle2, AlertCircle, Target, Award } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function GoalsPage({ currentUser }) {
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    employee: '',
    cycle: '',
    title: '',
    category: 'Engineering',
    metric_target: '',
    progress: 50,
    status: 'In Progress',
    due_date: '2026-10-31',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [goalData, empData, cycleData] = await Promise.all([
        api.getGoals(),
        api.getEmployees(),
        api.getPerformanceCycles(),
      ]);
      setGoals(goalData || []);
      setEmployees(empData || []);
      setCycles(cycleData || []);

      if (empData?.length > 0 && !formData.employee) {
        setFormData((p) => ({
          ...p,
          employee: currentUser?.id || empData[0].id,
          cycle: cycleData[0]?.id || '',
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProgress = async (id, newProgress) => {
    try {
      await api.updateGoalProgress(id, newProgress);
      addToast({ title: 'Progress Updated', message: `Goal progress set to ${newProgress}%`, type: 'success' });
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createGoal(formData);
      addToast({ title: 'Goal Created', message: 'New objective added to cycle', type: 'success' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Objective / Key Result (OKR)',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.metric_target || row.category}</div>
        </div>
      ),
    },
    { key: 'employee_name', label: 'Owner', sortable: true },
    {
      key: 'category',
      label: 'Category',
      render: (val) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'progress',
      label: 'Progress (%)',
      render: (val, row) => (
        <div className="flex items-center gap-3 min-w-[140px]">
          <input
            type="range"
            min="0"
            max="100"
            value={val}
            onChange={(e) => handleUpdateProgress(row.id, Number(e.target.value))}
            className="w-24 accent-indigo-600 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-indigo-600 w-8">{val}%</span>
        </div>
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
            Performance Goals & OKR Tracker ({goals.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Align quarterly objectives, key business results, and progress sliders across pods.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Define Objective</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={goals}
        searchKey="title"
        searchPlaceholder="Search objectives..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Performance Goal / OKR"
        subtitle="Establish quantifiable target metric and due date."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Objective Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Architect Next-Gen Micro-frontend Engine"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner *</label>
              <select
                required
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.emp_id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Review Cycle</label>
              <select
                value={formData.cycle}
                onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Engineering">Engineering & Tech</option>
                <option value="Business">Business Impact</option>
                <option value="Leadership">Leadership & Mentorship</option>
                <option value="Process">Process & Quality</option>
                <option value="Personal Development">Personal Development</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Metric</label>
              <input
                type="text"
                placeholder="e.g. <1.2s Core Web Vitals"
                value={formData.metric_target}
                onChange={(e) => setFormData({ ...formData, metric_target: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
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
              Save Objective
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
