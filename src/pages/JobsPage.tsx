import React, { useState, useMemo } from 'react';
// ── JobsPage — with Map View + List View toggle ────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { BottomNav }  from '../components/BottomNav';
import { JobCard }    from '../components/JobCard';
import { RingMap }    from '../components/RingMap';
import { getWorker, getJobs, haversine } from '../data/store';

const FILTERS = [
  { id: 'all',           label: 'सभी' },
  { id: '0-1km',         label: '📍 0–1 km' },
  { id: '1-3km',         label: '1–3 km' },
  { id: 'urgent',        label: '⚡ Urgent' },
  { id: 'security',      label: '🔒 Security' },
  { id: 'housekeeping',  label: '🧹 Housekeeping' },
  { id: 'driver',        label: '🚗 Driver' },
  { id: 'cook',          label: '👨‍🍳 Cook' },
  { id: 'helper',        label: '🏗️ Helper' },
  { id: 'food',          label: '🍽️ खाना' },
  { id: 'accommodation', label: '🏠 रहना' },
];

const SORTS = [
  { id: 'nearby', label: '📍 नज़दीकी' },
  { id: 'new',    label: '🆕 नई' },
  { id: 'salary', label: '💰 Salary' },
];

export function JobsPage() {
  const worker  = getWorker();
  const allJobs = getJobs().filter(j => j.active);
  const [query,   setQuery]   = useState('');
  const [filter,  setFilter]  = useState('all');
  const [sort,    setSort]    = useState('nearby');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const navigate = useNavigate();

  const results = useMemo(() => {
    let jobs = allJobs.map(j => ({ ...j, _d: haversine(worker.lat, worker.lng, j.lat, j.lng) }));
    if (query) {
      const q = query.toLowerCase();
      jobs = jobs.filter(j => j.role.toLowerCase().includes(q) || j.employerName.toLowerCase().includes(q));
    }
    switch (filter) {
      case '0-1km':         jobs = jobs.filter(j => j._d <= 1); break;
      case '1-3km':         jobs = jobs.filter(j => j._d > 1 && j._d <= 3); break;
      case 'urgent':        jobs = jobs.filter(j => j.urgent); break;
      case 'food':          jobs = jobs.filter(j => j.food); break;
      case 'accommodation': jobs = jobs.filter(j => j.accommodation); break;
      default:              if (filter !== 'all') jobs = jobs.filter(j => j.category === filter);
    }
    switch (sort) {
      case 'nearby': jobs.sort((a, b) => a._d - b._d); break;
      case 'new':    jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()); break;
      case 'salary': jobs.sort((a, b) => b.salary.max - a.salary.max); break;
    }
    return jobs;
  }, [allJobs, query, filter, sort, worker]);

  return (
    <div style={{ paddingBottom: viewMode === 'map' ? 0 : 'calc(var(--nav-h) + var(--bot-pad) + 12px)' }}>

      {/* ── Header ─ */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 14px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button onClick={() => navigate(-1)} className="icon-btn icon-btn--white">←</button>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff', flex: 1 }}>नौकरी खोजें</div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
            {results.length} jobs
          </span>
          {/* View toggle */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 10,
            padding: 3, gap: 2, border: '1px solid rgba(255,255,255,0.2)',
          }}>
            {([['list','☰'],['map','🗺️']] as const).map(([v, icon]) => (
              <button key={v} onClick={() => setViewMode(v)} style={{
                width: 36, height: 28, borderRadius: 8,
                background: viewMode === v ? '#fff' : 'transparent',
                border: 'none', cursor: 'pointer', fontSize: 16,
                transition: 'all 0.2s', color: viewMode === v ? 'var(--g700)' : 'rgba(255,255,255,0.8)',
              }}>{icon}</button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)',
          borderRadius: 'var(--r-lg)', padding: '10px 14px',
        }}>
          <span style={{ fontSize: 16, filter: 'brightness(10)' }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="नौकरी, कंपनी, स्किल..."
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: '#fff', fontSize: 14 }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 18, cursor: 'pointer' }}>×</button>
          )}
        </div>
      </div>

      {/* ── Filter + Sort (list view only) ── */}
      {viewMode === 'list' && (
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 108, zIndex: 40 }}>
          <div className="chip-row" style={{ padding: '10px 16px 8px' }}>
            {FILTERS.map(f => (
              <button key={f.id} className={`chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="chip-row" style={{ padding: '0 16px 10px', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-lo)', fontWeight: 600, whiteSpace: 'nowrap' }}>Sort:</span>
            {SORTS.map(s => (
              <button key={s.id} className={`chip ${sort === s.id ? 'active' : ''}`} onClick={() => setSort(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── MAP VIEW ── */}
      {viewMode === 'map' && (
        <div style={{ height: 'calc(100dvh - 120px)', display: 'flex', flexDirection: 'column' }}>
          {/* Map fills remaining height */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ height: '100%' }}>
              <RingMap jobs={results} workerLat={worker.lat} workerLng={worker.lng} fullscreen />
            </div>
          </div>

          {/* Bottom job list strip — scrollable */}
          <div style={{
            background: 'var(--white)',
            borderTop: '1px solid var(--border)',
            padding: '10px 0 4px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          }}>
            <div style={{ padding: '0 16px 6px', fontSize: 12, color: 'var(--text-lo)', fontWeight: 600 }}>
              {results.length} jobs मिले · Tap marker to see details
            </div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 8px' }}>
              {results.slice(0, 10).map(job => (
                <div
                  key={job.id}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  style={{
                    minWidth: 160, background: 'var(--white)', border: '1px solid var(--border)',
                    borderRadius: 'var(--r-lg)', padding: '10px 12px', cursor: 'pointer',
                    flexShrink: 0, boxShadow: 'var(--sh-card)',
                  }}
                >
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 13, color: 'var(--text-hi)', marginBottom: 2 }}>
                    {job.role}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-lo)', marginBottom: 6 }}>{job.employerName}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 14, color: 'var(--g700)' }}>
                      ₹{job.salary.min.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>
                      📍 {(job as any)._d?.toFixed(1) ?? '?'} km
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BottomNav />
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {viewMode === 'list' && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ fontSize: 13, color: 'var(--text-lo)', fontWeight: 500, marginBottom: 12 }}>
            {results.length} नौकरियां मिलीं
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">😕</div>
              <div className="empty-title">कोई नौकरी नहीं मिली</div>
              <div className="empty-sub">दूसरा filter try करें</div>
              <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => { setFilter('all'); setQuery(''); }}>
                सभी दिखाएं
              </button>
            </div>
          ) : (
            results.map(job => (
              <JobCard key={job.id} job={job} workerLat={worker.lat} workerLng={worker.lng} />
            ))
          )}
        </div>
      )}

      {viewMode === 'list' && <BottomNav />}
    </div>
  );
}
