import React, { useState } from 'react';
// ── ProfilePage — Premium Redesign ────────────────────────────────────────────
import { useNavigate, Link } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { LangToggleDark } from '../components/LangToggle';
import { getWorker, getMyApplications, saveWorker, getSavedJobs, getJob, toggleSaveJob, formatSalary } from '../data/store';
import { CAT_ACCENT, CAT_LABEL } from '../components/JobCard';
import { useLang } from '../i18n/useT';
import type { Worker } from '../types';

const AVATAR_COLORS = ['#168448', '#2563EB', '#7C3AED', '#DC2626', '#EA580C', '#0891B2'];

const AVAIL_OPTS = [
  { id: 'available', icon: '🟢', label: 'उपलब्ध हूँ' },
  { id: 'working', icon: '🔵', label: 'काम पर हूँ' },
  { id: 'unavailable', icon: '🔴', label: 'उपलब्ध नहीं' },
];

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const FAKE_WORK_HISTORY = [
  { role: 'Security Guard', company: 'SpaceX Towers, Gurgaon', period: 'Jan 2024 – Mar 2024', icon: '🏢', rating: 4, bg: '#EFF6FF', color: '#1D4ED8' },
  { role: 'Delivery Boy', company: 'Swiggy Instamart', period: 'Oct 2023 – Dec 2023', icon: '🛵', rating: 5, bg: '#F0FDF4', color: '#168448' },
  { role: 'Housekeeping', company: 'Taj Hotels, Delhi', period: 'Jun 2023 – Sep 2023', icon: '🏨', rating: 3, bg: '#FFF7ED', color: '#C2410C' },
];

const NOTIFICATIONS_TOGGLE = [
  { label: 'Job Alerts', sub: 'New jobs near you', key: 'jobAlerts', on: true },
  { label: 'Application Updates', sub: 'Status changes', key: 'appUpdates', on: true },
  { label: 'Community', sub: 'Replies & mentions', key: 'community', on: false },
];

function CompletionRing({ pct }: { pct: number }) {
  const r = 26, cx = 30, cy = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="completion-ring-wrap" style={{ width: 60, height: 60 }}>
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
        <circle className="completion-ring-track" cx={cx} cy={cy} r={r} />
        <circle
          className="completion-ring-fill"
          cx={cx} cy={cy} r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="completion-pct">{pct}%</div>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const worker = getWorker();
  const apps = getMyApplications();
  const placed = apps.filter(a => a.currentStage === 'Joined').length;

  const [avail, setAvail] = useState<Worker['availability']>(worker.availability ?? 'available');
  const [notifs, setNotifs] = useState<Record<string, boolean>>({
    jobAlerts: true, appUpdates: true, community: false,
  });
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'earnings' | 'docs' | 'saved'>('profile');
  const [savedIds, setSavedIds] = useState<string[]>(getSavedJobs);

  const initials = (worker.name ?? 'W').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarBg = AVATAR_COLORS[(worker.name?.charCodeAt(0) ?? 87) % AVATAR_COLORS.length];

  const updateAvail = (val: string) => {
    setAvail(val as Worker['availability']);
    saveWorker({ ...worker, availability: val as Worker['availability'] });
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(worker.referralCode ?? 'SW-XXXX').catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Profile completion
  const fields = [worker.name, worker.mobile, worker.sector, worker.city, worker.isVerified];
  const completionPct = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  // Fake earnings chart — last 6 months
  const now = new Date();
  const earningsData = MONTHS_SHORT.slice(Math.max(0, now.getMonth() - 5), now.getMonth() + 1).map((m, i, arr) => ({
    month: m,
    amount: i === arr.length - 1 ? placed * 8500 : Math.floor(Math.random() * 12000 + 2000),
    isActive: i === arr.length - 1,
  }));
  const maxEarning = Math.max(...earningsData.map(e => e.amount), 1);

  const DOC_ITEMS = [
    { label: 'Aadhar Card', done: !!worker.isVerified, icon: '🪪' },
    { label: 'Selfie Photo', done: !!worker.isVerified, icon: '🤳' },
    { label: 'Police Verify', done: false, icon: '👮' },
    { label: 'Bank Details', done: false, icon: '🏦' },
  ];

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)' }}>

      {/* ── PREMIUM PROFILE HERO ── */}
      <div className="profile-hero">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} className="icon-btn icon-btn--white" style={{ visibility: 'hidden' }}>←</button>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, color: '#fff' }}>{t('profile.title')}</div>
          <button onClick={() => navigate('/profile/edit')} className="icon-btn icon-btn--white">✏️</button>
        </div>

        {/* Avatar + info + completion ring */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div className="avatar av-xl" style={{ background: avatarBg, border: '3px solid rgba(255,255,255,0.35)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff' }}>{worker.name}</div>
              {worker.isVerified && <span className="verified-badge">⭐ Verified</span>}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', letterSpacing: 1, marginBottom: 4 }}>
              {worker.regNumber}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
              📍 {worker.sector}, {worker.city}
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <span className="badge badge-green" style={{ fontSize: 10 }}>
                {avail === 'available' ? '🟢 Available' : avail === 'working' ? '🔵 Working' : '🔴 Busy'}
              </span>
            </div>
          </div>
          {/* Completion Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <CompletionRing pct={completionPct} />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textAlign: 'center' }}>PROFILE</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="profile-stat-row">
          {[
            { v: apps.length, l: 'Applied', icon: '📋' },
            { v: placed, l: 'Placed', icon: '✅' },
            { v: worker.workHistory?.length ?? FAKE_WORK_HISTORY.length, l: 'Experience', icon: '🏆' },
          ].map((s, i) => (
            <div key={i} className="profile-stat">
              <div className="profile-stat-num">{s.v}</div>
              <div className="profile-stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION TABS ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', background: 'var(--n100)', borderRadius: 'var(--r-lg)', padding: 4, gap: 2, marginBottom: 16 }}>
          {([
            ['profile',  '👤 Profile'],
            ['earnings', '💰 Earnings'],
            ['docs',     '📄 Docs'],
            ['saved',    `❤️ Saved${savedIds.length ? ` (${savedIds.length})` : ''}`],
          ] as const).map(([k, l]) => (
            <button key={k} onClick={() => setActiveSection(k)} style={{
              flex: 1, padding: '9px 2px', borderRadius: 'calc(var(--r-lg) - 2px)',
              background: activeSection === k ? '#fff' : 'transparent',
              border: 'none', color: activeSection === k ? 'var(--g700)' : 'var(--text-lo)',
              fontWeight: 700, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: activeSection === k ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              whiteSpace: 'nowrap',
            }}>{l}</button>
          ))}
        </div>

        {activeSection === 'profile' && (
          <div className="anim-fade">
            {/* Availability */}
            <div className="card section" style={{ padding: '14px 16px' }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                {t('profile.availability')}
              </div>
              <div className="avail-grid">
                {AVAIL_OPTS.map(o => (
                  <button key={o.id} className={`avail-opt ${avail === o.id ? 'active' : ''}`} onClick={() => updateAvail(o.id)}>
                    <span style={{ fontSize: 20 }}>{o.icon}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills / Job Preferences */}
            <div className="card section" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>{t('profile.skills')}</div>
                <button onClick={() => navigate('/profile/edit')} style={{ border: 'none', background: 'var(--g50)', color: 'var(--g700)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, cursor: 'pointer' }}>Edit</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(worker.jobTypes ?? []).map((jt: string) => (
                  <span key={jt} className="badge badge-green" style={{ padding: '5px 12px', fontSize: 12 }}>✓ {jt}</span>
                ))}
                {['Hindi', 'English'].map(lang => (
                  <span key={lang} className="badge badge-blue" style={{ padding: '5px 12px', fontSize: 12 }}>🌐 {lang}</span>
                ))}
                {(worker.jobTypes ?? []).length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--text-lo)' }}>कोई preference नहीं — Edit करें</div>
                )}
              </div>
            </div>

            {/* Work History */}
            <div className="card section" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>
                  {t('profile.workHistory')}
                </div>
                <button onClick={() => navigate('/profile/edit')} style={{ border: 'none', background: 'var(--g50)', color: 'var(--g700)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 999, cursor: 'pointer' }}>+ Add</button>
              </div>
              {(worker.workHistory && worker.workHistory.length > 0 ? worker.workHistory : FAKE_WORK_HISTORY).map((wh: any, i: number) => {
                const role = wh.role;
                const company = wh.employer ?? wh.company;
                const period = wh.from && wh.to ? `${wh.from} – ${wh.to}` : (wh.period ?? '');
                const verified = wh.verified ?? false;
                return (
                  <div key={i} className="wh-item">
                    <div className="wh-icon" style={{ background: wh.bg ?? '#F0FDF4', color: wh.color ?? 'var(--g700)' }}>
                      {wh.icon ?? '🏢'}
                    </div>
                    <div className="wh-body">
                      <div className="wh-role">{role}</div>
                      <div className="wh-company">{company}</div>
                      <div className="wh-period">📅 {period}</div>
                      {verified && (
                        <div style={{ marginTop: 3 }}>
                          <span style={{ background: 'var(--g50)', color: 'var(--g700)', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>✓ Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* QR Share Card */}
            <div className="qr-card section">
              <div className="qr-box">🔳</div>
              <div style={{ flex: 1 }}>
                <div className="qr-title">Profile Share करें</div>
                <div className="qr-sub">अपना QR share करें — Employer directly contact करें</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm">QR देखें</button>
                  <button className="btn btn-wa btn-sm">WhatsApp</button>
                </div>
              </div>
            </div>

            {/* Referral */}
            <div className="section" onClick={copyCode} style={{ cursor: 'pointer' }}>
              <div className="referral-card">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="referral-title">🎁 Refer करें और कमाएं</div>
                  <div className="referral-sub">दोस्त job join करे → ₹500 आपको</div>
                  <div className="referral-code">
                    {worker.referralCode ?? 'SW-XXXX'}
                    <span style={{ opacity: 0.4 }}>|</span>
                    {copied ? '✓ COPIED!' : 'TAP TO COPY'}
                  </div>
                </div>
                <div className="referral-arrow">{copied ? '✓' : '→'}</div>
              </div>
            </div>

            {/* Settings Rows */}
            <div className="card section">
              <div style={{ padding: '14px 16px', fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--divider)' }}>
                ⚙️ Settings
              </div>

              {/* Notification Toggles */}
              {NOTIFICATIONS_TOGGLE.map(n => (
                <div key={n.key} className="detail-row" style={{ padding: '14px 16px' }}>
                  <span className="detail-icon">🔔</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{n.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{n.sub}</div>
                  </div>
                  <button
                    className={`toggle-switch ${notifs[n.key] ? 'on' : ''}`}
                    onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                  />
                </div>
              ))}

              {/* Language — tap to toggle EN/HI instantly */}
              <div
                className="detail-row"
                style={{ padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
              >
                <span className="detail-icon">🌐</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t('profile.lang')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{lang === 'hi' ? 'हिन्दी' : 'English'}</div>
                </div>
                <LangToggleDark />
              </div>
              {[
                { icon: '📞', label: t('profile.help'), sub: t('profile.helpSub'), action: '/help' },
                { icon: '🛡️', label: t('profile.privacy'), sub: t('profile.privacySub'), action: '/privacy' },
              ].map(item => (
                <div key={item.label} className="detail-row" style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => navigate(item.action)}>
                  <span className="detail-icon">{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{item.sub}</div>
                  </div>
                  <span style={{ color: 'var(--text-lo)', fontSize: 18 }}>›</span>
                </div>
              ))}

              {/* Logout */}
              <div
                className="detail-row"
                style={{ padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => { localStorage.clear(); location.href = '/login'; }}
              >
                <span className="detail-icon">🚪</span>
                <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--red)' }}>Logout</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'earnings' && (
          <div className="anim-fade">
            {/* Earnings Hero */}
            <div className="hero-stat-card section" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 4 }}>कुल कमाई</div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 38, color: '#fff', lineHeight: 1 }}>
                ₹{(placed * 8500).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--g400)', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                ↑ {placed} placements completed
              </div>
            </div>

            {/* Monthly Chart */}
            <div className="card section" style={{ padding: '16px 16px 8px' }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Monthly Breakdown</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
                {earningsData.map((e, i) => {
                  const h = Math.max(8, Math.round((e.amount / maxEarning) * 64));
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%', height: h, borderRadius: '4px 4px 0 0',
                        background: e.isActive ? 'var(--g700)' : 'var(--g200)',
                        transition: 'height 0.6s cubic-bezier(0.22,1,0.36,1)',
                        boxShadow: e.isActive ? '0 2px 8px rgba(22,132,72,0.4)' : 'none',
                      }} />
                      <span style={{ fontSize: 9, color: 'var(--text-lo)', fontWeight: 600 }}>{e.month}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--divider)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-lo)' }}>Best Month</div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, color: 'var(--g700)' }}>
                    ₹{Math.max(...earningsData.map(e => e.amount)).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-lo)' }}>Average</div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, color: 'var(--text-mid)' }}>
                    ₹{Math.round(earningsData.reduce((s, e) => s + e.amount, 0) / earningsData.length).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Earnings */}
            <div className="card section" style={{ padding: 16 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Referral Earnings</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>Friends Referred</div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 20, color: 'var(--text-hi)' }}>2</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>Joined</div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 20, color: 'var(--g700)' }}>1</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>Earned</div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 20, color: 'var(--amber)' }}>₹500</div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--g50)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--g800)', fontWeight: 600 }}>
                🏆 आप Top 10% Referrers में हैं!
              </div>
            </div>
          </div>
        )}

        {activeSection === 'saved' && (
          <div className="anim-fade">
            {savedIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 17, color: '#0D1B0F', marginBottom: 8 }}>
                  कोई Saved Job नहीं
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
                  Job detail पर ❤️ दबाएं — वो यहाँ save हो जाएगी
                </div>
                <Link to="/jobs" style={{ display: 'inline-block', background: '#1B6B3A', color: '#fff', padding: '11px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>
                  नौकरियाँ देखें →
                </Link>
              </div>
            ) : (
              savedIds.map(jobId => {
                const job = getJob(jobId);
                if (!job) return null;
                const accent = CAT_ACCENT[job.category] || '#374151';
                return (
                  <div key={jobId} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EAE6', marginBottom: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ height: 3, background: accent }} />
                    <div style={{ padding: '13px 14px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                          {CAT_LABEL[job.category] || 'Job'}
                        </div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 18, color: '#0D1B0F', marginBottom: 2 }}>
                          {formatSalary(job.salary.min, job.salary.max)}<span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>/माह</span>
                        </div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14, color: '#111827' }}>{job.role}</div>
                        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{job.employerName}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                          {job.urgent && <span style={{ color: '#B91C1C', fontWeight: 700 }}>⚡ Urgent · </span>}
                          📍 {job.location}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                        <button
                          onClick={() => { toggleSaveJob(jobId); setSavedIds(getSavedJobs()); }}
                          style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', fontSize: 16 }}
                          title="Remove from saved"
                        >❤️</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', borderTop: '1px solid #F0F1ED' }}>
                      <Link to={`/jobs/${jobId}`} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent, color: '#fff', padding: '10px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                        अप्लाई करें →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeSection === 'docs' && (
          <div className="anim-fade">
            {/* Verification Status */}
            <div className="card section" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>Switch Verified</div>
                {worker.isVerified
                  ? <span className="badge badge-green">✓ Verified</span>
                  : <span className="badge badge-amber">⏳ Pending</span>}
              </div>
              {DOC_ITEMS.map(d => (
                <div key={d.label} className="doc-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <span style={{ fontSize: 20 }}>{d.icon}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-mid)', fontWeight: 500 }}>{d.label}</span>
                  </div>
                  {d.done
                    ? <span className="doc-status-uploaded">✓ Uploaded</span>
                    : <button className="btn btn-secondary btn-sm" onClick={() => { }}>Upload ↗</button>}
                </div>
              ))}

              {!worker.isVerified && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--amber-bg)', borderRadius: 'var(--r-md)', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E', fontWeight: 600 }}>
                  💡 Verified workers को 3× ज़्यादा Job Calls आती हैं!
                </div>
              )}
            </div>

            {/* Trust Score */}
            <div className="card section" style={{ padding: 16 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Trust Score</div>
              {[
                { label: 'Profile Complete', pct: completionPct, color: 'var(--g700)' },
                { label: 'Documents Uploaded', pct: DOC_ITEMS.filter(d => d.done).length / DOC_ITEMS.length * 100, color: 'var(--blue)' },
                { label: 'Community Active', pct: 40, color: 'var(--purple)' },
              ].map(row => (
                <div key={row.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 500 }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{Math.round(row.pct)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--n100)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 3, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
