// ── JobDetailPage — Premium Redesign ──────────────────────────────────────────
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getJob, getCaptain, getWorker, haversine, walkTime, formatSalary, hasApplied } from '../data/store';

const CAT_ICONS: Record<string, string> = {
  security: '🔒', housekeeping: '🧹', driver: '🚗', cook: '👨‍🍳',
  helper: '🏗️', technician: '🔧', gardener: '🌿', caretaker: '👴',
};

export function JobDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const job        = getJob(id!);
  const worker     = getWorker();
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
  const catIcon  = CAT_ICONS[job.category] || '💼';

  const DETAILS = [
    { icon: '🕐', label: 'Shift',    value: job.shift,        highlight: false },
    { icon: '🍽️', label: 'खाना',    value: job.food ? 'मिलेगा ✓' : 'नहीं', highlight: !!job.food },
    { icon: '🏠', label: 'रहना',    value: job.accommodation ? 'मिलेगा ✓' : 'नहीं', highlight: !!job.accommodation },
    { icon: '👔', label: 'Uniform', value: job.uniform === 'company_provided' ? 'Company देगी ✓' : 'खुद लाना होगा', highlight: job.uniform === 'company_provided' },
    { icon: '📋', label: 'Experience', value: job.experience, highlight: false },
    { icon: '📄', label: 'Documents', value: Array.isArray(job.documents) ? job.documents.join(' · ') : typeof job.documents === 'object' && job.documents !== null ? Object.entries(job.documents).filter(([,v]) => v).map(([k]) => k).join(' · ') : (job.documents as string || 'Aadhar Card'), highlight: false },
    { icon: '👥', label: 'Vacancies', value: `${job.openings} पद खाली हैं`, highlight: job.openings >= 3 },
  ];

  const waText = encodeURIComponent(
    `नमस्ते! मेरा नाम ${worker.name} है (${worker.regNumber}). ${job.role} (${job.employerName}) के बारे में पूछना है।`
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
          <div style={{
            width: 60, height: 60, borderRadius: 'var(--r-lg)', flexShrink: 0,
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
            backdropFilter: 'blur(8px)',
          }}>
            {catIcon}
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
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>/माह</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '7px 14px', fontSize: 13, color: '#fff', fontWeight: 600,
          }}>
            🚶 {commute} · {dist.toFixed(1)} km
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Quick Info Badges ── */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            job.food && { bg: '#F0FDF4', c: '#168448', t: '🍽️ खाना' },
            job.accommodation && { bg: '#EFF6FF', c: '#2563EB', t: '🏠 रहना' },
            { bg: '#F5F3FF', c: '#7C3AED', t: `⭐ ${job.employerRating}` },
            job.urgent && { bg: '#FEF2F2', c: '#DC2626', t: '⚡ Urgent' },
          ].filter(Boolean).map((b: any) => (
            <span key={b.t} style={{
              background: b.bg, color: b.c, borderRadius: 999, padding: '5px 12px',
              fontSize: 12, fontWeight: 700,
            }}>{b.t}</span>
          ))}
        </div>

        {/* ── Commute Calculator ── */}
        <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
          <div
            style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={() => setCommuteOpen(p => !p)}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--g50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
              }}>
                🧭
              </div>
              <div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, color: 'var(--g700)' }}>
                  Commute Calculator
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 1 }}>
                  {worker.sector} से · 🚶 {commute}
                </div>
              </div>
            </div>
            <span style={{ color: 'var(--text-lo)', fontSize: 16, transform: commuteOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
          </div>

          {commuteOpen && (
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--divider)' }} className="anim-fade">
              {[
                { icon: '🚶', mode: 'पैदल', cost: 'FREE', color: 'var(--g700)' },
                { icon: '🛺', mode: 'Auto', cost: `₹${autoCost.toLocaleString()}/mo`, color: 'var(--amber)' },
                { icon: '🚌', mode: 'Bus', cost: `₹${busCost.toLocaleString()}/mo`, color: 'var(--blue)' },
              ].map(r => (
                <div key={r.mode} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--divider)',
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>{r.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 500 }}>{r.mode}</span>
                  </div>
                  <span style={{ fontFamily: 'Baloo 2', fontWeight: 700, color: r.color }}>{r.cost}</span>
                </div>
              ))}
              {job.nearbyPG?.available && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--blue-bg)', borderRadius: 'var(--r-sm)', fontSize: 12, color: '#1D4ED8', fontWeight: 600 }}>
                  🏠 Nearby PG available: {job.nearbyPG.priceRange}
                </div>
              )}
              <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--g50)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--g800)', fontWeight: 600 }}>
                💡 यह job नज़दीक है — commute सस्ता पड़ेगा!
              </div>
            </div>
          )}
        </div>

        {/* ── Job Details Card ── */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ padding: '14px 16px', fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--divider)' }}>
            📋 Job Details
          </div>
          <div style={{ padding: '4px 16px 8px' }}>
            {DETAILS.map(row => (
              <div key={row.label} className="detail-row">
                <span className="detail-icon">{row.icon}</span>
                <div style={{ flex: 1 }}>
                  <div className="detail-label">{row.label}</div>
                  <div className="detail-value" style={{ color: row.highlight ? 'var(--g700)' : undefined, fontWeight: row.highlight ? 600 : 500 }}>
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Employer Card ── */}
        <div className="card" style={{ marginBottom: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-lo)', fontWeight: 600, marginBottom: 10 }}>🏢 Employer</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 'var(--r-md)', background: 'var(--g50)',
              border: '1px solid var(--g100)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 26, flexShrink: 0,
            }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 16 }}>{job.employerName}</div>
              <div style={{ fontSize: 11, color: 'var(--g700)', fontWeight: 600, marginTop: 2 }}>✓ Switch Verified Employer</div>
              <div style={{ marginTop: 6 }}>
                <span style={{ color: '#F59E0B', fontSize: 14 }}>{stars(job.employerRating)}</span>
                <span style={{ fontSize: 12, color: 'var(--text-lo)', marginLeft: 6 }}>{job.employerRating} ({job.employerReviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Captain Card ── */}
        {captain && (
          <div className="card" style={{ marginBottom: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-lo)', fontWeight: 600, marginBottom: 10 }}>🧢 आपका Switch Captain</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar av-md" style={{ background: 'var(--g700)' }}>{captain.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>{captain.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 1 }}>
                  ✅ {captain.placements} successful placements
                </div>
              </div>
              <a
                href={`https://wa.me/91${captain.mobile}?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-wa btn-sm"
              >
                📲 Chat
              </a>
            </div>
          </div>
        )}

        {/* Similar jobs hint */}
        <div style={{ padding: '12px 16px', background: 'var(--g50)', borderRadius: 'var(--r-lg)', border: '1px solid var(--g100)', marginBottom: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--g800)', fontWeight: 600 }}>
            👥 27 workers ने इस job को apply किया · 3 पद बचे हैं!
          </div>
        </div>
      </div>

      {/* ── STICKY APPLY BAR ── */}
      <div className="sticky-cta">
        {applied ? (
          <Link to="/applications" className="btn btn-secondary btn-full" style={{ textDecoration: 'none' }}>
            ✓ Applied — Status देखें →
          </Link>
        ) : (
          <>
            <Link to={`/apply/${job.id}`} className="btn btn-primary" style={{ flex: 2, textDecoration: 'none', textAlign: 'center' }}>
              अभी Apply करें →
            </Link>
            {captain && (
              <a
                href={`https://wa.me/91${captain.mobile}?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-wa"
                style={{ flex: 1, textAlign: 'center' }}
              >
                📲 WA
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
