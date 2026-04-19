import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { getMyApplications, getJob, getCaptain, getWorker } from '../data/store';
import type { AppStage } from '../types';

const STAGES: AppStage[] = ['Applied', 'Screening', 'Interviewed', 'Offer', 'Joined'];

const STAGE_META: Record<string, { label: string; color: string; bg: string }> = {
  Applied:     { label: 'Applied',     color: '#1B6B3A', bg: '#ECFDF5' },
  Screening:   { label: 'Screening',   color: '#1D4ED8', bg: '#EFF6FF' },
  Interviewed: { label: 'Interviewed', color: '#6D28D9', bg: '#F5F3FF' },
  Offer:       { label: 'Offer',       color: '#B45309', bg: '#FFFBEB' },
  Joined:      { label: 'Joined',      color: '#1B6B3A', bg: '#ECFDF5' },
  Rejected:    { label: 'Rejected',    color: '#B91C1C', bg: '#FEF2F2' },
};

const TABS = [
  { id: 'all',      label: 'All' },
  { id: 'active',   label: 'Active' },
  { id: 'joined',   label: 'Joined' },
  { id: 'rejected', label: 'Rejected' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function ChevronIcon({ down }: { down: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: down ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', color: '#9CA3AF' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
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
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)', background: '#F7F8F5', minHeight: '100dvh' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0F3D21 0%, #1B6B3A 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 48px) 16px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff' }}>My Applications</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
              {activeCount} active · {apps.length} total
            </div>
          </div>
          <Link to="/jobs" style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: '#fff', fontSize: 22, fontWeight: 300, lineHeight: 1,
          }}>+</Link>
        </div>

        {/* Stat row */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          {[
            { v: apps.length,   l: 'Applied' },
            { v: activeCount,   l: 'Active' },
            { v: offeredCount,  l: 'Offers' },
            { v: joinedCount,   l: 'Joined' },
          ].map((s, i) => (
            <div key={s.l} style={{
              flex: 1, textAlign: 'center', padding: '10px 0',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none',
            }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)', marginTop: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '11px 0',
              background: 'transparent', border: 'none',
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.45)',
              fontWeight: tab === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer',
              borderBottom: tab === t.id ? '2px solid #fff' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── Application Cards ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: '#ECFDF5',
              margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B6B3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2h-4"/>
                <path d="M9 2a2 2 0 002 2h2a2 2 0 002-2"/>
              </svg>
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#0D1B0F', marginBottom: 8 }}>No applications yet</div>
            <div style={{ fontSize: 14, color: '#8A9A8C', marginBottom: 20 }}>Browse jobs and apply to get started</div>
            <Link to="/jobs" style={{
              display: 'inline-block', background: '#1B6B3A', color: '#fff',
              padding: '12px 24px', borderRadius: 12, textDecoration: 'none',
              fontWeight: 700, fontSize: 14,
            }}>Browse Jobs</Link>
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
              <div key={app.id} style={{
                background: '#fff', borderRadius: 16,
                border: '1px solid #E8EAE5', marginBottom: 12, overflow: 'hidden',
                boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
              }}>
                {/* Accent bar */}
                <div style={{ height: 3, background: meta.color }} />

                {/* Card header — tap to expand */}
                <div onClick={() => setExpanded(isExp ? null : app.id)} style={{ padding: '14px 16px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                    {/* Stage icon */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                      background: meta.bg, border: `1px solid ${meta.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2h-4"/>
                        <path d="M9 2a2 2 0 002 2h2a2 2 0 002-2"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#0D1B0F', lineHeight: 1.2 }}>{job.role}</div>
                      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{job.employerName}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>Applied {formatDate(app.appliedAt)}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{
                        background: meta.bg, color: meta.color,
                        border: `1px solid ${meta.color}33`,
                        borderRadius: 6, padding: '3px 9px',
                        fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                        letterSpacing: 0.2,
                      }}>{meta.label}</span>
                      <ChevronIcon down={isExp} />
                    </div>
                  </div>

                  {/* Progress bar */}
                  {app.currentStage !== 'Rejected' && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>Progress</span>
                        <span style={{ fontSize: 11, color: meta.color, fontWeight: 700 }}>{pct}%</span>
                      </div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {STAGES.map((s, i) => (
                          <div key={s} style={{
                            flex: 1, height: 4, borderRadius: 99,
                            background: i <= stageIdx ? meta.color : '#F1F2EE',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                        {STAGES.map((s, i) => (
                          <span key={s} style={{
                            fontSize: 9, fontWeight: i <= stageIdx ? 700 : 400,
                            color: i <= stageIdx ? meta.color : '#9CA3AF',
                          }}>
                            {s === 'Interviewed' ? 'Interview' : s === 'Screening' ? 'Screen' : s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded details */}
                {isExp && (
                  <div style={{ borderTop: '1px solid #F1F2EE', padding: 16 }}>

                    {/* Interview scheduled */}
                    {app.currentStage === 'Interviewed' && app.interviewAt && (
                      <div style={{
                        background: '#EFF6FF', borderRadius: 12, padding: '12px 14px',
                        marginBottom: 14, border: '1px solid #BFDBFE',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                      }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: 14, marginBottom: 2 }}>Interview Scheduled</div>
                          <div style={{ fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>
                            {new Date(app.interviewAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </div>
                          {app.interviewLocation && <div style={{ fontSize: 12, color: '#93C5FD', marginTop: 2 }}>{app.interviewLocation}</div>}
                        </div>
                      </div>
                    )}

                    {/* Offer card */}
                    {app.currentStage === 'Offer' && (
                      <div style={{
                        background: 'linear-gradient(135deg, #1B6B3A, #168448)',
                        borderRadius: 12, padding: '16px', marginBottom: 14, textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Offer Received</div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 26, color: '#fff' }}>
                          ₹{job.salary.min.toLocaleString()}–{job.salary.max.toLocaleString()}
                          <span style={{ fontWeight: 400, fontSize: 13, opacity: 0.7 }}>/mo</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{job.employerName}</div>
                      </div>
                    )}

                    {/* Joined */}
                    {app.currentStage === 'Joined' && (
                      <div style={{
                        background: '#ECFDF5', borderRadius: 12, padding: '14px 16px',
                        marginBottom: 14, border: '1px solid #A7F3D0', textAlign: 'center',
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: '#1B6B3A', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#1B6B3A' }}>Successfully Joined</div>
                        <div style={{ fontSize: 13, color: '#3D4E3F', marginTop: 4 }}>{job.employerName} · Confirmed</div>
                      </div>
                    )}

                    {/* Journey timeline */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Application Journey</div>
                      {STAGES.map((stage, i) => {
                        const done   = app.stages?.find(s => s.stage === stage);
                        const isAct  = stage === app.currentStage;
                        const isPast = stageIdx > i;
                        const sm     = STAGE_META[stage];
                        return (
                          <div key={stage} style={{ display: 'flex', gap: 12, paddingBottom: i < STAGES.length - 1 ? 4 : 0 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                              <div style={{
                                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                                background: done || isPast ? sm.color : isAct ? sm.color : '#E8EAE5',
                                border: isAct && !done ? `2px solid ${sm.color}` : 'none',
                                boxShadow: isAct ? `0 0 0 3px ${sm.color}22` : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {(done || isPast) && (
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </div>
                              {i < STAGES.length - 1 && (
                                <div style={{ width: 1, flex: 1, minHeight: 20, background: done || isPast ? sm.color : '#E8EAE5', margin: '3px 0' }} />
                              )}
                            </div>
                            <div style={{ paddingBottom: i < STAGES.length - 1 ? 12 : 0 }}>
                              <div style={{ fontSize: 13, fontWeight: done || isAct ? 700 : 500, color: isAct ? sm.color : (done || isPast) ? '#0D1B0F' : '#9CA3AF' }}>{sm.label}</div>
                              {done && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{formatDate(done.at)}</div>}
                              {isAct && !done && <div style={{ fontSize: 11, color: sm.color, marginTop: 1 }}>In progress…</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                      {captain && (
                        <a href={`https://wa.me/91${captain.mobile}`} target="_blank" rel="noopener noreferrer"
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            background: '#25D366', color: '#fff', borderRadius: 10, padding: '10px',
                            textDecoration: 'none', fontSize: 13, fontWeight: 700,
                          }}>
                          WhatsApp Captain
                        </a>
                      )}
                      <button onClick={() => navigate(`/jobs/${job.id}`)}
                        style={{
                          flex: 1, background: '#F2F4F0', color: '#0D1B0F',
                          border: 'none', borderRadius: 10, padding: '10px',
                          fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        }}>
                        View Job
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
