import React, { useState, useEffect } from 'react';
import { Clock, Plus, CheckCircle2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    start_time: '09:00',
    end_time: '18:00',
    grace_time_minutes: 15,
    break_duration_minutes: 60,
    is_default: false,
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const data = await api.getShifts();
      setShifts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createShift(formData);
      addToast({ title: 'Success', message: 'Shift schedule created', type: 'success' });
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Shift Name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-slate-900">{val}</span>
          {row.is_default && (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
              Default
            </span>
          )}
        </div>
      ),
    },
    { key: 'code', label: 'Code', sortable: true },
    {
      key: 'start_time',
      label: 'Working Hours',
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-800">
          {val?.slice(0, 5)} - {row.end_time?.slice(0, 5)}
        </span>
      ),
    },
    {
      key: 'grace_time_minutes',
      label: 'Grace Period',
      align: 'right',
      render: (val) => <span className="text-xs text-slate-700">{val} mins</span>,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Work Shifts & Timing Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure shift rotas, flexible windows, and grace time thresholds.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              code: `SH-${Math.floor(10 + Math.random() * 90)}`,
              start_time: '09:00',
              end_time: '18:00',
              grace_time_minutes: 15,
              break_duration_minutes: 60,
              is_default: false,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shift</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={shifts}
        searchKey="name"
        searchPlaceholder="Search shifts..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Shift Schedule"
        subtitle="Define start time, end time, and grace period."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Shift Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Night Rota Shift"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={formData.grace_time_minutes}
                onChange={(e) => setFormData({ ...formData, grace_time_minutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Break Duration (Minutes)</label>
              <input
                type="number"
                value={formData.break_duration_minutes}
                onChange={(e) => setFormData({ ...formData, break_duration_minutes: Number(e.target.value) })}
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
              Create Shift
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
