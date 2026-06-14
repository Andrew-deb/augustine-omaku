import React, { useState, useMemo, useEffect } from 'react';
import PageHero from '../components/PageHero';
import { Calendar, Clock, Timer, Video, Users, Search, ChevronDown, ChevronUp, X, Check, Loader2 } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useCachedFetch } from '../hooks/useCachedFetch';

const STATUS_META = {
  open:        { label: 'Register Now', chip: 'bg-emerald-500 text-white',     cta: 'Save Your Spot',  ctaActive: true },
  limited:     { label: 'Register Now', chip: 'bg-emerald-500 text-white',     cta: 'Save Your Spot',  ctaActive: true },
  soldout:     { label: 'Sold Out',     chip: 'bg-red-500 text-white',         cta: 'Sold Out',        ctaActive: false },
  recorded:    { label: 'Watch Replay', chip: 'bg-gray-700 text-white',        cta: 'Watch Replay',    ctaActive: true },
  comingsoon:  { label: 'Coming Soon',  chip: 'bg-blue-500 text-white',        cta: 'Get Notified',    ctaActive: true },
};

const PLATFORM_ICON_COLOR = {
  Zoom: 'text-blue-500',
  'Google Meet': 'text-green-500',
  Teams: 'text-indigo-500'
};

const faqs = [
  { q: 'How do I join a session?', a: 'Select a session card above to see details and register. Click on any session to get started.' },
  { q: 'Can I attend multiple sessions?', a: 'Yes, you can register for and attend more than one session.' },
  { q: 'Is there a cost to attend?', a: 'Sessions are live, interactive, and 100% free.' },
  { q: 'What if I cannot make it to a live session?', a: 'The sessions are scheduled events, but you can browse upcoming ones and choose those that fit your availability.' },
  { q: 'Do I need any special software or experience?', a: 'Sessions are hosted on Zoom, Teams, or Google Meet. No special experience is required—just an interest in learning.' },
  { q: 'Can I ask questions during the session?', a: 'Yes, sessions are interactive, and you can ask questions in real time.' },
  { q: 'What is included in the confirmation email?', a: 'Details about the session, including timing and access information.' },
  { q: 'Is there a code of conduct?', a: 'Yes. The environment is professional and respectful. Harassment or spam will result in removal.' }
];

// ── Helpers ────────────────────────────────────

const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  } catch { return isoString; }
};

const formatTime = (isoString, tz) => {
  try {
    const time = new Date(isoString).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    return `${time} ${tz || ''}`.trim();
  } catch { return isoString; }
};

const formatDuration = (minutes) => `${minutes} minutes`;

// ── Sub-components ─────────────────────────────

const Dropdown = ({ label, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-neatgreen transition"
      >
        <span>{label}{selected.length > 0 && ` (${selected.length})`}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 max-h-64 overflow-y-auto">
          {options.map(opt => (
            <label key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} className="accent-neatgreen" />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const SessionModal = ({ session, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', goals: '', consent: false });

  useEffect(() => {
    if (!session) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [session]);

  // Reset form when modal opens with a new session
  useEffect(() => {
    if (session) {
      setSubmitted(false);
      setSubmitting(false);
      setSubmitError(null);
      setBookingResult(null);
      setForm({ name: '', email: '', phone: '', company: '', goals: '', consent: false });
    }
  }, [session]);

  if (!session) return null;
  const meta = STATUS_META[session.status] || STATUS_META.open;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(apiUrl(`/bookings/${session.code}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
          company: form.company || null,
          goals: form.goals,
          consent: form.consent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingResult(data);
        setSubmitted(true);
      } else {
        setSubmitError(data.error || data.detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formTitle = session.status === 'recorded'
    ? 'Get the Recording'
    : session.status === 'comingsoon'
      ? 'Get Notified When This Opens'
      : 'Register for This Session';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Session details */}
          <div className="p-8 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold font-source text-gray-900 dark:text-white leading-tight mb-3">{session.title}</h2>
            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${meta.chip} mb-6`}>{meta.label}</span>

            <div className="space-y-3 text-sm mb-6">
              <Detail label="Date" value={formatDate(session.starts_at)} />
              <Detail label="Time" value={formatTime(session.starts_at, session.timezone)} />
              <Detail label="Duration" value={formatDuration(session.duration_minutes)} />
              <Detail label="Platform" value={session.platform} />
              <Detail label="Capacity" value={`${session.seats_remaining} of ${session.capacity} seats available`} />
            </div>

            <SectionHeading>About this session</SectionHeading>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">{session.long_desc}</p>

            <SectionHeading>Who should attend</SectionHeading>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{session.audience}</p>

            <SectionHeading>You will learn</SectionHeading>
            <ul className="space-y-2">
              {(session.learn_points || []).map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-neatgreen mt-0.5 flex-shrink-0" />
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Form */}
          <div className="p-8">
            <h3 className="text-xl font-bold font-source text-gray-900 dark:text-white mb-4">{formTitle}</h3>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neatgreen/10 mb-4">
                  <Check size={32} className="text-neatgreen" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {bookingResult?.status === 'waitlisted' ? "You're on the waitlist!" : "You're all set!"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{bookingResult?.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Reference: <span className="font-mono font-semibold">{bookingResult?.booking_reference}</span>
                </p>
              </div>
            ) : (
              <>
                {submitError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4 text-sm border border-red-200 dark:border-red-800">
                    {submitError}
                  </div>
                )}

                <div className="bg-neatgreen/10 border border-neatgreen/30 rounded-md p-3 mb-5">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neatgreen mb-1">Registering for:</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{session.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(session.starts_at)} · {formatTime(session.starts_at, session.timezone)}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field label="Full Name" required>
                    <input required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="form-input" />
                  </Field>
                  <Field label="Email Address" required>
                    <input required type="email" maxLength={255} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="form-input" />
                  </Field>
                  <Field label="Phone Number" optional>
                    <input type="tel" maxLength={30} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="form-input" />
                  </Field>
                  <Field label="Company / Profession" optional>
                    <input maxLength={150} value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="e.g., Senior Data Engineer at TechCorp" className="form-input" />
                  </Field>
                  <Field label="What do you want to learn or achieve?" required>
                    <textarea required maxLength={1000} rows={4} value={form.goals} onChange={e => setForm({ ...form, goals: e.target.value })} placeholder="Share your goals, challenges, or specific topics you're interested in..." className="form-input resize-none" />
                  </Field>

                  <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <input required type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} className="mt-1 accent-neatgreen" />
                    <span>I agree to receive session updates and event information. We will never share your email. <span className="text-red-500">*</span></span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-neatgreen hover:bg-neatgreen/90 text-white font-bold uppercase text-xs tracking-wider rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    {submitting
                      ? 'Submitting...'
                      : session.status === 'comingsoon' ? 'Notify Me'
                      : session.status === 'recorded' ? 'Send Recording'
                      : 'Complete Registration'}
                  </button>

                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Questions? Reach out to us at <a href="mailto:reachout@augustineomaku.com" className="text-neatgreen font-semibold">reachout@augustineomaku.com</a>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
  </div>
);

const SectionHeading = ({ children }) => (
  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-900 dark:text-white mb-2">{children}</h4>
);

const Field = ({ label, required, optional, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>} {optional && <span className="text-gray-400 font-normal">(optional)</span>}
    </label>
    {children}
  </div>
);

// ── Main Component ─────────────────────────────

const LiveSessions = () => {
  const { data: sessions = [], loading, error } = useCachedFetch(apiUrl('/sessions'), {
    cacheKey: 'live_sessions',
    ttl: 300, // 5 minutes
  });

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  // Auto-open registration modal when arriving with ?register=<code> or #<code>
  useEffect(() => {
    if (sessions.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const idFromQuery = params.get('register');
    const idFromHash = window.location.hash ? window.location.hash.replace('#', '') : null;
    const targetCode = idFromQuery || idFromHash;
    if (!targetCode) return;
    const match = sessions.find(s => s.code === targetCode);
    if (match && STATUS_META[match.status]?.ctaActive) {
      setActiveSession(match);
    }
  }, [sessions]);

  const allCategories = useMemo(() => [...new Set(sessions.map(s => s.category))].sort(), [sessions]);
  const allStatusOptions = ['Open', 'Limited Seats', 'Sold Out', 'Recorded', 'Coming Soon'];
  const statusKeyMap = { 'Open': 'open', 'Limited Seats': 'limited', 'Sold Out': 'soldout', 'Recorded': 'recorded', 'Coming Soon': 'comingsoon' };

  const filtered = useMemo(() => sessions.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.short_desc.toLowerCase().includes(search.toLowerCase())) return false;
    if (categories.length && !categories.includes(s.category)) return false;
    if (statuses.length && !statuses.map(st => statusKeyMap[st]).includes(s.status)) return false;
    return true;
  }), [sessions, search, categories, statuses]);

  const toggle = (setter) => (val) => setter(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  const clearAll = () => { setSearch(''); setCategories([]); setStatuses([]); };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 min-h-screen transition-colors duration-300">
      <PageHero
        title="Live Sessions"
        subtitle="Interactive coding sessions, Q&As, and workshops."
        image="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80"
      />

      <div className="container mx-auto px-4 max-w-6xl py-16">

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-4">Filters</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search sessions..."
                className="w-full pl-9 pr-3 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-neatgreen"
              />
            </div>
            <Dropdown label="Category" options={allCategories} selected={categories} onToggle={toggle(setCategories)} />
            <Dropdown label="Availability" options={allStatusOptions} selected={statuses} onToggle={toggle(setStatuses)} />
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={clearAll} className="text-xs font-semibold text-neatgreen hover:underline">Clear All Filters</button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-neatgreen animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading sessions...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-neatgreen text-white rounded-md font-semibold">Retry</button>
          </div>
        )}

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{filtered.length} session{filtered.length !== 1 ? 's' : ''} found</p>
        )}

        {/* Cards grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(s => {
              const meta = STATUS_META[s.status] || STATUS_META.open;
              return (
                <div key={s.code} className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col">
                  <div
                    className="h-44 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${s.image_url})` }}
                  >
                    <span className={`absolute top-3 right-3 ${meta.chip} text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full`}>{meta.label}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-neatgreen mb-2">{s.category}</span>
                    <h3 className="text-lg font-bold font-source text-gray-900 dark:text-white mb-3 leading-snug">{s.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{s.short_desc}</p>

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2"><Calendar size={13} className="text-neatgreen" /> {formatDate(s.starts_at)}</div>
                      <div className="flex items-center gap-2"><Clock size={13} className="text-neatgreen" /> {formatTime(s.starts_at, s.timezone)}</div>
                      <div className="flex items-center gap-2"><Timer size={13} className="text-neatgreen" /> {formatDuration(s.duration_minutes)}</div>
                      <div className="flex items-center gap-2"><Video size={13} className={PLATFORM_ICON_COLOR[s.platform] || 'text-neatgreen'} /> {s.platform}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold mb-5">
                      <Users size={13} className={s.seats_remaining === 0 ? 'text-red-500' : 'text-neatgreen'} />
                      <span className={s.seats_remaining === 0 ? 'text-red-500' : 'text-neatgreen'}>
                        {s.seats_remaining === 0
                          ? (s.status === 'comingsoon' ? 'Registration not yet open' : 'No seats available')
                          : `${s.seats_remaining} seats available`}
                      </span>
                    </div>

                    <button
                      onClick={() => meta.ctaActive && setActiveSession(s)}
                      disabled={!meta.ctaActive}
                      className={`mt-auto w-full py-3 font-bold uppercase text-xs tracking-wider rounded-md transition-colors ${
                        meta.ctaActive
                          ? 'border-2 border-neatgreen text-neatgreen hover:bg-neatgreen hover:text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {meta.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            No sessions match your filters. <button onClick={clearAll} className="text-neatgreen font-semibold hover:underline">Clear filters</button>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-24 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold font-source text-gray-900 dark:text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to know about our sessions.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{f.q}</span>
                    {open ? <ChevronUp size={16} className="text-neatgreen" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SessionModal session={activeSession} onClose={() => setActiveSession(null)} />

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          background: transparent;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          color: rgb(17 24 39);
          outline: none;
          transition: border-color 0.15s;
        }
        .dark .form-input { border-color: rgb(55 65 81); color: rgb(243 244 246); background: rgb(17 24 39); }
        .form-input:focus { border-color: #8bc63f; }
        .form-input::placeholder { color: rgb(156 163 175); }
      `}</style>
    </div>
  );
};

export default LiveSessions;
