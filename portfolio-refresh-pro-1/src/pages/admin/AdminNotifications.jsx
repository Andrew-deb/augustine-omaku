import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Mail, Info, CheckCheck, RefreshCw, AlertTriangle,
  Loader2, Inbox, Filter, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

/* ── helpers ─────────────────────────────────────────────────────────── */

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/* ── notification type helpers ───────────────────────────────────────── */

function getNotifIcon(type) {
  switch (type) {
    case 'booking':
    case 'new_booking':
      return { icon: Bell, color: 'text-neatgreen', bg: 'bg-neatgreen/10' };
    case 'contact':
    case 'contact_form':
      return { icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    default:
      return { icon: Info, color: 'text-gray-400', bg: 'bg-gray-400/10' };
  }
}

function getNotifCategory(type) {
  switch (type) {
    case 'booking':
    case 'new_booking':
      return 'booking';
    case 'contact':
    case 'contact_form':
      return 'contact';
    default:
      return 'system';
  }
}

/* ── filter tabs ─────────────────────────────────────────────────────── */

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'booking', label: 'Booking' },
  { value: 'contact', label: 'Contact' },
];

/* ── main component ──────────────────────────────────────────────────── */

export default function AdminNotifications() {
  const { session } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  /* filter */
  const [activeTab, setActiveTab] = useState('all');

  const authHeaders = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };

  /* ── fetch notifications ───────────────────────────────────────────── */

  const fetchNotifications = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);

    const unreadOnly = activeTab === 'unread' ? 'true' : 'false';

    try {
      const res = await fetch(
        apiUrl(`/admin/notifications?limit=50&unread_only=${unreadOnly}`),
        { headers: authHeaders }
      );
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : data.data ?? data.notifications ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ── mark single as read ───────────────────────────────────────────── */

  const markAsRead = async (id) => {
    setMarkingId(id);
    try {
      const res = await fetch(apiUrl(`/admin/notifications/${id}/read`), {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to mark as read');

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingId(null);
    }
  };

  /* ── mark all as read ──────────────────────────────────────────────── */

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch(apiUrl('/admin/notifications/mark-all-read'), {
        method: 'POST',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to mark all as read');

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── filtered list ─────────────────────────────────────────────────── */

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.is_read;
    return getNotifCategory(n.type ?? n.notification_type) === activeTab;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  /* ── loading ───────────────────────────────────────────────────────── */

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw size={28} className="text-neatgreen animate-spin" />
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={28} className="text-red-400 mx-auto mb-2" />
          <p className="text-gray-300">{error}</p>
          <button onClick={fetchNotifications} className="mt-3 px-4 py-2 bg-neatgreen text-gray-900 rounded-lg text-sm font-medium hover:brightness-110 transition">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-source">Notifications</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {unreadCount > 0 ? (
              <>
                <span className="text-neatgreen font-medium">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
              </>
            ) : (
              'All caught up!'
            )}
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={markingAll || unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {markingAll ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
          Mark All Read
        </button>
      </div>

      {/* ── filter tabs ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-800 rounded-xl border border-gray-700/50 p-1.5 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-neatgreen text-gray-900 shadow-lg shadow-neatgreen/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
            {tab.value === 'unread' && unreadCount > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'unread' ? 'bg-gray-900/30 text-gray-900' : 'bg-neatgreen/20 text-neatgreen'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── notification list ───────────────────────────────────────── */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const notifType = n.type ?? n.notification_type ?? 'system';
            const { icon: Icon, color, bg } = getNotifIcon(notifType);
            const isUnread = !n.is_read;

            return (
              <div
                key={n.id}
                onClick={() => isUnread && markAsRead(n.id)}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-gray-800 border-gray-700/80 hover:border-neatgreen/30 hover:bg-gray-800/80'
                    : 'bg-gray-800/50 border-gray-700/30 hover:bg-gray-800/70'
                }`}
              >
                {/* icon */}
                <div className={`shrink-0 p-2.5 rounded-xl ${bg}`}>
                  <Icon size={18} className={color} />
                </div>

                {/* content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-sm leading-relaxed ${isUnread ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {n.title ?? n.message}
                      </p>
                      {n.message && n.title && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{n.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isUnread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-neatgreen shadow-lg shadow-neatgreen/30" />
                      )}
                      {markingId === n.id && (
                        <Loader2 size={14} className="text-neatgreen animate-spin" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {timeAgo(n.created_at ?? n.timestamp)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      notifType.includes('booking') || notifType === 'new_booking'
                        ? 'bg-neatgreen/10 text-neatgreen'
                        : notifType.includes('contact')
                        ? 'bg-blue-400/10 text-blue-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {getNotifCategory(notifType)}
                    </span>
                    {isUnread && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="text-xs text-gray-500 hover:text-neatgreen transition opacity-0 group-hover:opacity-100 flex items-center gap-1"
                      >
                        <Eye size={12} />
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-gray-800 border border-gray-700/50 mb-4">
              <Inbox size={32} className="text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {activeTab === 'unread'
                ? "You're all caught up!"
                : 'Notifications will appear here when you get new bookings or messages.'}
            </p>
          </div>
        )}
      </div>

      {/* ── loading indicator for refetch ───────────────────────────── */}
      {loading && notifications.length > 0 && (
        <div className="flex justify-center py-4">
          <RefreshCw size={18} className="text-neatgreen animate-spin" />
        </div>
      )}
    </div>
  );
}
