// ── JobDetailPage — Premium Redesign ──────────────────────────────────────────
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, getCaptain, getWorker, haversine, walkTime, formatSalary, hasApplied, isJobSaved, toggleSaveJob } from '../data/store';
import { useT } from '../i18n/useT';
import type { TKey } from '../i18n/translations';

// SVG icon nodes for each duty slot (shared across categories)
const DUTY_ICONS: React.ReactNode[] = [
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
];

// Returns 4 duties for a category using the i18n t() function
function getCategoryDuties(category: string, t: (k: TKey) => string) {
  const cat = ['security','housekeeping','driver','cook','helper','technician','gardener','caretaker'].includes(category)
    ? category : 'default';
  return [1,2,3,4].map((n, i) => ({
    icon: DUTY_ICONS[(i + (cat === 'default' ? 4 : 0)) % DUTY_ICONS.length],
    task: t(`duty.${cat}.${n}` as TKey),
  }));
}

export function JobDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const job        = getJob(id!);
  const worker     = getWorker();
  const t = useT();
  const [commuteOpen, setCommuteOpen] = useState(false);
  const [saved,       setSaved]       = useState(() => isJobSaved(id!));

  if (!job) return (
    <div className="empty" style={{ minHeight: '100dvh' }}>
      <div className="empty-icon">🔍</div>
      <div className="empty-title">Job नहीं मिली</div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/jobs')}>← वापस जाएं</button>
    </div>
  );

  const captain  = getCaptain(job.captainId);
  const dist     = haversine(worker.lat, worker.lng, job.lat, job.lng);
  const commute  = walkTime(dist);
  const applied  = hasApplied(job.id);
  const autoCost = Math.round(dist * 25) * 26;
  const busCost  = Math.round(dist * 20) * 26;
  const catDuties = getCategoryDuties(job.category, t);
  const waText = encodeURIComponent(
    `Hello! My name is ${worker.name} (${worker.regNumber}). Enquiring about ${job.role} at ${job.employerName}.`
  );

  // Star rating helper
  const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

  return (
    <div style={{ paddingBottom: 92 }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
        }} />

        {/* Back + save */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} className="icon-btn icon-btn--white">←</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { const next = toggleSaveJob(id!); setSaved(next); }}
              className="icon-btn icon-btn--white"
              style={{ fontSize: 20 }}
            >
              {saved ? '❤️' : '🤍'}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Switch पर job देखें: ${job.role} at ${job.employerName}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="icon-btn icon-btn--white"
              style={{ fontSize: 18, textDecoration: 'none' }}
            >
              📤
            </a>
          </div>
        </div>

        {/* Job icon + title */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 60, height: 60, borderRadius: 'var(--r-lg)', flexShrink: 0, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
          </div>
          <div style={{ color: '#fff', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 24 }}>{job.role}</div>
              {job.urgent && <span className="badge badge-red">⚡ Urgent</span>}
            </div>
            <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 3 }}>{job.employerName}</div>
            <div style={{ fontSize: 13, opacity: 0.65, display: 'flex', alignItems: 'center', gap: 4 }}>
              📍 {job.location}
            </div>
          </div>
        </div>

        {/* Salary + distance pills */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '7px 16px',
            display: 'inline-flex', alignItems: 'baseline', gap: 4,
          }}>
            <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff' }}>
              {formatSalary(job.salary.min, job.salary.max)}
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>/month</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '7px 14px', fontSize: 13, color: '#fff', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {commute} · {dist.toFixed(1)} km
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── WHAT YOU'LL DO — visual duty cards ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>What You'll Do</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {catDuties.map((d, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '14px',
                border: '1px solid #E8EAE5', boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 10,
                animation: `slideUp 0.3s ${i * 0.06}s ease both`,
              }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {d.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0D1B0F', lineHeight: 1.4 }}>{d.task}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Info Badges ── */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            job.food          && { bg: '#ECFDF5', c: '#1B6B3A', t: 'Meals Provided' },
            job.accommodation && { bg: '#EFF6FF', c: '#1D4ED8', t: 'Stay Provided' },
            { bg: '#F5F3FF', c: '#6D28D9', t: `${job.employerRating} Rating` },
            job.urgent        && { bg: '#FEF2F2', c: '#B91C1C', t: 'Urgent Hiring' },
          ].filter(Boolean).map((b: any) => (
            <span key={b.t} style={{ background: b.bg, color: b.c, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>{b.t}</span>
          ))}
        </div>

        {/* ── Commute Calculator ── */}
        <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setCommuteOpen(p => !p)}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, color: '#1B6B3A' }}>Commute Calculator</div>
                <div style={{ fontSize: 12, color: '#8A9A8C', marginTop: 1 }}>{worker.sector} · {commute} walk</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" style={{ transform: commuteOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {commuteOpen && (
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid #F1F2EE' }}>
              {[
                { label: 'Walk',            cost: 'FREE',                      color: '#1B6B3A', Icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 4a1 1 0 100-2 1 1 0 000 2zm-1 3l-2 12M8 7l5 2 3 4M6 19h12"/></svg> },
                { label: 'Auto / Rickshaw', cost: `₹${autoCost.toLocaleString()}/mo`, color: '#B45309', Icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                { label: 'Bus / Metro',     cost: `₹${busCost.toLocaleString()}/mo`,  color: '#1D4ED8', Icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="7" y1="19" x2="7" y2="21"/><line x1="17" y1="19" x2="17" y2="21"/></svg> },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F2EE' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#3D4E3F' }}>
                    {r.Icon}
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</span>
                  </div>
                  <span style={{ fontFamily: 'Baloo 2', fontWeight: 700, color: r.color, fontSize: 15 }}>{r.cost}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#ECFDF5', borderRadius: 8, fontSize: 12, color: '#1B6B3A', fontWeight: 600 }}>
                This job is nearby — commute cost will be low!
              </div>
            </div>
          )}
        </div>

        {/* ── Job Details Card ── */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ padding: '14px 16px', fontWeight: 800, fontSize: 14, borderBottom: '1px solid #F1F2EE', letterSpacing: -0.2, color: '#0D1B0F' }}>Job Details</div>
          <div style={{ padding: '4px 16px 8px' }}>
            {[
              { label: 'Shift',       value: job.shift,              highlight: false },
              { label: 'Meals',       value: job.food ? 'Provided' : 'Not included', highlight: !!job.food },
              { label: 'Stay',        value: job.accommodation ? 'Provided' : 'Not included', highlight: !!job.accommodation },
              { label: 'Uniform',     value: job.uniform === 'company_provided' ? 'Company provided' : 'Self arranged', highlight: job.uniform === 'company_provided' },
              { label: 'Experience',  value: job.experience,         highlight: false },
              { label: 'Vacancies',   value: `${job.openings} positions open`, highlight: job.openings >= 3 },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #F1F2EE' }}>
                <span style={{ fontSize: 13, color: '#8A9A8C', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: row.highlight ? '#1B6B3A' : '#0D1B0F', textAlign: 'right', maxWidth: '55%' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Employer Card ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EAE5', padding: 16, marginBottom: 14, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Employer</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#ECFDF5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#0D1B0F' }}>{job.employerName}</div>
              <div style={{ fontSize: 11, color: '#1B6B3A', fontWeight: 700, marginTop: 2 }}>Switch Verified Employer</div>
              <div style={{ color: '#F59E0B', fontSize: 13, marginTop: 4 }}>
                {stars(job.employerRating)}
                <span style={{ fontSize: 11, color: '#8A9A8C', marginLeft: 6 }}>{job.employerRating} ({job.employerReviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Captain Card ── */}
        {captain && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E8EAE5', padding: 16, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Your Switch Captain</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: '#fff', flexShrink: 0 }}>
                {captain.avatar || captain.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, color: '#0D1B0F' }}>{captain.name}</div>
                <div style={{ fontSize: 12, color: '#8A9A8C', marginTop: 1 }}>{captain.placements} successful placements</div>
              </div>
              <a href={`https://wa.me/91${captain.mobile}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                style={{ background: '#25D366', color: '#fff', borderRadius: 10, padding: '8px 14px', textDecoration: 'none', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* Social proof */}
        <div style={{ padding: '12px 14px', background: '#ECFDF5', borderRadius: 12, border: '1px solid #A7F3D0', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div style={{ fontSize: 12, color: '#1B6B3A', fontWeight: 600 }}>
            27 workers applied · <strong>{job.openings} spots remaining</strong> — Apply now!
          </div>
        </div>
      </div>

      {/* ── STICKY APPLY BAR ── */}
      <div className="sticky-cta" style={{ flexDirection: 'column', gap: 8 }}>
        {applied ? (
          <Link to="/applications" className="btn btn-secondary btn-full" style={{ textDecoration: 'none', textAlign: 'center' }}>
            ✓ Applied — Track Status
          </Link>
        ) : (
          <>
            {/* Salary reminder in apply bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
              <div>
                <span style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 20, color: '#0D1B0F' }}>
                  {formatSalary(job.salary.min, job.salary.max)}
                </span>
                <span style={{ fontSize: 12, color: '#6B7280', marginLeft: 3 }}>/माह</span>
              </div>
              <span style={{ fontSize: 11, color: '#1B6B3A', fontWeight: 700, background: '#ECFDF5', padding: '3px 9px', borderRadius: 6 }}>
                ✓ 2 मिनट में अप्लाई
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {captain ? (
                <>
                  <a
                    href={`https://wa.me/91${captain.mobile}?text=${waText}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-wa"
                    style={{ flex: 2, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12.016 0C5.396 0 .016 5.38.016 12c0 2.126.558 4.122 1.528 5.854L.005 24l6.335-1.653A11.963 11.963 0 0012.016 24C18.636 24 24 18.62 24 12S18.636 0 12.016 0zm0 21.818c-1.96 0-3.784-.528-5.354-1.44l-.385-.228-3.977 1.038 1.058-3.863-.25-.4A9.797 9.797 0 012.2 12c0-5.412 4.404-9.818 9.816-9.818 5.412 0 9.818 4.406 9.818 9.818 0 5.412-4.406 9.818-9.818 9.818z"/>
                    </svg>
                    WhatsApp से अप्लाई
                  </a>
                  <Link to={`/apply/${job.id}`} className="btn btn-primary" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                    Form
                  </Link>
                </>
              ) : (
                <Link to={`/apply/${job.id}`} className="btn btn-primary btn-full" style={{ textDecoration: 'none', textAlign: 'center' }}>
                  अभी अप्लाई करें →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
