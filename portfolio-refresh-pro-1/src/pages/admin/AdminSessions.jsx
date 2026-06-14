import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit3, Trash2, Eye, ChevronDown, X, Save, RefreshCw, AlertTriangle,
  Calendar, Users, Clock, Video, MoreVertical, ArrowUpDown, Search,
  CheckCircle, XCircle, Loader2, ChevronRight, Upload, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiUrl } from '../../config/api';

/* ── constants ───────────────────────────────────────────────────────── */

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'limited', label: 'Limited', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'soldout', label: 'Sold Out', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  { value: 'comingsoon', label: 'Coming Soon', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  { value: 'recorded', label: 'Recorded', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
];

const PLATFORM_OPTIONS = ['Zoom', 'Teams', 'Google Meet'];

const EMPTY_FORM = {
  code: '',
  title: '',
  category: '',
  short_desc: '',
  long_desc: '',
  audience: '',
  learn_points: [],
  image_url: '',
  capacity: 30,
  starts_at: '',
  duration_minutes: 60,
  timezone: 'Africa/Lagos',
  platform: 'Zoom',
  status: 'comingsoon',
  meeting_link: '',
};

/* ── status chip ─────────────────────────────────────────────────────── */

function StatusChip({ status }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status);
  if (!opt) return <span className="text-xs text-gray-500">{status}</span>;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${opt.color}`}>
      {opt.label}
    </span>
  );
}

/* ── mini progress bar ───────────────────────────────────────────────── */

function MiniFill({ confirmed, capacity }) {
  const pct = capacity > 0 ? Math.min(Math.round((confirmed / capacity) * 100), 100) : 0;
  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-neatgreen';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400">{pct}%</span>
    </div>
  );
}

/* ── modal wrapper ───────────────────────────────────────────────────── */

function Modal({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white font-source">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ── learn points array input ────────────────────────────────────────── */

function LearnPointsInput({ points, onChange }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !points.includes(trimmed)) {
      onChange([...points, trimmed]);
      setDraft('');
    }
  };

  const remove = (idx) => onChange(points.filter((_, i) => i !== idx));

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">Learning Points</label>
      <div className="flex gap-2 mb-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Add a learning point…"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-neatgreen transition"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
        >
          <Plus size={16} />
        </button>
      </div>
      {points.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {points.map((p, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-gray-700 text-gray-300 text-xs rounded-full px-3 py-1"
            >
              {p}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-500 hover:text-red-400 transition"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── form input helper ───────────────────────────────────────────────── */

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-neatgreen transition';
const selectCls =
  'w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neatgreen transition appearance-none';

/* ── main component ──────────────────────────────────────────────────── */

export default function AdminSessions() {
  const { session } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  /* modals */
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);

  /* image upload */
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');

  /* action menus */
  const [openMenu, setOpenMenu] = useState(null);

  const authHeaders = {
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };

  /* ── image upload handler ──────────────────────────────────────────── */

  const handleImageUpload = async (file) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      setImageError('Invalid file type. Use JPEG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('File too large. Maximum is 5MB.');
      return;
    }

    setImageError('');
    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(apiUrl('/admin/upload/image'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }

      const data = await res.json();
      updateField('image_url', data.url);
    } catch (err) {
      setImageError(err.message || 'Upload failed. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  /* ── fetch sessions ────────────────────────────────────────────────── */

  const fetchSessions = useCallback(async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/admin/sessions'), { headers: authHeaders });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /* ── helpers ───────────────────────────────────────────────────────── */

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (s) => {
    setEditTarget(s);
    setForm({
      code: s.code ?? '',
      title: s.title ?? '',
      category: s.category ?? '',
      short_desc: s.short_desc ?? '',
      long_desc: s.long_desc ?? '',
      audience: s.audience ?? '',
      learn_points: s.learn_points ?? [],
      image_url: s.image_url ?? '',
      capacity: s.capacity ?? 30,
      starts_at: s.starts_at ? s.starts_at.slice(0, 16) : '',
      duration_minutes: s.duration_minutes ?? 60,
      timezone: s.timezone ?? 'Africa/Lagos',
      platform: s.platform ?? 'Zoom',
      status: s.status ?? 'comingsoon',
      meeting_link: s.meeting_link ?? '',
    });
    setShowForm(true);
    setOpenMenu(null);
  };

  const openStatusChange = (s) => {
    setStatusModal(s);
    setNewStatus(s.status);
    setOpenMenu(null);
  };

  /* ── save session (create / update) ────────────────────────────────── */

  const saveSession = async () => {
    setSaving(true);
    try {
      const url = editTarget
        ? apiUrl(`/admin/sessions/${editTarget.id}`)
        : apiUrl('/admin/sessions');
      const method = editTarget ? 'PUT' : 'POST';

      const body = { ...form };
      if (body.starts_at) {
        body.starts_at = new Date(body.starts_at).toISOString();
      }

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail ?? 'Failed to save session');
      }

      setShowForm(false);
      fetchSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── change status ─────────────────────────────────────────────────── */

  const changeStatus = async () => {
    if (!statusModal) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/admin/sessions/${statusModal.id}/status`), {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to change status');
      setStatusModal(null);
      fetchSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── delete session ────────────────────────────────────────────────── */

  const deleteSession = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(apiUrl(`/admin/sessions/${deleteTarget.id}`), {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) throw new Error('Failed to delete session');
      setDeleteTarget(null);
      fetchSessions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── loading / error ───────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw size={28} className="text-neatgreen animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={28} className="text-red-400 mx-auto mb-2" />
          <p className="text-gray-300">{error}</p>
          <button onClick={fetchSessions} className="mt-3 px-4 py-2 bg-neatgreen text-gray-900 rounded-lg text-sm font-medium hover:brightness-110 transition">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-source">Sessions</h1>
          <p className="text-sm text-gray-400 mt-0.5">{sessions.length} session{sessions.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-neatgreen text-gray-900 rounded-lg text-sm font-semibold hover:brightness-110 transition shadow-lg shadow-neatgreen/20"
        >
          <Plus size={16} />
          Create Session
        </button>
      </div>

      {/* ── table ───────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider">Title</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Capacity</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Fill Rate</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider hidden xl:table-cell">Date</th>
                <th className="px-5 py-3.5 text-gray-400 font-medium text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sessions.map((s) => {
                const confirmed = s.confirmed_count ?? s.booking_count ?? 0;
                return (
                  <tr key={s.id} className="hover:bg-gray-700/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {s.image_url ? (
                          <img src={s.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-700" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center">
                            <Video size={16} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium truncate max-w-[200px]">{s.title}</p>
                          <p className="text-xs text-gray-500">{s.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-300">{s.category || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusChip status={s.status} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-gray-300">{confirmed}/{s.capacity ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <MiniFill confirmed={confirmed} capacity={s.capacity ?? 0} />
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell">
                      <span className="text-gray-400 text-xs">
                        {s.starts_at ? new Date(s.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenu === s.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1.5 animate-fade-in">
                              <button
                                onClick={() => openEdit(s)}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                              >
                                <Edit3 size={14} /> Edit Session
                              </button>
                              <button
                                onClick={() => openStatusChange(s)}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                              >
                                <ArrowUpDown size={14} /> Change Status
                              </button>
                              <button
                                onClick={() => { window.location.href = '/admin/bookings?session=' + s.code; setOpenMenu(null); }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition"
                              >
                                <Eye size={14} /> View Bookings
                              </button>
                              <div className="border-t border-gray-700 my-1" />
                              <button
                                onClick={() => { setDeleteTarget(s); setOpenMenu(null); }}
                                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition"
                              >
                                <Trash2 size={14} /> Delete Session
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {sessions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-gray-500">
                    <Calendar size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No sessions yet. Create your first one!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── create / edit modal ─────────────────────────────────────── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editTarget ? 'Edit Session' : 'Create Session'}
        maxWidth="max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Session Code">
            <input
              value={form.code}
              onChange={(e) => updateField('code', e.target.value)}
              placeholder="e.g. azure-masterclass"
              className={inputCls}
              disabled={!!editTarget}
            />
          </Field>
          <Field label="Title">
            <input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Session title" className={inputCls} />
          </Field>
          <Field label="Category">
            <input value={form.category} onChange={(e) => updateField('category', e.target.value)} placeholder="e.g. Cloud, DevOps" className={inputCls} />
          </Field>
          <Field label="Audience">
            <input value={form.audience} onChange={(e) => updateField('audience', e.target.value)} placeholder="e.g. IT Professionals" className={inputCls} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Short Description">
              <textarea value={form.short_desc} onChange={(e) => updateField('short_desc', e.target.value)} rows={2} className={inputCls} placeholder="Brief session description" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Full Description">
              <textarea value={form.long_desc} onChange={(e) => updateField('long_desc', e.target.value)} rows={3} className={inputCls} placeholder="Detailed description" />
            </Field>
          </div>
          <div className="md:col-span-2">
            <LearnPointsInput points={form.learn_points} onChange={(pts) => updateField('learn_points', pts)} />
          </div>
          <div className="md:col-span-2">
            <Field label="Session Image">
              {form.image_url ? (
                <div className="relative group">
                  <img
                    src={form.image_url}
                    alt="Session preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs rounded-lg flex items-center gap-1.5 transition">
                      <Upload size={14} />
                      Replace
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e.target.files[0])}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => updateField('image_url', '')}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                  {imageUploading && (
                    <div className="absolute inset-0 bg-gray-900/80 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-neatgreen animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    imageUploading
                      ? 'border-neatgreen/50 bg-neatgreen/5'
                      : 'border-gray-700 hover:border-neatgreen/50 hover:bg-gray-800/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageUpload(file);
                  }}
                >
                  {imageUploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-neatgreen animate-spin mb-2" />
                      <span className="text-sm text-gray-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                      <span className="text-sm text-gray-400">Click or drag image to upload</span>
                      <span className="text-xs text-gray-600 mt-1">JPEG, PNG, WebP, GIF • Max 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    disabled={imageUploading}
                  />
                </label>
              )}
              {imageError && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <XCircle size={12} /> {imageError}
                </p>
              )}
            </Field>
          </div>
          <Field label="Capacity">
            <input type="number" min={1} value={form.capacity} onChange={(e) => updateField('capacity', parseInt(e.target.value) || 0)} className={inputCls} />
          </Field>
          <Field label="Start Date &amp; Time">
            <input type="datetime-local" value={form.starts_at} onChange={(e) => updateField('starts_at', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Duration (minutes)">
            <input type="number" min={15} value={form.duration_minutes} onChange={(e) => updateField('duration_minutes', parseInt(e.target.value) || 60)} className={inputCls} />
          </Field>
          <Field label="Timezone">
            <input value={form.timezone} onChange={(e) => updateField('timezone', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Platform">
            <select value={form.platform} onChange={(e) => updateField('platform', e.target.value)} className={selectCls}>
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className={selectCls}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Meeting Link">
            <input value={form.meeting_link} onChange={(e) => updateField('meeting_link', e.target.value)} placeholder="https://zoom.us/j/..." className={inputCls} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={saveSession}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-neatgreen text-gray-900 rounded-lg text-sm font-semibold hover:brightness-110 transition disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {editTarget ? 'Update Session' : 'Create Session'}
          </button>
        </div>
      </Modal>

      {/* ── status change modal ─────────────────────────────────────── */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Change Session Status"
        maxWidth="max-w-md"
      >
        {statusModal && (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              Change status for <span className="text-white font-medium">{statusModal.title}</span>
            </p>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={selectCls}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition">Cancel</button>
              <button
                onClick={changeStatus}
                disabled={saving || newStatus === statusModal.status}
                className="flex items-center gap-2 px-5 py-2 bg-neatgreen text-gray-900 rounded-lg text-sm font-semibold hover:brightness-110 transition disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── delete confirmation modal ───────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Session"
        maxWidth="max-w-md"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertTriangle size={20} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">
                Are you sure you want to delete <span className="font-medium text-red-200">{deleteTarget.title}</span>? This action will soft-delete the session and its associated data.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition">Cancel</button>
              <button
                onClick={deleteSession}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
