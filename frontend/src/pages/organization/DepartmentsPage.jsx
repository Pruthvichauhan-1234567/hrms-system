import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, MapPin } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [locations, setLocations] = useState([]);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head_name: '',
    head_email: '',
    description: '',
    location: '',
    status: 'Active',
  });

  const fetchDepts = async () => {
    try {
      setLoading(true);
      const [deptData, locData] = await Promise.all([
        api.getDepartments(),
        api.getLocations(),
      ]);
      setDepartments(deptData || []);
      setLocations(locData || []);
    } catch (err) {
      console.error(err);
      addToast({ title: 'Error', message: 'Failed to load departments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      head_name: '',
      head_email: '',
      description: '',
      location: locations[0]?.id || '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      head_name: dept.head_name || '',
      head_email: dept.head_email || '',
      description: dept.description || '',
      location: dept.location || locations[0]?.id || '',
      status: dept.status || 'Active',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department ${name}?`)) return;
    try {
      await api.deleteDepartment(id);
      addToast({ title: 'Deleted', message: `${name} department deleted`, type: 'success' });
      fetchDepts();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.updateDepartment(editingDept.id, formData);
        addToast({ title: 'Success', message: 'Department updated', type: 'success' });
      } else {
        await api.createDepartment(formData);
        addToast({ title: 'Success', message: 'Department created', type: 'success' });
      }
      setIsModalOpen(false);
      fetchDepts();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500 line-clamp-1">{row.description || 'Core Department'}</div>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {val}
        </span>
      ),
    },
    {
      key: 'head_name',
      label: 'Department Head',
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val || 'Unassigned'}</div>
          <div className="text-[11px] text-slate-500">{row.head_email}</div>
        </div>
      ),
    },
    {
      key: 'employee_count',
      label: 'Members',
      align: 'center',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
          <Users className="w-3.5 h-3.5" />
          {val || 0}
        </span>
      ),
    },
    {
      key: 'location_name',
      label: 'Location',
      render: (val) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {val || 'Bengaluru HQ'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'Active'} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Departments ({departments.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure business functional divisions, department heads, and staffing quotas.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        searchKey="name"
        searchPlaceholder="Search departments by name or code..."
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"
              title="Edit Department"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
        subtitle="Specify code, head of department, and regional headquarters."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Engineering & Technology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. ENG"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} - {loc.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department Head</label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={formData.head_name}
                onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Head Email</label>
              <input
                type="email"
                placeholder="e.g. head@peoplepulse.io"
                value={formData.head_email}
                onChange={(e) => setFormData({ ...formData, head_email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Responsibilities, scope, and objectives of this department..."
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
              {editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
