import React, { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Trash2, Shield, Calendar, AlertCircle } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    document_type: 'Company Policy',
    employee: '',
    is_company_wide: true,
    file_size_kb: 512,
    file_format: 'PDF',
    status: 'Verified',
  });

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const [docData, empData] = await Promise.all([
        api.getDocuments(),
        api.getEmployees(),
      ]);
      setDocuments(docData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createDocument({
        ...formData,
        employee: formData.is_company_wide ? null : formData.employee,
      });
      addToast({ title: 'Document Stored', message: 'Document uploaded and verified', type: 'success' });
      setIsModalOpen(false);
      fetchDocs();
    } catch (err) {
      addToast({ title: 'Upload Failed', message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete document "${title}"?`)) return;
    try {
      await api.deleteDocument(id);
      addToast({ title: 'Deleted', message: 'Document removed from repository', type: 'success' });
      fetchDocs();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Document Title',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{val}</div>
            <div className="text-[11px] text-slate-500">{row.document_type}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'employee_name',
      label: 'Applicable Entity',
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.is_company_wide ? '🌐 Company-Wide Policy' : val || 'Employee Specific'}
        </span>
      ),
    },
    {
      key: 'file_size_kb',
      label: 'Format & Size',
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-500">
          {row.file_format} • {val} KB
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Verification Status',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Document Repository ({documents.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Secure digital vault for corporate policies, contracts, NDA agreements, and employee identity proofs.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={documents}
        searchKey="title"
        searchPlaceholder="Search repository..."
        filterOptions={['All', 'Verified', 'Pending Verification', 'Expired']}
        filterKey="status"
        isLoading={loading}
        actions={(row) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => addToast({ title: 'Download Triggered', message: `Downloading ${row.title}`, type: 'info' })}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(row.id, row.title)}
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
        title="Upload Document to Vault"
        subtitle="Catalog legal agreement, policy document, or verified certificate."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Remote Work Policy Handbook 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Document Category</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Company Policy">Company Policy</option>
                <option value="Employment Agreement">Employment Agreement</option>
                <option value="Offer Letter">Offer Letter</option>
                <option value="NDA">Non-Disclosure Agreement (NDA)</option>
                <option value="Aadhaar / ID Card">Aadhaar / ID Card</option>
                <option value="Health Insurance">Health Insurance Card</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Format</label>
              <select
                value={formData.file_format}
                onChange={(e) => setFormData({ ...formData, file_format: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white font-mono"
              >
                <option value="PDF">PDF Document</option>
                <option value="DOCX">DOCX Word Document</option>
                <option value="PNG">PNG Image</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_cw"
              checked={formData.is_company_wide}
              onChange={(e) => setFormData({ ...formData, is_company_wide: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_cw" className="font-semibold text-slate-700 cursor-pointer">
              Company-Wide Document (Accessible to all employees)
            </label>
          </div>
          {!formData.is_company_wide && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Associated Employee</label>
              <select
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.emp_id})
                  </option>
                ))}
              </select>
            </div>
          )}
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
              Upload & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
