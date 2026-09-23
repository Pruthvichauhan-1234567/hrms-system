import React, { useState, useEffect } from 'react';
import { Award, Plus, Star, Users, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    employee: '',
    reviewer: '',
    cycle: '',
    key_achievements: 'Led high impact platform initiatives and exceeded SLAs.',
    core_strengths: 'Analytical problem solving, ownership, and cross-team collaboration.',
    improvement_areas: 'More proactive roadmap visibility.',
    manager_feedback: 'Demonstrates strong technical maturity and exemplary consistency.',
    technical_skills_rating: 4.5,
    communication_rating: 4.5,
    teamwork_rating: 4.8,
    overall_rating: 4.6,
    promotion_recommended: false,
    salary_hike_recommended_percent: 12.0,
    status: 'Finalized',
    review_date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [revData, empData, cycleData] = await Promise.all([
        api.getPerformanceReviews(),
        api.getEmployees(),
        api.getPerformanceCycles(),
      ]);
      setReviews(revData || []);
      setEmployees(empData || []);
      setCycles(cycleData || []);

      if (empData?.length > 0 && !formData.employee) {
        setFormData((p) => ({
          ...p,
          employee: empData[0].id,
          reviewer: empData[1]?.id || empData[0].id,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createPerformanceReview(formData);
      addToast({ title: 'Review Submitted', message: 'Performance scorecard recorded', type: 'success' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'employee_name',
      label: 'Employee',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={val} src={row.avatar_url} size="sm" />
          <div>
            <div className="text-xs font-bold text-slate-900">{val}</div>
            <div className="text-[10px] text-slate-500">{row.department_name}</div>
          </div>
        </div>
      ),
    },
    { key: 'cycle_title', label: 'Evaluation Cycle', sortable: true },
    {
      key: 'reviewer_name',
      label: 'Reviewer',
      render: (val) => <span className="text-xs text-slate-700">{val || 'Manager'}</span>,
    },
    {
      key: 'overall_rating',
      label: 'Rating (out of 5.0)',
      align: 'center',
      sortable: true,
      render: (val) => (
        <span className="font-black text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400" />
          {val} / 5.0
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Review State',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            360° Performance Reviews ({reviews.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Performance scorecards, calibration cycles, peer ratings, and compensation recommendations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Conduct Review</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        searchKey="employee_name"
        searchPlaceholder="Search reviews by employee..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Conduct 360° Performance Evaluation"
        subtitle="Submit evaluation feedback, strengths, ratings, and salary recommendations."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee Under Review *</label>
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Overall Rating (1.0 to 5.0)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              required
              value={formData.overall_rating}
              onChange={(e) => setFormData({ ...formData, overall_rating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg font-mono font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Key Strengths</label>
            <textarea
              rows={2}
              value={formData.core_strengths}
              onChange={(e) => setFormData({ ...formData, core_strengths: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Manager Feedback Notes</label>
            <textarea
              rows={2}
              value={formData.manager_feedback}
              onChange={(e) => setFormData({ ...formData, manager_feedback: e.target.value })}
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
              Submit Scorecard
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
