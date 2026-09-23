import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  ArrowRight,
  Clock,
  Briefcase,
  Star,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Modal, Drawer } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function HiringPipelinePage() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const { addToast } = useToast();

  const stages = [
    { id: 'Applied', label: 'Applied', color: 'border-slate-300' },
    { id: 'Screening', label: 'Screening', color: 'border-amber-300' },
    { id: 'Shortlisted', label: 'Shortlisted', color: 'border-indigo-300' },
    { id: 'Interview', label: 'Interview Scheduled', color: 'border-sky-300' },
    { id: 'Technical Round', label: 'Technical Round', color: 'border-violet-300' },
    { id: 'HR Round', label: 'HR Round', color: 'border-teal-300' },
    { id: 'Selected', label: 'Selected / Offer', color: 'border-emerald-300' },
    { id: 'Rejected', label: 'Rejected', color: 'border-rose-300' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    job_opening: '',
    experience_years: 4.0,
    current_company: '',
    current_ctc: '1000000',
    expected_ctc: '1500000',
    notice_period_days: 30,
    source: 'LinkedIn',
    stage: 'Applied',
    rating: 4,
    notes: '',
  });

  const [interviewForm, setInterviewForm] = useState({
    candidate: '',
    interview_type: 'Technical',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '14:30',
    meeting_link: 'https://meet.google.com/pph-rec-board',
    feedback: 'Evaluating core system capabilities and problem solving.',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candData, jobData] = await Promise.all([
        api.getCandidates(),
        api.getJobOpenings(),
      ]);
      setCandidates(candData || []);
      setJobs(jobData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStageChange = async (candidateId, newStage) => {
    try {
      await api.updateCandidateStage(candidateId, newStage);
      addToast({
        title: 'Stage Updated',
        message: `Candidate moved to ${newStage}`,
        type: 'success',
      });
      fetchData();
      if (selectedCandidate && selectedCandidate.id === candidateId) {
        setSelectedCandidate((prev) => ({ ...prev, stage: newStage }));
      }
    } catch (err) {
      addToast({ title: 'Update Failed', message: err.message, type: 'error' });
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.createCandidate(formData);
      addToast({ title: 'Candidate Added', message: `${formData.name} added to pipeline`, type: 'success' });
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      await api.createInterview({
        ...interviewForm,
        candidate: selectedCandidate?.id,
      });
      addToast({ title: 'Interview Scheduled', message: 'Calendar invite and meeting link generated', type: 'success' });
      setIsInterviewModalOpen(false);
      fetchData();
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Hiring Pipeline Kanban ({candidates.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Move candidates across recruitment evaluation stages, schedule technical rounds, and extend offers.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              phone: '',
              job_opening: jobs[0]?.id || '',
              experience_years: 4.0,
              current_company: 'Tech Enterprise',
              current_ctc: '1200000',
              expected_ctc: '1800000',
              notice_period_days: 30,
              source: 'LinkedIn',
              stage: 'Applied',
              rating: 5,
              notes: 'Strong profile match.',
            });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Interactive Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 min-h-[650px] items-start">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col max-h-[750px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-1.5 mb-2">
                <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs border border-slate-200">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {stageCandidates.length === 0 ? (
                  <div className="py-8 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/40">
                    No candidates
                  </div>
                ) : (
                  stageCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          onClick={() => setSelectedCandidate(cand)}
                          className="cursor-pointer"
                        >
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {cand.name}
                          </h4>
                          <div className="text-[11px] font-semibold text-slate-500 line-clamp-1">
                            {cand.job_title}
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{cand.rating}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <div>
                          Current: <strong className="text-slate-700">{cand.current_company || 'Independent'}</strong> ({cand.experience_years} yrs)
                        </div>
                        <div>
                          Exp CTC: <strong className="text-indigo-600 font-mono">₹{(cand.expected_ctc / 100000).toFixed(1)}L</strong> • {cand.notice_period_days}d notice
                        </div>
                      </div>

                      {/* Stage Move Dropdown Controller */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <select
                          value={cand.stage}
                          onChange={(e) => handleStageChange(cand.id, e.target.value)}
                          className="w-full text-[11px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                        >
                          {stages.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to: {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Profile Drawer */}
      <Drawer
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        title={selectedCandidate?.name || 'Candidate Details'}
        subtitle={`Applied for ${selectedCandidate?.job_title}`}
      >
        {selectedCandidate && (
          <div className="space-y-6 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">{selectedCandidate.name}</span>
                <span className="font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md">
                  Stage: {selectedCandidate.stage}
                </span>
              </div>
              <div className="text-slate-600 flex items-center gap-4">
                <span>{selectedCandidate.email}</span>
                <span>{selectedCandidate.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 font-medium">Current CTC</span>
                <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  ₹{Number(selectedCandidate.current_ctc).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border">
                <span className="text-slate-400 font-medium">Expected CTC</span>
                <div className="font-mono font-bold text-indigo-600 text-sm mt-0.5">
                  ₹{Number(selectedCandidate.expected_ctc).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Recruiter Notes</span>
              <p className="p-3 bg-slate-50 rounded-xl border text-slate-700 italic">
                "{selectedCandidate.notes || 'No notes added yet.'}"
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setInterviewForm((p) => ({ ...p, candidate: selectedCandidate.id }));
                  setIsInterviewModalOpen(true);
                }}
                className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
              >
                Schedule Technical Interview
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStageChange(selectedCandidate.id, 'Selected')}
                  className="py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200"
                >
                  Accept / Extend Offer
                </button>
                <button
                  onClick={() => handleStageChange(selectedCandidate.id, 'Rejected')}
                  className="py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
                >
                  Reject Candidate
                </button>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Candidate to Pipeline"
        subtitle="Record applicant profile details and applied opening."
      >
        <form onSubmit={handleAddCandidate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tanmay Deshmukh"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applied Position *</label>
              <select
                required
                value={formData.job_opening}
                onChange={(e) => setFormData({ ...formData, job_opening: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Exp (Years)</label>
              <input
                type="number"
                step="0.5"
                value={formData.experience_years}
                onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current CTC</label>
              <input
                type="number"
                value={formData.current_ctc}
                onChange={(e) => setFormData({ ...formData, current_ctc: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected CTC</label>
              <input
                type="number"
                value={formData.expected_ctc}
                onChange={(e) => setFormData({ ...formData, expected_ctc: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono"
              />
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
              Save to Pipeline
            </button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Interview Round"
        subtitle="Set date, time, evaluation round, and meeting link."
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Round Type</label>
              <select
                value={interviewForm.interview_type}
                onChange={(e) => setInterviewForm({ ...interviewForm, interview_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="Screening">HR Screening</option>
                <option value="Technical">Technical Round</option>
                <option value="System Design">System Architecture</option>
                <option value="Managerial">Managerial Round</option>
                <option value="Culture Fit">Culture & Values</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={interviewForm.scheduled_date}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time *</label>
              <input
                type="time"
                required
                value={interviewForm.scheduled_time}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Link</label>
              <input
                type="url"
                value={interviewForm.meeting_link}
                onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInterviewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs"
            >
              Confirm Interview
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
