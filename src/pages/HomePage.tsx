import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav }  from '../components/BottomNav';
import { useT } from '../i18n/useT';
import { RingMap }    from '../components/RingMap';
import { JobCard }    from '../components/JobCard';
import { getWorker, getJobs, getMyApplications, haversine } from '../data/store';

export function HomePage() {
  const worker  = getWorker();
  const allJobs = getJobs().filter(j => j.active);
  const myApps  = getMyApplications();
  const [mapOpen, setMapOpen] = useState(true);

  // Referral popup — once per session, delayed
  const [referralVisible, setReferralVisible] = useState(false);
  useEffect(() => {
    const dismissed = sessionStorage.getItem('referral_dismissed');
    if (!dismissed) {
      const t = setTimeout(() => setReferralVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);
  const dismissReferral = () => {
    setReferralVisible(false);
    sessionStorage.setItem('referral_dismissed', '1');
  };

  const urgentJobs = allJobs.filter(j => j.urgent).slice(0, 8);
  const nearbyJobs = allJobs
    .map(j => ({ ...j, _d: haversine(worker.lat, worker.lng, j.lat, j.lng) }))
    .sort((a, b) => a._d - b._d)
    .slice(0, 4);

  const interviewApp = myApps.find(a => a.currentStage === 'Interviewed' && a.interviewAt);
  const interviewJob = interviewApp ? allJobs.find(j => j.id === interviewApp.jobId) : null;

  const now  = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const nameInitials = worker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)', background: '#F8F9FA', minHeight: '100dvh' }}>

      {/* ── Referral Bottom Sheet Popup ── */}
      {referralVisible && (
        <>
          <div
            onClick={dismissReferral}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 900, backdropFilter: 'blur(3px)',
            }}
          />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 430, zIndex: 901,
            background: '#fff', borderRadius: '24px 24px 0 0',
            padding: '8px 24px 40px',
            animation: 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
            boxShadow: '0 -12px 40px rgba(0,0,0,0.15)',
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '12px auto 20px' }} />

            <button
              onClick={dismissReferral}
              style={{
                position: 'absolute', top: 20, right: 20, background: '#F3F4F6',
                border: 'none', borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 14, color: '#6B7280', fontWeight: 700,
              }}
            >✕</button>

            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: 'inline-block', background: '#ECFDF5', color: '#065F46',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
                textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, marginBottom: 10,
              }}>Referral Offer</div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#111827', marginBottom: 6 }}>
                Refer a friend,<br />earn ₹500
              </div>
              <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                Share your code. When a friend joins Switch and gets a job, you earn ₹500 — no limits.
              </div>
            </div>

            {/* Code box */}
            <div style={{
              background: '#F9FAFB', border: '1.5px dashed #D1D5DB', borderRadius: 12,
              padding: '14px 16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 16,
            }}>
              <div>
                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Your Code</div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 22, color: '#111827', letterSpacing: 3 }}>
                  {worker.referralCode}
                </div>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(worker.referralCode)}
                style={{
                  background: '#1B6B3A', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '9px 16px', fontSize: 12,
                  fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3,
                }}
              >COPY</button>
            </div>

            <a
              href={`https://wa.me/?text=Switch%20app%20se%20ghar%20ke%20paas%20job%20milti%20hai!%20Code%3A%20${worker.referralCode}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                background: '#25D366', color: '#fff', borderRadius: 12,
                padding: '14px', textDecoration: 'none',
                fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15,
              }}
            >Share via WhatsApp</a>
          </div>
        </>
      )}

      {/* ── Header ── */}
      <div style={{
        background: '#1B6B3A',
        padding: '48px 20px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 3 }}>
              {greeting}
            </div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1.1 }}>
              {worker.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>
              {worker.sector}, {worker.city}
              {worker.isVerified && (
                <span style={{
                  marginLeft: 6, background: 'rgba(255,255,255,0.15)', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                  letterSpacing: 0.3,
                }}>VERIFIED</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setReferralVisible(true)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10, width: 38, height: 38, cursor: 'pointer',
                color: '#fff', fontSize: 11, fontWeight: 700,
              }}
            >₹</button>
            <button style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 10, width: 38, height: 38, cursor: 'pointer',
              color: '#fff', fontSize: 16, position: 'relative',
            }}>
              🔔
              <div style={{
                position: 'absolute', top: 7, right: 8, width: 7, height: 7,
                background: '#EF4444', borderRadius: '50%', border: '1.5px solid #1B6B3A',
              }} />
            </button>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 15, color: '#fff',
              }}>{nameInitials}</div>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <Link to="/jobs" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            background: '#fff', borderRadius: 12,
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize: 14, color: '#9CA3AF', flex: 1 }}>Search jobs, skills, companies…</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/>
            </svg>
          </div>
        </Link>
      </div>

      {/* ── Stat pills ── */}
      <div style={{
        background: '#fff', padding: '14px 20px',
        borderBottom: '1px solid #F3F4F6',
        display: 'flex', gap: 0,
      }}>
        {[
          { label: 'Active Jobs', value: allJobs.length },
          { label: 'Applied', value: myApps.length },
          { label: 'Urgent', value: allJobs.filter(j => j.urgent).length },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center',
            borderRight: i < 2 ? '1px solid #F3F4F6' : 'none',
          }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 22, color: '#1B6B3A' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Interview reminder ── */}
        {interviewApp && interviewJob && (
          <div style={{
            background: '#fff', borderRadius: 14,
            border: '1px solid #E5E7EB', padding: '14px 16px',
            marginBottom: 16, borderLeft: '4px solid #1D4ED8',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              Interview Scheduled
            </div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#111827' }}>
              {interviewJob.role}
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {interviewJob.employerName} · {interviewApp.interviewLocation}
            </div>
            <Link to="/applications" style={{
              display: 'inline-block', marginTop: 10, fontSize: 12,
              color: '#1D4ED8', fontWeight: 700, textDecoration: 'none',
            }}>View details →</Link>
          </div>
        )}

        {/* ── Jobs Near Me Map ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#111827' }}>Jobs Near Me</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{allJobs.length} open positions in your area</div>
            </div>
            <button
              onClick={() => setMapOpen(o => !o)}
              style={{
                background: mapOpen ? '#ECFDF5' : '#F3F4F6',
                color: mapOpen ? '#065F46' : '#6B7280',
                border: 'none', borderRadius: 8, padding: '6px 12px',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >{mapOpen ? 'Hide map' : 'Show map'}</button>
          </div>
          {mapOpen && (
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <RingMap jobs={allJobs} workerLat={worker.lat} workerLng={worker.lng} />
            </div>
          )}
        </div>

        {/* ── Urgent / Featured ── */}
        {urgentJobs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#111827' }}>Urgent Openings</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Hiring now · Limited spots</div>
              </div>
              <Link to="/jobs?filter=urgent" style={{ fontSize: 12, color: '#1B6B3A', fontWeight: 700, textDecoration: 'none' }}>
                See all
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' as any }}>
              {urgentJobs.map(job => (
                <JobCard key={job.id} job={job} workerLat={worker.lat} workerLng={worker.lng} compact />
              ))}
            </div>
          </div>
        )}

        {/* ── Nearest Jobs ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#111827' }}>Closest to You</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>Sorted by walking distance</div>
            </div>
            <Link to="/jobs" style={{ fontSize: 12, color: '#1B6B3A', fontWeight: 700, textDecoration: 'none' }}>
              View all
            </Link>
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
