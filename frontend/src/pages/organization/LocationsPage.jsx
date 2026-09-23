import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Building, Users } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    is_headquarters: false,
  });

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await api.getLocations();
      setLocations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createLocation(formData);
      addToast({ title: 'Success', message: 'Location created successfully', type: 'success' });
      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Campus / Office',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <span>{val}</span>
            {row.is_headquarters && (
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                Headquarters
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">{row.address}</div>
        </div>
      ),
    },
    { key: 'city', label: 'City', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    {
      key: 'employee_count',
      label: 'Stationed Staff',
      align: 'center',
      render: (val) => (
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
          {val || 0} members
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Work Locations ({locations.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Global campuses, regional centers, and registered enterprise facilities.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={locations}
        searchKey="name"
        searchPlaceholder="Search campus or city..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Campus Location"
        subtitle="Register office address and headquarters designation."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Campus Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Pune Innovation Center"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. Mindspace Cyberabad, HITEC City"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_hq"
              checked={formData.is_headquarters}
              onChange={(e) => setFormData({ ...formData, is_headquarters: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_hq" className="font-semibold text-slate-700 cursor-pointer">
              Set as Primary Global Headquarters (HQ)
            </label>
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
              Save Campus
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
