import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { getMyApplications, getJob, getCaptain, getWorker, formatSalary } from '../data/store';
import { useLang } from '../i18n/useT';
import type { AppStage } from '../types';

const STAGES: AppStage[] = ['Applied', 'Screening', 'Interviewed', 'Offer', 'Joined'];

const STAGE_META: Record<string, { label: string; labelHi: string; color: string; bg: string; icon: string }> = {
  Applied:     { label: 'Applied',     labelHi: 'आवेदन किया',  color: '#1B6B3A', bg: '#ECFDF5', icon: '📋' },
  Screening:   { label: 'Screening',   labelHi: 'Screening',   color: '#1D4ED8', bg: '#EFF6FF', icon: '🔍' },
  Interviewed: { label: 'Interviewed', labelHi: 'Interview',   color: '#6D28D9', bg: '#F5F3FF', icon: '🎯' },
  Offer:       { label: 'Offer!',      labelHi: 'Offer मिला!', color: '#B45309', bg: '#FFFBEB', icon: '🤝' },
  Joined:      { label: 'Joined',      labelHi: 'जॉइन किया',  color: '#1B6B3A', bg: '#ECFDF5', icon: '✅' },
  Rejected:    { label: 'Not Selected',labelHi: 'Select नहीं', color: '#B91C1C', bg: '#FEF2F2', icon: '❌' },
};

// Tips shown when stage is active — helps worker know what to do next
const STAGE_TIPS: Record<string, { hi: string; en: string }> = {
  Screening:   { hi: 'Captain जल्द ही call कर सकते हैं। Phone on रखें।', en: 'Captain may call soon. Keep your phone on.' },
  Interviewed: { hi: 'Interview के लिए clean clothes पहनें, समय पर जाएं।', en: 'Wear clean clothes, arrive on time for interview.' },
  Offer:       { hi: '🎉 बधाई! Offer confirm करने के लिए Captain को WhatsApp करें।', en: '🎉 Congratulations! WhatsApp your captain to confirm the offer.' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'आज';
  if (days === 1) return 'कल';
  return `${days} दिन पहले`;
}

function ChevronIcon({ down }: { down: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{ transform: down ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', color: '#9CA3AF' }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

export function ApplicationsPage() {
  const apps     = getMyApplications();
  const worker   = getWorker();
  const navigate = useNavigate();
  const { lang } = useLang();
  const isHindi  = lang === 'hi';
  const [expanded, setExpanded] = useState<string | null>(apps[0]?.id || null);
  const [tab, setTab] = useState('all');

  const activeCount  = apps.filter(a => !['Joined','Rejected'].includes(a.currentStage)).length;
  const joinedCount  = apps.filter(a => a.currentStage === 'Joined').length;
  const offeredCount = apps.filter(a => a.currentStage === 'Offer').length;

  // Total salary if all offers accepted
  const offerJobs = apps
    .filter(a => a.currentStage === 'Offer' || a.currentStage === 'Joined')
    .map(a => getJob(a.jobId))
    .filter(Boolean);
  const topSalary = offerJobs.length
    ? Math.max(...offerJobs.map(j => j!.salary.max))
    : 0;

  const TABS = [
    { id: 'all',      label: isHindi ? 'सभी' : 'All' },
    { id: 'active',   label: isHindi ? 'Active' : 'Active' },
    { id: 'joined',   label: isHindi ? 'Joined' : 'Joined' },
    { id: 'rejected', label: isHindi ? 'Others' : 'Others' },
  ];

  const filtered = apps.filter(a => {
    if (tab === 'active')   return !['Joined','Rejected'].includes(a.currentStage);
    if (tab === 'joined')   return a.currentStage === 'Joined';
    if (tab === 'rejected') return a.currentStage === 'Rejected';
    return true;
  });

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)', background: '#F5F6F2', minHeight: '100dvh' }}>

      {/* ── Sticky Header ── */}
      <div style={{
        background: 'linear-gradient(150deg, #0B2E18 0%, #1B6B3A 55%, #1F7A42 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 48px) 16px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <button onClick={() => navigate(-1)} style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff' }}>
              {isHindi ? 'मेरे आवेदन' : 'My Applications'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
              {activeCount} {isHindi ? 'active' : 'active'} · {apps.length} {isHindi ? 'कुल' : 'total'}
            </div>
          </div>
          <Link to="/jobs" style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: '#fff', fontSize: 20, lineHeight: 1,
          }}>+</Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          {[
            { v: apps.length,  l: isHindi ? 'आवेदन' : 'Applied' },
            { v: activeCount,  l: isHindi ? 'Active' : 'Active' },
            { v: offeredCount, l: isHindi ? 'Offer' : 'Offers' },
            { v: topSalary ? `₹${Math.round(topSalary / 1000)}k` : joinedCount,
              l: topSalary ? (isHindi ? 'Top Salary' : 'Top Pay') : (isHindi ? 'Joined' : 'Joined') },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', padding: '10px 0',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none',
            }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 19, color: '#fff' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.15)' }}>
          {TABS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              flex: 1, padding: '11px 0',
              background: 'transparent', border: 'none',
              color: tab === item.id ? '#fff' : 'rgba(255,255,255,0.45)',
              fontWeight: tab === item.id ? 700 : 500, fontSize: 13, cursor: 'pointer',
              borderBottom: tab === item.id ? '2px solid #fff' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>{item.label}</button>
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      <div style={{ padding: '16px 16px 0' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ECFDF5', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              📋
            </div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, color: '#0D1B0F', marginBottom: 8 }}>
              {isHindi ? 'अभी कोई आवेदन नहीं' : 'No applications yet'}
            </div>
            <div style={{ fontSize: 14, color: '#8A9A8C', marginBottom: 20 }}>
              {isHindi ? 'नौकरी ढूंढें और अप्लाई करें' : 'Browse jobs and apply to get started'}
            </div>
            <Link to="/jobs" style={{ display: 'inline-block', background: '#1B6B3A', color: '#fff', padding: '12px 24px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
              {isHindi ? 'नौकरियाँ देखें' : 'Browse Jobs'}
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
            const tip = STAGE_TIPS[app.currentStage];
            const lastStage = app.stages?.[app.stages.length - 1];
            if (!job) return null;

            const waMsg = encodeURIComponent(
              captain
                ? `नमस्कार ${captain.name} जी! मैं ${worker.name} (${worker.regNumber}) हूँ। मैंने "${job.role}" (${job.employerName}) के लिए ${formatDate(app.appliedAt)} को आवेदन किया था। Status update मिलेगा क्या? 🙏`
                : `नमस्कार! "${job.role}" आवेदन के बारे में update चाहिए था। -${worker.name}`
            );
            const waHref = captain
              ? `https://wa.me/91${captain.mobile}?text=${waMsg}`
              : `https://wa.me/?text=${waMsg}`;

            return (
              <div key={app.id} style={{
                background: '#fff', borderRadius: 16,
                border: '1px solid #E8EAE6', marginBottom: 12, overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                animation: 'slideUp 0.3s ease both',
              }}>
                {/* Top accent */}
                <div style={{ height: 4, background: meta.color }} />

                {/* Card header — tap to expand */}
                <div onClick={() => setExpanded(isExp ? null : app.id)} style={{ padding: '14px 16px 12px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                    {/* Stage icon */}
                    <div style={{
                      width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                      background: meta.bg, border: `1px solid ${meta.color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20,
                    }}>
                      {meta.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* SALARY — prominent on card */}
                      <div style={{ marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 18, color: '#0D1B0F' }}>
                          {formatSalary(job.salary.min, job.salary.max)}
                        </span>
                        <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>/माह</span>
                      </div>
                      <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14, color: '#111827', lineHeight: 1.2 }}>
                        {job.role}
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{job.employerName}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                        {isHindi ? 'Applied' : 'Applied'} {formatDate(app.appliedAt)}
                        {lastStage && ` · ${isHindi ? 'Updated' : 'Updated'} ${timeAgo(lastStage.at)}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        background: meta.bg, color: meta.color,
                        border: `1px solid ${meta.color}33`,
                        borderRadius: 8, padding: '4px 10px',
                        fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        {isHindi ? meta.labelHi : meta.label}
                      </span>
                      <ChevronIcon down={isExp} />
                    </div>
                  </div>

                  {/* Stage progress dots */}
                  {app.currentStage !== 'Rejected' && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                        {STAGES.map((s, i) => (
                          <div key={s} style={{
                            flex: 1, height: 5, borderRadius: 99,
                            background: i <= stageIdx ? meta.color : '#EAECE7',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
                  <div style={{ borderTop: '1px solid #F0F1ED', padding: 16 }}>

                    {/* Tip banner based on stage */}
                    {tip && (
                      <div style={{
                        background: meta.bg, borderRadius: 10, padding: '10px 14px',
                        marginBottom: 14, border: `1px solid ${meta.color}22`,
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                        <div style={{ fontSize: 12, color: meta.color, fontWeight: 600, lineHeight: 1.5 }}>
                          {isHindi ? tip.hi : tip.en}
                        </div>
                      </div>
                    )}

                    {/* Interview card */}
                    {app.currentStage === 'Interviewed' && app.interviewAt && (
                      <div style={{
                        background: '#EFF6FF', borderRadius: 12, padding: '12px 14px',
                        marginBottom: 14, border: '1px solid #BFDBFE',
                        display: 'flex', gap: 12, alignItems: 'center',
                      }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                          📅
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: 13 }}>
                            {new Date(app.interviewAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </div>
                          {app.interviewLocation && (
                            <div style={{ fontSize: 12, color: '#3B82F6', marginTop: 2 }}>📍 {app.interviewLocation}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Offer card — salary hero */}
                    {app.currentStage === 'Offer' && (
                      <div style={{
                        background: 'linear-gradient(135deg, #0B2E18 0%, #1B6B3A 100%)',
                        borderRadius: 14, padding: '18px 20px', marginBottom: 14, textAlign: 'center',
                        boxShadow: '0 6px 24px rgba(27,107,58,0.25)',
                      }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                          🎉 {isHindi ? 'Offer मिला है!' : 'Offer Received!'}
                        </div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 30, color: '#fff', letterSpacing: -0.5 }}>
                          {formatSalary(job.salary.min, job.salary.max)}
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>/माह · {job.employerName}</div>
                        {(job.food || job.accommodation) && (
                          <div style={{ marginTop: 8, fontSize: 12, color: '#A7F3D0', fontWeight: 600 }}>
                            +{[job.food && 'खाना', job.accommodation && 'रहना'].filter(Boolean).join(' + ')} FREE
                          </div>
                        )}
                      </div>
                    )}

                    {/* Joined */}
                    {app.currentStage === 'Joined' && (
                      <div style={{
                        background: '#ECFDF5', borderRadius: 12, padding: '14px 16px',
                        marginBottom: 14, border: '1px solid #A7F3D0', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
                        <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#1B6B3A' }}>
                          {isHindi ? 'नौकरी मिली! बधाई हो' : 'Successfully Joined!'}
                        </div>
                        <div style={{ fontSize: 13, color: '#3D4E3F', marginTop: 4 }}>
                          {job.employerName} · {formatSalary(job.salary.min, job.salary.max)}/माह
                        </div>
                      </div>
                    )}

                    {/* Journey timeline */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 11, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                        {isHindi ? 'यात्रा' : 'Journey'}
                      </div>
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
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                )}
                              </div>
                              {i < STAGES.length - 1 && (
                                <div style={{ width: 1, flex: 1, minHeight: 18, background: done || isPast ? sm.color : '#E8EAE5', margin: '3px 0' }} />
                              )}
                            </div>
                            <div style={{ paddingBottom: i < STAGES.length - 1 ? 12 : 0 }}>
                              <div style={{ fontSize: 13, fontWeight: done || isAct ? 700 : 500, color: isAct ? sm.color : (done || isPast) ? '#0D1B0F' : '#9CA3AF' }}>
                                {isHindi ? sm.labelHi : sm.label}
                              </div>
                              {done && done.note && (
                                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1, fontStyle: 'italic' }}>{done.note}</div>
                              )}
                              {done && <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{formatDate(done.at)}</div>}
                              {isAct && !done && (
                                <div style={{ fontSize: 11, color: sm.color, marginTop: 1, fontWeight: 600 }}>
                                  {isHindi ? '● अभी यहाँ हो' : '● In progress'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {captain && (
                        <a href={waHref} target="_blank" rel="noopener noreferrer" style={{
                          flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          background: '#25D366', color: '#fff', borderRadius: 10, padding: '11px',
                          textDecoration: 'none', fontSize: 13, fontWeight: 700,
                          boxShadow: '0 3px 12px rgba(37,211,102,0.25)',
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M12.016 0C5.396 0 .016 5.38.016 12c0 2.126.558 4.122 1.528 5.854L.005 24l6.335-1.653A11.963 11.963 0 0012.016 24C18.636 24 24 18.62 24 12S18.636 0 12.016 0zm0 21.818c-1.96 0-3.784-.528-5.354-1.44l-.385-.228-3.977 1.038 1.058-3.863-.25-.4A9.797 9.797 0 012.2 12c0-5.412 4.404-9.818 9.816-9.818 5.412 0 9.818 4.406 9.818 9.818 0 5.412-4.406 9.818-9.818 9.818z"/>
                          </svg>
                          {isHindi ? 'Captain को WhatsApp' : 'WhatsApp Captain'}
                        </a>
                      )}
                      <button onClick={() => navigate(`/jobs/${job.id}`)} style={{
                        flex: 1, background: '#F2F4F0', color: '#0D1B0F',
                        border: 'none', borderRadius: 10, padding: '11px',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      }}>
                        {isHindi ? 'Job देखें' : 'View Job'}
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
