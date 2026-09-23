import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, Building2 } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    team_lead_name: '',
    description: '',
  });

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const [teamData, deptData] = await Promise.all([
        api.getTeams(),
        api.getDepartments(),
      ]);
      setTeams(teamData || []);
      setDepartments(deptData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createTeam(formData);
      addToast({ title: 'Success', message: 'Team created', type: 'success' });
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Team Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{val}</div>
          <div className="text-[11px] text-slate-500">{row.description || 'Functional squad'}</div>
        </div>
      ),
    },
    { key: 'department_name', label: 'Department', sortable: true },
    { key: 'team_lead_name', label: 'Team Lead', sortable: true },
    {
      key: 'member_count',
      label: 'Members Count',
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
            Teams & Pods ({teams.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cross-functional squads, project teams, and pod leadership.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              department: departments[0]?.id || '',
              team_lead_name: '',
              description: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={teams}
        searchKey="name"
        searchPlaceholder="Search teams..."
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Team Pod"
        subtitle="Define pod name, lead, and parent department."
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Team Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Platform Core Architecture"
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
              <label className="block font-semibold text-slate-700 mb-1">Team Lead</label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={formData.team_lead_name}
                onChange={(e) => setFormData({ ...formData, team_lead_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Team focus and deliverables..."
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
              Create Team
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
