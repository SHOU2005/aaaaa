// ── JobDetailPage — Premium Redesign ──────────────────────────────────────────
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, getCaptain, getWorker, haversine, walkTime, formatSalary, hasApplied } from '../data/store';
import { useT } from '../i18n/useT';

// Per-category visual duties shown under hero
const CATEGORY_DUTIES: Record<string, { icon: React.ReactNode; task: string }[]> = {
  security: [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, task: 'Guard the main gate & entry' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, task: 'Night & day shift rotations' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, task: 'Monitor CCTV cameras' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, task: 'Verify visitor entry passes' },
  ],
  housekeeping: [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, task: 'Clean rooms & common areas' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>, task: 'Sweep, mop & sanitise floors' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, task: 'Change bed linen & towels' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM3 9V6a2 2 0 012-2h14a2 2 0 012 2v3"/></svg>, task: 'Dispose waste & refill supplies' },
  ],
  driver: [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, task: 'Drive employer / guests safely' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, task: 'Know local area routes well' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/></svg>, task: 'Maintain vehicle cleanliness' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, task: 'Follow pickup & drop schedule' },
  ],
  cook: [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, task: 'Prepare meals for staff / family' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>, task: 'Plan daily breakfast & lunch menu' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4m-12 4H5a2 2 0 01-2-2v-4m0 0h18"/></svg>, task: 'Maintain kitchen hygiene' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, task: 'Handle grocery & stock management' },
  ],
};

const DEFAULT_DUTIES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, task: 'Follow daily work schedule' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, task: 'Coordinate with team & supervisor' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, task: 'Maintain quality standards' },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, task: 'Report on time for every shift' },
];

export function JobDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const job        = getJob(id!);
  const worker     = getWorker();
  const t = useT();
  const [commuteOpen, setCommuteOpen] = useState(false);
  const [saved,       setSaved]       = useState(false);

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
  const catDuties = CATEGORY_DUTIES[job.category] || DEFAULT_DUTIES;
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
              onClick={() => setSaved(s => !s)}
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
      <div className="sticky-cta">
        {applied ? (
          <Link to="/applications" className="btn btn-secondary btn-full" style={{ textDecoration: 'none' }}>
            Applied — Track Status
          </Link>
        ) : (
          <>
            <Link to={`/apply/${job.id}`} className="btn btn-primary" style={{ flex: 2, textDecoration: 'none', textAlign: 'center' }}>
              Apply Now
            </Link>
            {captain && (
              <a href={`https://wa.me/91${captain.mobile}?text=${waText}`} target="_blank" rel="noopener noreferrer"
                className="btn btn-wa" style={{ flex: 1, textAlign: 'center' }}>
                WhatsApp
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
