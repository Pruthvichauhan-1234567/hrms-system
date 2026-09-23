import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Plus, User, Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = await api.getInterviews();
      setInterviews(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const columns = [
    {
      key: 'candidate_name',
      label: 'Candidate',
      sortable: true,
      render: (val) => <span className="font-bold text-xs text-slate-900">{val}</span>,
    },
    { key: 'interview_type', label: 'Evaluation Round', sortable: true },
    {
      key: 'interviewer_name',
      label: 'Interviewer',
      render: (val) => <span className="text-xs text-slate-700">{val || 'HR Team'}</span>,
    },
    {
      key: 'scheduled_date',
      label: 'Schedule',
      sortable: true,
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-800">
          {val} at {row.scheduled_time?.slice(0, 5)}
        </span>
      ),
    },
    {
      key: 'meeting_link',
      label: 'Meeting Link',
      render: (val) => (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Join Meeting</span>
        </a>
      ),
    },
    {
      key: 'result',
      label: 'Outcome',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Interviews & Evaluation Scorecards ({interviews.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Scheduled technical evaluations, interviewer feedback notes, and candidate recommendations.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={interviews}
        searchKey="candidate_name"
        searchPlaceholder="Search interviews..."
        isLoading={loading}
      />
    </div>
  );
}
