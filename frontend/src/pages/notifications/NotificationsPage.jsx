import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Clock, ShieldCheck, Filter, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const { addToast } = useToast();

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    try {
      await api.markNotificationsRead();
      addToast({ title: 'Inbox Cleared', message: 'All notifications marked as read', type: 'info' });
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ['All', 'Leave', 'Payroll', 'Recruitment', 'Performance', 'Asset', 'System'];

  const filtered = notifications.filter((n) => {
    if (activeTab !== 'All' && n.category !== activeTab) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Notification Center ({notifications.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            System announcements, leave requests, recruitment updates, and payroll processing events.
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-indigo-600" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start gap-3.5 hover:bg-slate-50 transition-colors ${
                !item.is_read ? 'bg-indigo-50/25' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{item.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {!item.is_read && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Unread
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
