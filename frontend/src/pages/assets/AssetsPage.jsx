import React, { useState, useEffect } from 'react';
import { Laptop, Plus, UserPlus, ArrowLeftRight, Trash2, CheckCircle2, Shield } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState('');
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    asset_id: '',
    name: '',
    category: 'Laptop',
    brand_model: 'Apple Inc.',
    serial_number: '',
    purchase_cost: '145000',
    purchase_date: '2024-01-15',
    condition: 'Brand New',
    status: 'Available',
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const [astData, empData] = await Promise.all([
        api.getAssets(),
        api.getEmployees(),
      ]);
      setAssets(astData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await api.createAsset(formData);
      addToast({ title: 'Asset Cataloged', message: `${formData.name} added to inventory`, type: 'success' });
      setIsAddModalOpen(false);
      fetchAssets();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.assignAsset(selectedAsset.id, assignEmpId);
      addToast({ title: 'Asset Assigned', message: `Hardware assigned successfully`, type: 'success' });
      setIsAssignModalOpen(false);
      fetchAssets();
    } catch (err) {
      addToast({ title: 'Assignment Failed', message: err.message, type: 'error' });
    }
  };

  const handleReturn = async (id, name) => {
    if (!window.confirm(`Return ${name} back to available inventory?`)) return;
    try {
      await api.returnAsset(id);
      addToast({ title: 'Returned', message: `${name} is now available in stock`, type: 'success' });
      fetchAssets();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Asset Name & Details',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[10px] font-mono text-slate-500">{row.asset_id} • S/N: {row.serial_number}</div>
        </div>
      ),
    },
    { key: 'category', label: 'Category', sortable: true },
    {
      key: 'assigned_to_name',
      label: 'Assigned User',
      render: (val) => (
        <span className="text-xs font-semibold text-slate-800">
          {val ? `👤 ${val}` : '— In Stock'}
        </span>
      ),
    },
    {
      key: 'condition',
      label: 'Condition',
      render: (val) => <StatusBadge status={val} size="xs" />,
    },
    {
      key: 'purchase_cost',
      label: 'Value (INR)',
      align: 'right',
      render: (val) => <span className="font-mono text-xs text-slate-800 font-bold">₹{Number(val).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'status',
      label: 'Stock Status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Hardware & IT Asset Inventory ({assets.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track serial numbers, employee laptop allocations, and warranty maintenance history.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              asset_id: `AST-${Math.floor(100 + Math.random() * 900)}`,
              name: '',
              category: 'Laptop',
              brand_model: 'Apple MacBook Pro M3',
              serial_number: `C02G${Math.floor(100000 + Math.random() * 900000)}`,
              purchase_cost: '185000',
              purchase_date: '2024-01-15',
              condition: 'Brand New',
              status: 'Available',
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={assets}
        searchKey="name"
        searchPlaceholder="Search assets by name or serial..."
        filterOptions={['All', 'Available', 'Assigned', 'Under Maintenance']}
        filterKey="status"
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            {row.status === 'Available' ? (
              <button
                onClick={() => {
                  setSelectedAsset(row);
                  setAssignEmpId(employees[0]?.id || '');
                  setIsAssignModalOpen(true);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              >
                Assign Asset
              </button>
            ) : row.status === 'Assigned' ? (
              <button
                onClick={() => handleReturn(row.id, row.name)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Return to Stock
              </button>
            ) : null}
          </div>
        )}
      />

      {/* Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Asset: ${selectedAsset?.name}`}
        subtitle="Select employee to allocate this company device."
      >
        <form onSubmit={handleAssign} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Beneficiary Employee *</label>
            <select
              required
              value={assignEmpId}
              onChange={(e) => setAssignEmpId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.full_name} ({e.emp_id}) - {e.department_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Asset Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Catalog New IT Asset"
        subtitle="Enter asset model, serial code, and valuation details."
      >
        <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Asset Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dell XPS 15 9530 OLED"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop Workstation</option>
                <option value="Monitor">External Monitor</option>
                <option value="Mobile Phone">Smartphone</option>
                <option value="Peripherals">Peripherals</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Valuation (INR)</label>
              <input
                type="number"
                value={formData.purchase_cost}
                onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Brand New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              Save Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
