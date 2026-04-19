import React, { useState } from 'react';
// ── ApplicationsPage — Premium Status Tracker ─────────────────────────────────
import { useNavigate, Link } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { getMyApplications, getJob, getCaptain, getWorker } from '../data/store';
import type { AppStage } from '../types';

const STAGES: AppStage[] = ['Applied', 'Screening', 'Interviewed', 'Offer', 'Joined'];

const STAGE_META: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  Applied:    { label: 'Apply हो गया',    icon: '📋', color: '#168448', bg: '#F0FDF4' },
  Screening:  { label: 'Screening',        icon: '🔍', color: '#2563EB', bg: '#EFF6FF' },
  Interviewed:{ label: 'Interview हुआ',   icon: '🎤', color: '#7C3AED', bg: '#F5F3FF' },
  Offer:      { label: 'Offer मिल गया 🎊', icon: '🎉', color: '#D97706', bg: '#FFFBEB' },
  Joined:     { label: 'Join हो गए ✓',    icon: '✅', color: '#168448', bg: '#F0FDF4' },
  Rejected:   { label: 'Rejected',         icon: '❌', color: '#DC2626', bg: '#FEF2F2' },
};

const STATUS_TABS = [
  { id: 'all',      label: 'सभी' },
  { id: 'active',   label: '🔄 Active' },
  { id: 'joined',   label: '✅ Joined' },
  { id: 'rejected', label: '❌ Rejected' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' });
}

export function ApplicationsPage() {
  const apps     = getMyApplications();
  const worker   = getWorker();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(apps[0]?.id || null);
  const [tab, setTab] = useState('all');

  const activeCount  = apps.filter(a => !['Joined','Rejected'].includes(a.currentStage)).length;
  const joinedCount  = apps.filter(a => a.currentStage === 'Joined').length;
  const offeredCount = apps.filter(a => a.currentStage === 'Offer').length;

  const filtered = apps.filter(a => {
    if (tab === 'active')   return !['Joined','Rejected'].includes(a.currentStage);
    if (tab === 'joined')   return a.currentStage === 'Joined';
    if (tab === 'rejected') return a.currentStage === 'Rejected';
    return true;
  });

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 16px) 16px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={() => navigate(-1)} className="icon-btn icon-btn--white">←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff' }}>
              मेरी Applications
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {activeCount} active · {apps.length} total
            </div>
          </div>
          <Link to="/jobs" className="icon-btn icon-btn--white" style={{ fontSize: 20, textDecoration: 'none' }}>+</Link>
        </div>

        {/* Summary stat pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
          {[
            { v: apps.length,   l: 'Applied',  bg: 'rgba(255,255,255,0.15)' },
            { v: activeCount,   l: 'Active',   bg: 'rgba(59,130,246,0.35)' },
            { v: offeredCount,  l: 'Offers',   bg: 'rgba(245,158,11,0.35)' },
            { v: joinedCount,   l: 'Joined',   bg: 'rgba(74,222,128,0.25)' },
          ].map(s => (
            <div key={s.l} style={{
              background: s.bg, borderRadius: 'var(--r-lg)', padding: '8px 14px',
              textAlign: 'center', flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-lg)', padding: 3, gap: 2 }}>
          {STATUS_TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '8px 0', borderRadius: 'calc(var(--r-lg) - 2px)',
              background: tab === t.id ? '#fff' : 'transparent',
              border: 'none', color: tab === t.id ? 'var(--g700)' : 'rgba(255,255,255,0.75)',
              fontWeight: 700, fontSize: 11, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {filtered.length === 0 ? (
          <div className="empty" style={{ paddingTop: 60 }}>
            <div className="empty-icon">📋</div>
            <div className="empty-title">कोई Application नहीं</div>
            <div className="empty-sub">नौकरियां देखें और apply करें।</div>
            <Link to="/jobs" className="btn btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>
              Jobs देखें →
            </Link>
          </div>
        ) : (
          filtered.map(app => {
            const job     = getJob(app.jobId);
            const captain = getCaptain(app.captainId);
            const isExp   = expanded === app.id;
            const meta    = STAGE_META[app.currentStage] || STAGE_META.Applied;
            const stageIdx = STAGES.indexOf(app.currentStage as AppStage);
            const pct = app.currentStage === 'Rejected' ? 0 : Math.round(((stageIdx + 1) / STAGES.length) * 100);
            if (!job) return null;

            return (
              <div key={app.id} className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>

                {/* Stage color accent bar */}
                <div style={{ height: 4, background: meta.color, opacity: 0.8 }} />

                {/* Card header */}
                <div
                  style={{ padding: '14px 16px', cursor: 'pointer' }}
                  onClick={() => setExpanded(isExp ? null : app.id)}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Job icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--r-md)', flexShrink: 0,
                      background: meta.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22,
                    }}>
                      {meta.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 16, color: 'var(--text-hi)' }}>
                        {job.role}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 1 }}>{job.employerName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 2 }}>
                        📅 {formatDate(app.appliedAt)} को apply किया
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`,
                        borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: 14, color: 'var(--text-lo)' }}>{isExp ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {app.currentStage !== 'Rejected' && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-lo)', fontWeight: 600 }}>Progress</span>
                        <span style={{ fontSize: 11, color: meta.color, fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {STAGES.map((s, i) => (
                          <div key={s} style={{
                            flex: 1, height: 5, borderRadius: 3,
                            background: i <= stageIdx ? meta.color : 'var(--n200)',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        {STAGES.map((s, i) => (
                          <span key={s} style={{
                            fontSize: 9, color: i <= stageIdx ? meta.color : 'var(--text-lo)',
                            fontWeight: i <= stageIdx ? 700 : 400,
                          }}>
                            {s === 'Screening' ? 'Screen' : s === 'Interviewed' ? 'Interview' : s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded section */}
                {isExp && (
                  <div style={{ borderTop: '1px solid var(--divider)', padding: 16 }} className="anim-fade">

                    {/* Interview reminder */}
                    {app.currentStage === 'Interviewed' && app.interviewAt && (
                      <div style={{
                        background: '#EFF6FF', borderRadius: 'var(--r-lg)', padding: '12px 14px',
                        marginBottom: 14, border: '1px solid #BFDBFE',
                      }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 42, height: 42, borderRadius: 'var(--r-sm)', background: '#2563EB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, flexShrink: 0,
                          }}>📅</div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: 14, marginBottom: 2 }}>
                              Interview Scheduled
                            </div>
                            <div style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>
                              {new Date(app.interviewAt).toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                            <div style={{ fontSize: 12, color: '#60A5FA', marginTop: 2 }}>📍 {app.interviewLocation}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Offer card */}
                    {app.currentStage === 'Offer' && (
                      <div style={{
                        background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                        borderRadius: 'var(--r-lg)', padding: '14px 16px', marginBottom: 14,
                        border: '1px solid #FDE68A',
                      }}>
                        <div style={{ fontSize: 12, color: '#92400E', fontWeight: 600, marginBottom: 4 }}>🎊 Congratulations!</div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 24, color: 'var(--g700)' }}>
                          ₹{job.salary.min.toLocaleString()}–₹{job.salary.max.toLocaleString()}/mo
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 2 }}>{job.company} · {job.location}</div>
                      </div>
                    )}

                    {/* Joined celebration */}
                    {app.currentStage === 'Joined' && (
                      <div style={{
                        background: 'linear-gradient(135deg, var(--g50), var(--g100))',
                        borderRadius: 'var(--r-lg)', padding: '14px 16px', marginBottom: 14,
                        border: '1px solid var(--g200)', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: 'var(--g700)' }}>
                          Job Join हो गई!
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--g800)', marginTop: 4 }}>
                          {job.employerName} में ✓ Confirmed
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-mid)', marginBottom: 10 }}>
                        Application Journey
                      </div>
                      <div className="timeline">
                        {STAGES.map((stage, i) => {
                          const done  = app.stages?.find(s => s.stage === stage);
                          const isAct = stage === app.currentStage;
                          const isPast = stageIdx > i;
                          const sm = STAGE_META[stage];
                          return (
                            <div key={stage} className="tl-item">
                              <div className="tl-dot-wrap">
                                <div className={`tl-dot ${done || isPast ? 'done' : isAct ? 'active' : ''}`} />
                                {i < STAGES.length - 1 && <div className={`tl-line ${done || isPast ? 'done' : ''}`} />}
                              </div>
                              <div className="tl-content">
                                <div className={`tl-stage ${done || isAct ? 'done' : ''}`}
                                  style={{ color: isAct ? sm.color : undefined }}>
                                  {sm.icon} {sm.label}
                                </div>
                                {done && (
                                  <div className="tl-note">{formatDate(done.at)}</div>
                                )}
                                {isAct && !done && (
                                  <div className="tl-note" style={{ color: sm.color }}>→ Processing…</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {captain && (
                        <a
                          href={`https://wa.me/91${captain.mobile}`}
                          target="_blank" rel="noopener noreferrer"
                          className="btn btn-wa btn-sm"
                          style={{ flex: 1, fontSize: 13 }}
                        >
                          📲 Captain WhatsApp
                        </a>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        Job देखें →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
