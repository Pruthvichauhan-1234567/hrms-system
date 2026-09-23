import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Tag } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    day_of_week: 'Monday',
    holiday_type: 'National',
    description: '',
  });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const data = await api.getHolidays();
      setHolidays(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createHoliday(formData);
      addToast({ title: 'Success', message: 'Holiday added to company calendar', type: 'success' });
      setIsModalOpen(false);
      fetchHolidays();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Holiday Festival / Observance',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.description || 'Public Holiday'}</div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
          {val}
        </span>
      ),
    },
    { key: 'day_of_week', label: 'Day of Week', sortable: true },
    {
      key: 'holiday_type',
      label: 'Classification',
      render: (val) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Company Holiday Calendar (2026)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official statutory paid non-working days and restricted cultural observances.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              date: new Date().toISOString().split('T')[0],
              day_of_week: 'Monday',
              holiday_type: 'National',
              description: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={holidays}
        searchKey="name"
        searchPlaceholder="Search holidays..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Holiday"
        subtitle="Register new official non-working day."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Holiday Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali (Deepavali)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  setFormData({
                    ...formData,
                    date: e.target.value,
                    day_of_week: days[d.getDay()],
                  });
                }}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Classification</label>
              <select
                value={formData.holiday_type}
                onChange={(e) => setFormData({ ...formData, holiday_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="National">National Holiday</option>
                <option value="Gazetted">Gazetted Holiday</option>
                <option value="Restricted">Restricted / Optional</option>
              </select>
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
              Save Holiday
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
