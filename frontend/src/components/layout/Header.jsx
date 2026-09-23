import React, { useState } from 'react';
import {
  Search,
  Bell,
  Clock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Check,
  CheckCircle2,
  Menu,
  Sparkles,
  Command
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';

export function Header({
  currentRole,
  onRoleChange,
  currentUser,
  onOpenSearch,
  onToggleSidebar,
  notifications = [],
  onRefreshNotifications,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(true);
  const { addToast } = useToast();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const roles = [
    { id: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full System Access & Settings', color: 'bg-indigo-600' },
    { id: 'HR_ADMIN', label: 'HR Admin', desc: 'People Operations & Payroll', color: 'bg-emerald-600' },
    { id: 'MANAGER', label: 'Department Manager', desc: 'Team approvals & Performance', color: 'bg-amber-600' },
    { id: 'EMPLOYEE', label: 'Employee', desc: 'Self-Service, Leaves & Payslips', color: 'bg-slate-700' },
  ];

  const handlePunch = async () => {
    setPunchLoading(true);
    try {
      const action = hasCheckedIn ? 'check_out' : 'check_in';
      const res = await api.recordPunch({
        employee_id: currentUser?.id,
        action,
      });
      setHasCheckedIn(!hasCheckedIn);
      addToast({
        title: action === 'check_in' ? 'Checked In' : 'Checked Out',
        message: res.message || 'Attendance status recorded successfully',
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Attendance Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setPunchLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      onRefreshNotifications();
      addToast({
        title: 'Notifications Cleared',
        message: 'All notifications marked as read',
        type: 'info',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/85 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
      {/* Left: Mobile Toggle & Global Command Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 w-60 sm:w-80 px-3 py-1.5 text-xs text-gray-400 bg-white/70 hover:bg-white border border-gray-200 rounded-xl transition-all group text-left cursor-pointer shadow-2xs"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span className="flex-1 truncate font-medium text-gray-500">Search system (Ctrl+K)...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-200 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Role Switcher, Quick Check-in, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Check-in Terminal Button */}
        <button
          onClick={handlePunch}
          disabled={punchLoading}
          className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            hasCheckedIn
              ? 'bg-green-50/90 text-green-800 border-green-200 hover:bg-green-100/90'
              : 'bg-indigo-50/90 text-indigo-800 border-indigo-200 hover:bg-indigo-100/90'
          }`}
          title="Simulate Check-in or Check-out"
        >
          <Clock className={`w-3.5 h-3.5 ${hasCheckedIn ? 'text-green-600' : 'text-indigo-600'}`} />
          <span>{hasCheckedIn ? 'Checked In (09:12 AM)' : 'Check In Now'}</span>
        </button>

        {/* Role Switcher Toolbar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white/80 hover:bg-white text-gray-700 border border-gray-200 shadow-2xs transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline text-gray-500 font-normal">Role:</span>
            <span className="text-gray-900 font-bold">{roles.find((r) => r.id === currentRole)?.label || currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-40 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-1.5 text-[10.5px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
                <span>Switch Role Persona</span>
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
              </div>
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onRoleChange(r.id);
                    setShowRoleMenu(false);
                    addToast({
                      title: `Role Switched: ${r.label}`,
                      message: `UI tailored for ${r.desc}`,
                      type: 'info',
                    });
                  }}
                  className={`flex items-start gap-2.5 px-3.5 py-2 hover:bg-slate-50 cursor-pointer transition-colors ${
                    currentRole === r.id ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${r.color}`} />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-900 flex items-center justify-between">
                      {r.label}
                      {currentRole === r.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100/80 border border-gray-200 shadow-2xs transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/90 overflow-hidden z-40 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="text-xs font-bold text-gray-900">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 text-xs hover:bg-gray-50/70 transition-colors ${
                        !notif.is_read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-gray-900">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-gray-600 mt-0.5 text-[11px]">{notif.message}</p>
                      <div className="mt-1 text-[10px] text-gray-400 font-medium">
                        {notif.category} • Just now
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100/80 transition-colors cursor-pointer"
          >
            <Avatar
              name={currentUser?.full_name || 'Aarav Sharma'}
              src={currentUser?.avatar_url}
              size="md"
              status="active"
            />
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {currentUser?.full_name || 'Aarav Sharma'}
              </div>
              <div className="text-[11px] text-gray-500 leading-tight">
                {currentUser?.designation_name || 'Chief Technology Officer'}
              </div>
            </div>
            <ChevronDown className="hidden lg:block w-3.5 h-3.5 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/90 py-2 z-40 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-xs font-bold text-gray-900">{currentUser?.full_name || 'Aarav Sharma'}</div>
                <div className="text-[11px] text-gray-500">{currentUser?.email || 'aarav.sharma@peoplepulse.io'}</div>
                <div className="text-[10px] font-mono text-indigo-600 mt-1 font-semibold">
                  {currentUser?.emp_id || 'EMP-1001'}
                </div>
              </div>
              <div className="py-1">
                <a
                  href="#/employees/1"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                >
                  My 360° Profile
                </a>
                <a
                  href="#/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Account Settings
                </a>
              </div>
              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    addToast({ title: 'Session Active', message: 'You are in demo workspace mode.', type: 'info' });
                  }}
                  className="w-full flex items-center gap-2 px-4 py-1.5 text-xs text-red-600 hover:bg-red-50 font-medium text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
