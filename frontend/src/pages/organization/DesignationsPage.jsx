import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, Users, Building2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function DesignationsPage() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    level: 'Mid',
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [desData, deptData] = await Promise.all([
        api.getDesignations(),
        api.getDepartments(),
      ]);
      setDesignations(desData || []);
      setDepartments(deptData || []);
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', message: 'Failed to load designations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      department: departments[0]?.id || '',
      level: 'Mid',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      department: item.department || departments[0]?.id || '',
      level: item.level || 'Mid',
      description: item.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete designation ${name}?`)) return;
    try {
      await api.deleteDesignation(id);
      addToast({ title: 'Deleted', message: `${name} deleted`, type: 'success' });
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateDesignation(editingItem.id, formData);
        addToast({ title: 'Success', message: 'Designation updated', type: 'success' });
      } else {
        await api.createDesignation(formData);
        addToast({ title: 'Success', message: 'Designation created', type: 'success' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Designation Title',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.description || 'Job role title'}</div>
        </div>
      ),
    },
    {
      key: 'department_name',
      label: 'Department',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold text-slate-700">{val || 'General'}</span>
      ),
    },
    {
      key: 'level',
      label: 'Seniority Level',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'employee_count',
      label: 'Staff Count',
      align: 'center',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
          <Users className="w-3 h-3" />
          {val || 0}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Designations ({designations.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Job titles, seniority bands, and organizational banding levels.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Designation</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={designations}
        searchKey="name"
        searchPlaceholder="Search designations..."
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.id, row.name)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit: ${editingItem.name}` : 'New Designation'}
        subtitle="Associate designation with department and seniority level."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Designation Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Full-Stack Engineer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <label className="block font-semibold text-slate-700 mb-1">Seniority Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Junior">Junior Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Team Lead</option>
                <option value="Manager">Managerial</option>
                <option value="Executive">Executive / C-Suite</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Scope and expectations for this role..."
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
              {editingItem ? 'Save Changes' : 'Create Designation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
