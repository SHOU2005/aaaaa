import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav }  from '../components/BottomNav';
import { useLang }    from '../i18n/useT';
import { LangToggle } from '../components/LangToggle';
import { RingMap }    from '../components/RingMap';
import { JobCard }    from '../components/JobCard';
import { getWorker, getJobs, getMyApplications, haversine } from '../data/store';

const CATEGORY_FILTERS = [
  { id: 'all',          label: 'सभी',          labelEn: 'All',          icon: '🌟' },
  { id: 'security',     label: 'Security',      labelEn: 'Security',     icon: '🔒' },
  { id: 'housekeeping', label: 'Housekeeping',  labelEn: 'Housekeeping', icon: '🧹' },
  { id: 'driver',       label: 'Driver',        labelEn: 'Driver',       icon: '🚗' },
  { id: 'cook',         label: 'Cook',          labelEn: 'Cook',         icon: '👨‍🍳' },
  { id: 'helper',       label: 'Helper',        labelEn: 'Helper',       icon: '🏗️' },
];

export function HomePage() {
  const worker  = getWorker();
  const allJobs = getJobs().filter(j => j.active);
  const myApps  = getMyApplications();
  const { lang } = useLang();
  const [mapOpen, setMapOpen] = useState(true);
  const [catFilter, setCatFilter] = useState('all');

  const [referralVisible, setReferralVisible] = useState(false);
  useEffect(() => {
    const dismissed = sessionStorage.getItem('referral_dismissed');
    if (!dismissed) {
      const t = setTimeout(() => setReferralVisible(true), 3500);
      return () => clearTimeout(t);
    }
  }, []);
  const dismissReferral = () => {
    setReferralVisible(false);
    sessionStorage.setItem('referral_dismissed', '1');
  };

  const urgentJobs = allJobs.filter(j => j.urgent).slice(0, 8);

  const nearbyJobs = useMemo(() =>
    allJobs
      .map(j => ({ ...j, _d: haversine(worker.lat, worker.lng, j.lat, j.lng) }))
      .sort((a, b) => a._d - b._d)
      .filter(j => catFilter === 'all' || j.category === catFilter)
      .slice(0, 6),
    [allJobs, catFilter, worker.lat, worker.lng]
  );

  const interviewApp = myApps.find(a => a.currentStage === 'Interviewed' && a.interviewAt);
  const interviewJob = interviewApp ? allJobs.find(j => j.id === interviewApp.jobId) : null;

  const now  = new Date();
  const hour = now.getHours();
  const isHindi = lang === 'hi';

  const greeting = hour < 12
    ? (isHindi ? 'शुभ प्रभात' : 'Good morning')
    : hour < 17
    ? (isHindi ? 'नमस्कार' : 'Good afternoon')
    : (isHindi ? 'शुभ संध्या' : 'Good evening');

  const nameInitials = worker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)', background: '#F5F6F2', minHeight: '100dvh' }}>

      {/* ── Referral Bottom Sheet ── */}
      {referralVisible && (
        <>
          <div onClick={dismissReferral} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 900, backdropFilter: 'blur(3px)',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 430, zIndex: 901,
            background: '#fff', borderRadius: '24px 24px 0 0',
            padding: `8px 20px calc(40px + env(safe-area-inset-bottom, 0px))`,
            animation: 'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
            boxShadow: '0 -12px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ width: 40, height: 4, background: '#E5E7EB', borderRadius: 2, margin: '14px auto 20px' }} />
            <button onClick={dismissReferral} style={{
              position: 'absolute', top: 20, right: 20, background: '#F3F4F6',
              border: 'none', borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14, color: '#6B7280', fontWeight: 700,
            }}>✕</button>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'inline-block', background: '#ECFDF5', color: '#065F46', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, marginBottom: 10 }}>
                Referral Offer
              </div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#111827', marginBottom: 6 }}>
                दोस्त को Refer करो,<br />₹500 कमाओ
              </div>
              <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
                अपना Code share करो। जब दोस्त Switch से नौकरी पाए, तुम्हें ₹500 मिलेंगे।
              </div>
            </div>

            <div style={{ background: '#F9FAFB', border: '1.5px dashed #D1D5DB', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Your Code</div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 22, color: '#111827', letterSpacing: 3 }}>{worker.referralCode}</div>
              </div>
              <button onClick={() => navigator.clipboard?.writeText(worker.referralCode)} style={{ background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                COPY
              </button>
            </div>

            <a href={`https://wa.me/?text=${encodeURIComponent(`Switch App से घर के पास Job मिलती है! मेरा Code: ${worker.referralCode} — यहाँ Download करो`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center', background: '#25D366', color: '#fff', borderRadius: 12, padding: '14px', textDecoration: 'none', fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>
              WhatsApp से Share करें
            </a>
          </div>
        </>
      )}

      {/* ── Premium Hero Header ── */}
      <div style={{
        background: 'linear-gradient(150deg, #0B2E18 0%, #1B6B3A 55%, #1F7A42 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 48px) 20px 0',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        {/* Top row: greeting + actions */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 3 }}>{greeting}</div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1.1 }}>{worker.name}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              📍 {worker.sector}, {worker.city}
              {worker.isVerified && (
                <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, letterSpacing: 0.3 }}>✓ VERIFIED</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LangToggle />
            <button onClick={() => setReferralVisible(true)} style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10, width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 700,
            }}>₹</button>
            <button style={{
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10, width: 38, height: 38, cursor: 'pointer', color: '#fff', fontSize: 15, position: 'relative',
            }}>
              🔔
              <div style={{ position: 'absolute', top: 7, right: 8, width: 7, height: 7, background: '#EF4444', borderRadius: '50%', border: '1.5px solid #1B6B3A' }} />
            </button>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 15, color: '#fff',
              }}>{nameInitials}</div>
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <Link to="/jobs" style={{ textDecoration: 'none', display: 'block', marginBottom: 18 }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span style={{ fontSize: 14, color: '#9CA3AF', flex: 1 }}>
              {isHindi ? 'नौकरी खोजें — Security, Driver, Cook…' : 'Search jobs — Security, Driver, Cook…'}
            </span>
          </div>
        </Link>

        {/* Spacer */}
        <div style={{ paddingBottom: 18 }} />
      </div>

      {/* ── Category Filter Strip ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #F0F1ED', paddingTop: 2 }}>
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 12px',
          WebkitOverflowScrolling: 'touch' as any,
          scrollbarWidth: 'none' as any,
        }}>
          {CATEGORY_FILTERS.map(cat => {
            const active = catFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCatFilter(cat.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 999,
                  border: active ? 'none' : '1.5px solid #E5E7EB',
                  background: active ? '#1B6B3A' : '#F9FAFB',
                  color: active ? '#fff' : '#4B5563',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.18s',
                  boxShadow: active ? '0 2px 10px rgba(27,107,58,0.25)' : 'none',
                }}
              >
                <span>{cat.icon}</span>
                <span>{isHindi ? cat.label : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Interview reminder ── */}
        {interviewApp && interviewJob && (
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
            padding: '14px 16px', marginBottom: 16, borderLeft: '4px solid #1D4ED8',
            boxShadow: '0 2px 8px rgba(29,78,216,0.08)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 }}>
              📅 {isHindi ? 'Interview है आज' : 'Interview Scheduled'}
            </div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#111827' }}>{interviewJob.role}</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{interviewJob.employerName} · {interviewApp.interviewLocation}</div>
            <Link to="/applications" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#1D4ED8', fontWeight: 700, textDecoration: 'none' }}>
              Details देखें →
            </Link>
          </div>
        )}

        {/* ── Ring Map ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>
                {isHindi ? 'पास की नौकरियाँ' : 'Jobs Near Me'}
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{allJobs.length} {isHindi ? 'खाली पद आपके आसपास' : 'open positions near you'}</div>
            </div>
            <button onClick={() => setMapOpen(o => !o)} style={{
              background: mapOpen ? '#ECFDF5' : '#F3F4F6',
              color: mapOpen ? '#065F46' : '#6B7280',
              border: 'none', borderRadius: 8, padding: '6px 12px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>{mapOpen ? (isHindi ? 'Map छुपाएं' : 'Hide map') : (isHindi ? 'Map दिखाएं' : 'Show map')}</button>
          </div>
          {mapOpen && (
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
              <RingMap jobs={allJobs} workerLat={worker.lat} workerLng={worker.lng} />
            </div>
          )}
        </div>

        {/* ── Urgent Jobs ── */}
        {urgentJobs.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>
                  ⚡ {isHindi ? 'अर्जेंट नौकरियाँ' : 'Urgent Openings'}
                </div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>{isHindi ? 'अभी hiring हो रहा है' : 'Hiring now · Limited spots'}</div>
              </div>
              <Link to="/jobs?filter=urgent" style={{ fontSize: 12, color: '#1B6B3A', fontWeight: 700, textDecoration: 'none' }}>
                {isHindi ? 'सभी देखें' : 'See all'}
              </Link>
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, WebkitOverflowScrolling: 'touch' as any }}>
              {urgentJobs.map(job => (
                <JobCard key={job.id} job={job} workerLat={worker.lat} workerLng={worker.lng} compact />
              ))}
            </div>
          </div>
        )}

        {/* ── Nearby / Filtered Jobs ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>
                {catFilter === 'all'
                  ? (isHindi ? 'आपके पास की नौकरियाँ' : 'Closest to You')
                  : `${CATEGORY_FILTERS.find(c => c.id === catFilter)?.icon} ${CATEGORY_FILTERS.find(c => c.id === catFilter)?.label} Jobs`
                }
              </div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                {isHindi ? 'दूरी के अनुसार' : 'Sorted by walking distance'}
              </div>
            </div>
            <Link to="/jobs" style={{ fontSize: 12, color: '#1B6B3A', fontWeight: 700, textDecoration: 'none' }}>
              {isHindi ? 'सभी देखें' : 'View all'}
            </Link>
          </div>

          {nearbyJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: '#9CA3AF' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#6B7280' }}>
                {isHindi ? 'इस category में अभी नौकरी नहीं है' : 'No jobs in this category right now'}
              </div>
              <button onClick={() => setCatFilter('all')} style={{ marginTop: 12, background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {isHindi ? 'सभी नौकरियाँ देखें' : 'Show all jobs'}
              </button>
            </div>
          ) : (
            nearbyJobs.map(job => (
              <JobCard key={job.id} job={job} workerLat={worker.lat} workerLng={worker.lng} />
            ))
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
