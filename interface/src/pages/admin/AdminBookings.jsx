import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Filter, Download, ChevronDown, ChevronRight, X,
  RefreshCw, AlertTriangle, Users, FileSpreadsheet, FileText,
  XCircle, Loader2, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

/* ── constants ───────────────────────────────────────────────────────── */

const STATUS_COLORS = {
  confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  waitlisted: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  canceled: 'bg-red-500/20 text-red-400 border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS = {
  confirmed: 'Confirmed',
  waitlisted: 'Waitlisted',
  canceled: 'Canceled',
  cancelled: 'Canceled',
};

const PAGE_SIZE = 50;

/* ── status chip ─────────────────────────────────────────────────────── */

function StatusChip({ status }) {
  const color = STATUS_COLORS[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  );
}

/* ── main component ──────────────────────────────────────────────────── */

export default function AdminBookings() {
  const { session } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* filters */
  const [search, setSearch] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [skip, setSkip] = useState(0);

  /* sessions list for filter dropdown */
  const [sessionsList, setSessionsList] = useState([]);

  /* expanded rows */
  const [expandedRows, setExpandedRows] = useState(new Set());

  /* canceling */
  const [canceling, setCanceling] = useState(null);

  /* exporting */
  const [exporting, setExporting] = useState(null);

  const authHeaders = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };

  /* ── fetch sessions for dropdown ───────────────────────────────────── */

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(apiUrl('/admin/sessions'), { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setSessionsList(Array.isArray(data) ? data : data.data ?? []))
      .catch(() => {});
  }, [session?.access_token]);

  /* ── fetch bookings ────────────────────────────────────────────────── */

  const fetchBookings = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (sessionFilter) params.set('session_code', sessionFilter);
    if (statusFilter) params.set('status', statusFilter);
    params.set('skip', skip.toString());
    params.set('limit', PAGE_SIZE.toString());

    try {
      const res = await fetch(apiUrl(`/admin/bookings?${params}`), { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
        setTotalCount(data.length);
      } else {
        setBookings(data.data ?? data.bookings ?? []);
        setTotalCount(data.total ?? data.count ?? (data.data ?? data.bookings ?? []).length);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, search, sessionFilter, statusFilter, skip]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* reset page on filter change */
  useEffect(() => {
    setSkip(0);
  }, [search, sessionFilter, statusFilter]);

  /* ── toggle expanded row ───────────────────────────────────────────── */

  const toggleRow = (ref) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  /* ── cancel booking ────────────────────────────────────────────────── */

  const cancelBooking = async (reference) => {
    if (!confirm(`Cancel booking ${reference}?`)) return;
    setCanceling(reference);
    try {
      const res = await fetch(apiUrl(`/admin/bookings/${reference}/cancel`), {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCanceling(null);
    }
  };

  /* ── export ────────────────────────────────────────────────────────── */

  const exportData = async (format) => {
    setExporting(format);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (sessionFilter) params.set('session_code', sessionFilter);
      if (statusFilter) params.set('status', statusFilter);

      const endpoint = format === 'csv' ? '/admin/bookings/export/csv' : '/admin/bookings/export/excel';
      const res = await fetch(apiUrl(`${endpoint}?${params}`), {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });

      if (!res.ok) throw new Error(`Failed to export ${format.toUpperCase()}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      setExporting(null);
    }
  };

  /* ── pagination ────────────────────────────────────────────────────── */

  const currentPage = Math.floor(skip / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const showingFrom = totalCount === 0 ? 0 : skip + 1;
  const showingTo = Math.min(skip + PAGE_SIZE, totalCount);

  /* ── loading ───────────────────────────────────────────────────────── */

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw size={28} className="text-neatgreen animate-spin" />
      </div>
    );
  }

  if (error && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={28} className="text-red-400 mx-auto mb-2" />
          <p className="text-gray-300">{error}</p>
          <button onClick={fetchBookings} className="mt-3 px-4 py-2 bg-neatgreen text-gray-900 rounded-lg text-sm font-medium hover:brightness-110 transition">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-source">Bookings</h1>
          <p className="text-sm text-gray-400 mt-0.5">{totalCount} booking{totalCount !== 1 ? 's' : ''} found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('csv')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-gray-600 transition disabled:opacity-50"
          >
            {exporting === 'csv' ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
            Export CSV
          </button>
          <button
            onClick={() => exportData('excel')}
            disabled={!!exporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm hover:border-gray-600 transition disabled:opacity-50"
          >
            {exporting === 'excel' ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            Export Excel
          </button>
        </div>
      </div>

      {/* ── filters bar ─────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-neatgreen transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <X size={14} />
              </button>
            )}
          </div>

          {/* session filter */}
          <div className="relative min-w-[180px]">
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neatgreen transition appearance-none pr-8"
            >
              <option value="">All Sessions</option>
              {sessionsList.map((s) => (
                <option key={s.code ?? s.id} value={s.code}>{s.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* status filter */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neatgreen transition appearance-none pr-8"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="canceled">Canceled</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── table ───────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
        {loading && (
          <div className="h-1 bg-gray-700 overflow-hidden">
            <div className="h-full bg-neatgreen animate-pulse w-1/3" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="w-8 px-3 py-3.5" />
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider">Reference</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Email</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Session</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden xl:table-cell">Date</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {bookings.map((b) => {
                const ref = b.reference ?? b.booking_reference ?? b.id;
                const isExpanded = expandedRows.has(ref);
                const canCancel = b.status === 'confirmed' || b.status === 'waitlisted';

                return (
                  <React.Fragment key={ref}>
                    <tr className="hover:bg-gray-700/30 transition-colors group">
                      <td className="px-3 py-4">
                        <button
                          onClick={() => toggleRow(ref)}
                          className="p-0.5 text-gray-500 hover:text-gray-300 transition"
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-neatgreen font-mono text-xs">{ref}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-white">{b.full_name ?? b.name ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-gray-400">{b.email ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-gray-300 truncate max-w-[160px] block">{b.session_title ?? b.session_code ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusChip status={b.status} />
                      </td>
                      <td className="px-5 py-4 hidden xl:table-cell">
                        <span className="text-gray-400 text-xs">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {canCancel && (
                          <button
                            onClick={() => cancelBooking(ref)}
                            disabled={canceling === ref}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
                          >
                            {canceling === ref ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* expanded details */}
                    {isExpanded && (
                      <tr className="bg-gray-750">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-8 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Phone</p>
                              <p className="text-sm text-gray-300">{b.phone ?? b.phone_number ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Company</p>
                              <p className="text-sm text-gray-300">{b.company ?? b.organization ?? '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Learning Goals</p>
                              <p className="text-sm text-gray-300">{b.learning_goals ?? b.goals ?? '—'}</p>
                            </div>
                            {b.email && (
                              <div className="md:hidden">
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm text-gray-300">{b.email}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-gray-500">
                    <Users size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No bookings match your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── pagination footer ─────────────────────────────────────── */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white font-medium">{showingFrom}–{showingTo}</span> of{' '}
              <span className="text-white font-medium">{totalCount}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                disabled={skip === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <span className="text-xs text-gray-500 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setSkip(skip + PAGE_SIZE)}
                disabled={skip + PAGE_SIZE >= totalCount}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
