import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, Users, CheckCircle, Clock, TrendingUp, MessageSquare,
  RefreshCw, AlertTriangle, Bell, Mail, Info, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Area, AreaChart
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

/* ── helpers ─────────────────────────────────────────────────────────── */

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatNumber(num) {
  if (num == null) return '—';
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

/* ── custom chart tooltip ────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 shadow-xl">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">
        {payload[0].value} booking{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

/* ── KPI card component ──────────────────────────────────────────────── */

function KpiCard({ icon: Icon, label, value, iconColor, subtitle }) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-5 hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-gray-700/50 ${iconColor || 'text-neatgreen'}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white font-source tracking-tight">
        {value ?? '—'}
      </p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

/* ── fill rate bar ───────────────────────────────────────────────────── */

function FillRateBar({ session }) {
  const confirmed = session.confirmed_count ?? session.confirmed ?? 0;
  const capacity = session.capacity ?? 1;
  const percent = Math.min(Math.round((confirmed / capacity) * 100), 100);
  const barColor =
    percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-yellow-500' : 'bg-neatgreen';
  const textColor =
    percent >= 100 ? 'text-red-400' : percent >= 80 ? 'text-yellow-400' : 'text-neatgreen';

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-sm text-gray-300 truncate max-w-[200px]" title={session.title}>
          {session.title}
        </p>
        <span className={`text-xs font-medium ${textColor} ml-2 shrink-0`}>
          {confirmed}/{capacity} ({percent}%)
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ── notification type icon ──────────────────────────────────────────── */

function NotifIcon({ type }) {
  switch (type) {
    case 'booking':
    case 'new_booking':
      return <Bell size={16} className="text-neatgreen" />;
    case 'contact':
    case 'contact_form':
      return <Mail size={16} className="text-blue-400" />;
    default:
      return <Info size={16} className="text-gray-400" />;
  }
}

/* ── main dashboard ──────────────────────────────────────────────────── */

export default function AdminDashboard() {
  const { session } = useAuth();

  const [overview, setOverview] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };

  /* fetch all data on mount */
  const fetchAll = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);

    try {
      const [ovRes, trRes, sesRes, notRes] = await Promise.allSettled([
        fetch(apiUrl('/admin/analytics/overview'), { headers: authHeaders }),
        fetch(apiUrl('/admin/analytics/bookings-trend?days=30'), { headers: authHeaders }),
        fetch(apiUrl('/admin/analytics/sessions-breakdown'), { headers: authHeaders }),
        fetch(apiUrl('/admin/notifications?limit=5'), { headers: authHeaders }),
      ]);

      if (ovRes.status === 'fulfilled' && ovRes.value.ok) {
        setOverview(await ovRes.value.json());
      }
      if (trRes.status === 'fulfilled' && trRes.value.ok) {
        const data = await trRes.value.json();
        setTrendData(
          (Array.isArray(data) ? data : data.data ?? []).map((d) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: d.count,
          }))
        );
      }
      if (sesRes.status === 'fulfilled' && sesRes.value.ok) {
        const data = await sesRes.value.json();
        setSessions(Array.isArray(data) ? data : data.data ?? []);
      }
      if (notRes.status === 'fulfilled' && notRes.value.ok) {
        const data = await notRes.value.json();
        setNotifications(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── loading state ─────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={28} className="text-neatgreen animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── error state ───────────────────────────────────────────────────── */

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle size={28} className="text-red-400" />
          <p className="text-gray-300">{error}</p>
          <button
            onClick={fetchAll}
            className="mt-2 px-4 py-2 bg-neatgreen text-gray-900 rounded-lg text-sm font-medium hover:brightness-110 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── KPI values ────────────────────────────────────────────────────── */

  const kpis = [
    {
      icon: Calendar,
      label: 'Active Sessions',
      value: formatNumber(overview?.active_sessions ?? overview?.active_session_count ?? 0),
      iconColor: 'text-neatgreen',
    },
    {
      icon: Users,
      label: 'Total Bookings',
      value: formatNumber(overview?.total_bookings ?? overview?.total_booking_count ?? 0),
      iconColor: 'text-blue-400',
    },
    {
      icon: CheckCircle,
      label: 'Confirmed',
      value: formatNumber(overview?.confirmed ?? overview?.confirmed_count ?? 0),
      iconColor: 'text-emerald-400',
    },
    {
      icon: Clock,
      label: 'Waitlisted',
      value: formatNumber(overview?.waitlisted ?? overview?.waitlisted_count ?? 0),
      iconColor: 'text-yellow-400',
    },
    {
      icon: TrendingUp,
      label: 'Fill Rate',
      value: `${overview?.fill_rate ?? overview?.fill_rate_percent ?? 0}%`,
      iconColor: 'text-purple-400',
    },
    {
      icon: MessageSquare,
      label: 'Messages Today',
      value: formatNumber(overview?.messages_today ?? overview?.today_messages ?? 0),
      iconColor: 'text-pink-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-source">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Overview of your platform activity</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-gray-600 transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── booking trend chart ─────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={18} className="text-neatgreen" />
            <h2 className="text-lg font-semibold text-white font-source">Booking Trend</h2>
          </div>
          <span className="text-xs text-gray-500">Last 30 days</span>
        </div>

        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="neatgreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#66D37E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#66D37E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#66D37E"
                strokeWidth={2.5}
                fill="url(#neatgreenGradient)"
                dot={false}
                activeDot={{ r: 5, fill: '#66D37E', stroke: '#1f2937', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-gray-500 text-sm">
            <Activity size={18} className="mr-2 opacity-50" />
            No booking data available for this period
          </div>
        )}
      </div>

      {/* ── bottom two columns ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* session fill rates */}
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <TrendingUp size={18} className="text-neatgreen" />
            <h2 className="text-lg font-semibold text-white font-source">Session Fill Rates</h2>
          </div>

          {sessions.length > 0 ? (
            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {sessions.map((s, i) => (
                <FillRateBar key={s.id ?? s.code ?? i} session={s} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No sessions found</p>
          )}
        </div>

        {/* recent activity */}
        <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Bell size={18} className="text-neatgreen" />
            <h2 className="text-lg font-semibold text-white font-source">Recent Activity</h2>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-1">
              {notifications.map((n, i) => (
                <div
                  key={n.id ?? i}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    !n.is_read ? 'bg-gray-700/40' : 'hover:bg-gray-700/20'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-gray-700/60">
                    <NotifIcon type={n.type ?? n.notification_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? 'text-white font-medium' : 'text-gray-300'}`}>
                      {n.title ?? n.message}
                    </p>
                    {n.message && n.title && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {timeAgo(n.created_at ?? n.timestamp)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="mt-2 w-2 h-2 rounded-full bg-neatgreen shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
