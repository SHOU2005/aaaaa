import React, { useState } from 'react';
// ── HomePage — Premium Redesign ────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import { BottomNav }  from '../components/BottomNav';
import { RingMap }    from '../components/RingMap';
import { JobCard }    from '../components/JobCard';
import { getWorker, getJobs, getMyApplications, haversine } from '../data/store';

const QUICK_ACTIONS = [
  { icon: '💼', label: 'Jobs खोजें', to: '/jobs',         bg: '#F0FDF4', color: '#168448' },
  { icon: '📋', label: 'Status',     to: '/applications', bg: '#EFF6FF', color: '#1D4ED8' },
  { icon: '👥', label: 'Community',  to: '/community',    bg: '#F5F3FF', color: '#6D28D9' },
  { icon: '🎁', label: 'Refer करें', to: '/profile',      bg: '#FFFBEB', color: '#92400E' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function HomePage() {
  const worker    = getWorker();
  const allJobs   = getJobs().filter(j => j.active);
  const myApps    = getMyApplications();
  const [mapOpen, setMapOpen] = useState(false);

  const urgentJobs = allJobs.filter(j => j.urgent).slice(0, 8);
  const nearbyJobs = allJobs
    .map(j => ({ ...j, _d: haversine(worker.lat, worker.lng, j.lat, j.lng) }))
    .sort((a, b) => a._d - b._d)
    .slice(0, 4);

  const interviewApp = myApps.find(a => a.currentStage === 'Interviewed' && a.interviewAt);
  const interviewJob = interviewApp ? allJobs.find(j => j.id === interviewApp.jobId) : null;
  const lang = worker.language ?? 'hi';

  // Simulated earnings data
  const placed   = myApps.filter(a => a.currentStage === 'Joined').length;
  const earnings = placed * 8500;
  const now      = new Date();
  const month    = MONTHS[now.getMonth()];

  // Activity streak (simulated)
  const streak = Math.min(myApps.length + 3, 14);
  const streakDays = Array.from({ length: 7 }, (_, i) => i < (streak % 7 || 7));

  const hour = now.getHours();
  const greeting = hour < 12 ? 'सुप्रभात' : hour < 17 ? 'नमस्ते' : 'शुभ संध्या';
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)' }}>

      {/* ──────── HEADER ──────── */}
      <div className="header">
        <div className="header-inner">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="header-greeting">
              <span style={{ animation: 'wave 2s ease-in-out' }}>{greetEmoji}</span>
              {greeting}
              {worker.isVerified && (
                <span className="verified-badge" style={{ marginLeft: 6 }}>⭐ Verified</span>
              )}
            </div>
            <div className="header-name">{worker.name}</div>
            <div className="header-location">📍 {worker.sector}, {worker.city}</div>
          </div>
          <div className="header-actions">
            <div className="lang-sw">
              <button className="lang-btn active">{lang.toUpperCase()}</button>
            </div>
            <button className="icon-btn" style={{ position: 'relative' }}>
              🔔
              <span className="notif-dot" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 12px' }}>
          <Link to="/jobs" style={{ textDecoration: 'none' }}>
            <div className="search-bar">
              <span className="search-bar__icon">🔍</span>
              <span className="search-bar__placeholder">नौकरी, स्किल, कंपनी खोजें...</span>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🎙️</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ──────── CONTENT ──────── */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Earnings/Stats Hero ── */}
        <div className="hero-stat-card section anim-slide" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="hero-stat-label">💰 {month} Earnings</div>
            <div className="hero-stat-value">
              {earnings > 0 ? `₹${earnings.toLocaleString()}` : '₹0'}
            </div>
            <div className="hero-stat-change">
              {myApps.length > 0
                ? `↑ ${myApps.length} नौकरियां Apply की`
                : 'पहली job के लिए Apply करें!'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 'var(--r-md)',
              padding: '6px 12px', textAlign: 'center', minWidth: 70,
            }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff' }}>
                {allJobs.length}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>LIVE JOBS</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.18)', borderRadius: 'var(--r-md)',
              padding: '6px 12px', textAlign: 'center', minWidth: 70,
            }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff' }}>
                {myApps.length}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>APPLIED</div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="section">
          <div className="section-head">
            <span className="section-title">⚡ Quick Actions</span>
          </div>
          <div className="quick-actions">
            {QUICK_ACTIONS.map(qa => (
              <Link key={qa.to} to={qa.to} className="qa-btn" style={{ textDecoration: 'none' }}>
                <div className="qa-icon" style={{ background: qa.bg, color: qa.color }}>
                  {qa.icon}
                </div>
                <span className="qa-label">{qa.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Activity Streak ── */}
        <div className="streak-card section">
          <div className="streak-flame">🔥</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 2 }}>
              <span className="streak-num">{streak}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>day streak!</span>
            </div>
            <div className="streak-label">आप रोज़ Switch पर Active हैं 🎯</div>
            <div className="streak-days">
              {streakDays.map((done, i) => (
                <div key={i} className={`streak-day ${done ? 'done' : ''}`} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 28 }}>🏆</div>
        </div>

        {/* ── Referral ── */}
        <div className="section">
          <Link to="/profile" className="referral-card">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="referral-title">🎁 दोस्त को Invite करें</div>
              <div className="referral-sub">वो job join करे → आपको मिलें ₹500</div>
              <div className="referral-code">
                {worker.referralCode}
                <span style={{ opacity: 0.4 }}>|</span>
                COPY
              </div>
            </div>
            <div className="referral-arrow">→</div>
          </Link>
        </div>

        {/* ── Interview Reminder ── */}
        {interviewApp && interviewJob && (
          <div className="interview-card section">
            <div className="interview-eyebrow">📅 Interview Reminder</div>
            <div className="interview-role">{interviewJob.role}</div>
            <div className="interview-sub">{interviewJob.employerName} · {interviewApp.interviewLocation}</div>
            <Link to="/applications" className="interview-cta">Details देखें →</Link>
          </div>
        )}

        {/* ── Live Map (collapsible) ── */}
        <div className="section">
          <div
            className="card"
            style={{ overflow: 'hidden' }}
          >
            <div
              className="map-head"
              style={{ cursor: 'pointer' }}
              onClick={() => setMapOpen(o => !o)}
            >
              <span className="map-title">🗺️ Jobs Near Me</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--g700)', fontWeight: 600 }}>
                  {allJobs.length} nearby
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: '50%', background: 'var(--g50)',
                  fontSize: 12, color: 'var(--g700)', fontWeight: 700,
                  transform: mapOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s',
                }}>▼</span>
              </div>
            </div>
            {mapOpen && (
              <div style={{ animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
                <RingMap jobs={allJobs} workerLat={worker.lat} workerLng={worker.lng} />
              </div>
            )}
            {!mapOpen && (
              <div style={{
                padding: '12px 16px', background: 'var(--g50)', borderTop: '1px solid var(--g100)',
                display: 'flex', gap: 8, alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: 'var(--g800)', fontWeight: 600 }}>
                  📍 {nearbyJobs[0] ? `${nearbyJobs[0].role} — ${Math.round((nearbyJobs[0] as any)._d * 10) / 10} km दूर` : 'आस-पास jobs हैं'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--g700)', fontWeight: 700, marginLeft: 'auto', cursor: 'pointer' }}
                  onClick={() => setMapOpen(true)}>Map खोलें ↗</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Urgent Jobs ── */}
        <div className="section">
          <div className="section-head">
            <span className="section-title">
              <span className="live-dot" />
              Urgent Jobs
            </span>
            <Link to="/jobs?filter=urgent" className="section-link">सब देखें →</Link>
          </div>
          <div className="hscroll">
            {urgentJobs.length > 0
              ? urgentJobs.map(job => (
                  <JobCard key={job.id} job={job} workerLat={worker.lat} workerLng={worker.lng} compact />
                ))
              : <div style={{ fontSize: 13, color: 'var(--text-lo)', padding: '20px 0' }}>अभी कोई urgent job नहीं</div>
            }
          </div>
        </div>

        {/* ── Nearby Jobs ── */}
        <div className="section">
          <div className="section-head">
            <span className="section-title">📍 Sabse Paas</span>
            <Link to="/jobs" className="section-link">Sab dekhein →</Link>
          </div>
          {nearbyJobs.map(job => (
            <JobCard key={job.id} job={job} workerLat={worker.lat} workerLng={worker.lng} />
          ))}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
