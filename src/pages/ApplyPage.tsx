import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getCaptain, getWorker, addApplication, hasApplied } from '../data/store';
import { useT } from '../i18n/useT';
import type { Application } from '../types';

/* ── tiny confetti burst on success ── */
function Confetti() {
  const dots = Array.from({ length: 18 }, (_, i) => i);
  const cols = ['#1B6B3A','#4ADE80','#fff','#A7F3D0','#168448','#FBBF24'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {dots.map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + Math.random() * 80}%`,
          top: '-20px',
          width: 8 + (i % 5) * 3,
          height: 8 + (i % 4) * 3,
          borderRadius: i % 3 === 0 ? '50%' : 3,
          background: cols[i % cols.length],
          animation: `fall ${1.2 + (i % 8) * 0.18}s ${(i % 6) * 0.1}s ease-in forwards`,
        }} />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(110vh) rotate(${Math.random() * 720}deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

/* ── animated question card ── */
function QuestionCard({
  q, children, step, total,
}: { q: string; children: React.ReactNode; step: number; total: number }) {
  return (
    <div style={{ animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform: translateY(24px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
      `}</style>
      {/* Question bubble */}
      <div style={{
        background: '#fff', borderRadius: '20px 20px 20px 4px',
        padding: '16px 20px', marginBottom: 20,
        boxShadow: '0 4px 24px rgba(27,107,58,0.12)',
        border: '1.5px solid #E8EAE5',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Question {step} of {total}
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, color: '#0D1B0F', lineHeight: 1.4 }}>{q}</div>
      </div>
      {children}
    </div>
  );
}

/* ── big tap option ── */
function TapOption({ label, sub, selected, onTap, accent = '#1B6B3A' }: {
  label: string; sub?: string; selected: boolean; onTap: () => void; accent?: string;
}) {
  return (
    <button onClick={onTap} style={{
      width: '100%', padding: 18, borderRadius: 16,
      background: selected ? `${accent}12` : '#F7F8F5',
      border: `2px solid ${selected ? accent : '#E8EAE5'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      textAlign: 'left', cursor: 'pointer', marginBottom: 10,
      transition: 'all 0.18s', transform: selected ? 'scale(1.01)' : 'scale(1)',
      boxShadow: selected ? `0 4px 16px ${accent}25` : 'none',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, color: selected ? accent : '#0D1B0F' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#8A9A8C', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        background: selected ? accent : '#E8EAE5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
      }}>
        {selected && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
    </button>
  );
}

export function ApplyPage() {
  const t = useT();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const job    = getJob(id!);
  const worker = getWorker();
  const captain = job ? getCaptain(job.captainId) : null;

  const [step,      setStep]      = useState(0);   // 0..N-1 = questions, N = confirm, N+1 = success
  const [hasExp,    setHasExp]    = useState<boolean | null>(null);
  const [available, setAvailable] = useState('');
  const [transport, setTransport] = useState('');
  const [note,      setNote]      = useState('');
  const [showConf,  setShowConf]  = useState(false);

  if (!job) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8F5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0D1B0F' }}>Job not found</div>
        <button onClick={() => navigate('/jobs')} style={{ marginTop: 12, background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>← Back to Jobs</button>
      </div>
    </div>
  );
  if (hasApplied(id!)) { navigate('/applications'); return null; }

  const totalQ = 3;
  const waMsg = encodeURIComponent(`Hello! My name is ${worker.name} (${worker.regNumber}).\nI applied for ${job.role} at ${job.employerName}. Please contact me. Thank you.`);

  const submit = () => {
    const app: Application = {
      id: `app_${Date.now()}`,
      workerId: worker.id,
      jobId: job.id,
      captainId: job.captainId,
      currentStage: 'Applied',
      stages: [{ stage: 'Applied', at: new Date().toISOString(), note: '' }],
      workerNote: note,
      appliedAt: new Date().toISOString(),
    };
    addApplication(app);
    setStep(totalQ + 1);
  };

  const canNext = [
    hasExp !== null,
    available !== '',
    transport !== '',
  ][step] ?? true;

  const initials = worker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const pct = step <= totalQ ? Math.round((step / (totalQ + 1)) * 100) : 100;

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F8F5' }}>
      {step === totalQ + 1 && <Confetti />}

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0F3D21 0%, #1B6B3A 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 48px) 16px 20px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          {step < totalQ + 1 && (
            <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)} style={{
              width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#fff', lineHeight: 1.1 }}>
              {step < totalQ ? `Quick Application` : step === totalQ ? t('apply.confirm') : t('apply.success')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
              {job.role} · {job.employerName}
            </div>
          </div>
          {step < totalQ + 1 && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              {step < totalQ ? `${step + 1}/${totalQ}` : ''}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {step < totalQ + 1 && (
          <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99, background: '#fff',
              width: `${pct}%`, transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        )}
      </div>

      <div style={{ padding: '24px 16px 120px' }}>

        {/* ── Q1: Experience ── */}
        {step === 0 && (
          <QuestionCard q={`Do you have experience as a ${job.role}?`} step={1} total={totalQ}>
            <TapOption label="Yes, I have experience" sub="1+ years working in this field" selected={hasExp === true}  onTap={() => setHasExp(true)} />
            <TapOption label="No, I'm a fresher" sub="Ready to learn and work hard" selected={hasExp === false} onTap={() => setHasExp(false)} />

            {hasExp !== null && (
              <div style={{ background: '#ECFDF5', borderRadius: 12, padding: '12px 16px', marginTop: 4, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'cardIn 0.3s ease both' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 13, color: '#1B6B3A', fontWeight: 600, lineHeight: 1.5 }}>
                  {hasExp
                    ? 'Experienced candidates get priority review — great choice!'
                    : 'No problem! Many freshers get hired here.'}
                </div>
              </div>
            )}
          </QuestionCard>
        )}

        {/* ── Q2: Availability ── */}
        {step === 1 && (
          <QuestionCard q="When can you start work?" step={2} total={totalQ}>
            {[
              { id: 'immediately', label: 'Immediately', sub: 'Ready to join today itself' },
              { id: '1week',       label: 'Within 1 Week', sub: 'Need a few days to wrap up' },
              { id: '1month',      label: 'Within 1 Month', sub: 'Need time to plan the move' },
            ].map((o, i) => (
              <TapOption key={o.id} label={o.label} sub={o.sub} selected={available === o.id} onTap={() => setAvailable(o.id)} />
            ))}
          </QuestionCard>
        )}

        {/* ── Q3: Commute ── */}
        {step === 2 && (
          <QuestionCard q="How will you commute to work?" step={3} total={totalQ}>
            {[
              { id: 'walk',  label: 'Walk', sub: `Around ${Math.round(Number(((Math.sqrt((job.lat - worker.lat)**2 + (job.lng - worker.lng)**2)) * 111).toFixed(1)) * 12)} min walk` },
              { id: 'bike',  label: 'Bike / Scooter', sub: 'Own vehicle' },
              { id: 'auto',  label: 'Auto / Taxi', sub: 'Shared or private' },
              { id: 'bus',   label: 'Bus / Metro', sub: 'Public transport' },
            ].map(o => (
              <TapOption key={o.id} label={o.label} sub={o.sub} selected={transport === o.id} onTap={() => setTransport(o.id)} />
            ))}
          </QuestionCard>
        )}

        {/* ── Confirm step ── */}
        {step === totalQ && (
          <div style={{ animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
            {/* Profile snippet */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1.5px solid #E8EAE5', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff', flexShrink: 0 }}>{initials}</div>
                <div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: '#0D1B0F' }}>{worker.name}</div>
                  <div style={{ fontSize: 11, color: '#8A9A8C', letterSpacing: 1, fontFamily: 'monospace' }}>{worker.regNumber}</div>
                </div>
                {worker.isVerified && (
                  <div style={{ marginLeft: 'auto', background: '#ECFDF5', color: '#1B6B3A', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, letterSpacing: 0.3 }}>VERIFIED</div>
                )}
              </div>

              {/* Summary rows */}
              {[
                { l: 'Experience', v: hasExp ? 'Has experience' : 'Fresher' },
                { l: 'Start date',  v: available === 'immediately' ? 'Immediately' : available === '1week' ? 'Within 1 week' : 'Within 1 month' },
                { l: 'Commute',    v: transport === 'walk' ? 'Walk' : transport === 'bike' ? 'Bike / Scooter' : transport === 'auto' ? 'Auto / Taxi' : 'Bus / Metro' },
              ].map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F1F2EE' }}>
                  <span style={{ fontSize: 13, color: '#8A9A8C' }}>{row.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0D1B0F' }}>{row.v}</span>
                </div>
              ))}
            </div>

            {/* Optional note */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3D4E3F', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Note to Captain <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
              </div>
              <textarea
                placeholder="{t('apply.notePlaceholder')}…"
                rows={3}
                maxLength={120}
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%', borderRadius: 12, border: '1.5px solid #E8EAE5',
                  padding: '12px 14px', fontSize: 14, background: '#F7F8F5', outline: 'none',
                  color: '#0D1B0F', resize: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#1B6B3A'}
                onBlur={e => e.target.style.borderColor = '#E8EAE5'}
              />
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 }}>{note.length}/120</div>
            </div>

            {/* Job being applied to */}
            <div style={{ background: '#ECFDF5', borderRadius: 14, padding: '14px 16px', border: '1px solid #A7F3D0', marginBottom: 4 }}>
              <div style={{ fontSize: 11, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Applying for</div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>{job.role}</div>
              <div style={{ fontSize: 13, color: '#3D4E3F' }}>{job.employerName} · {job.location}</div>
            </div>
          </div>
        )}

        {/* ── Success ── */}
        {step === totalQ + 1 && (
          <div style={{ textAlign: 'center', paddingTop: 20, animation: 'cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
            {/* Big checkmark */}
            <div style={{
              width: 96, height: 96, borderRadius: 30, background: '#1B6B3A',
              margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(27,107,58,0.35)',
              animation: 'scaleIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 28, color: '#0D1B0F', letterSpacing: -0.5, marginBottom: 8 }}>
              Application Sent!
            </div>
            <div style={{ fontSize: 15, color: '#3D4E3F', marginBottom: 28, lineHeight: 1.6 }}>
              {captain
                ? <>Captain <strong>{captain.name}</strong> will review your application and contact you on WhatsApp.</>
                : 'Your application has been submitted successfully.'
              }
            </div>

            {/* Job summary card */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #E8EAE5', marginBottom: 20, textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>{job.role}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{job.employerName}</div>
              <div style={{ marginTop: 10, padding: '8px 0 0', borderTop: '1px solid #F1F2EE', fontSize: 12, color: '#8A9A8C' }}>
                Applied just now · Status: <span style={{ color: '#1B6B3A', fontWeight: 700 }}>Under Review</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {captain && (
                <a href={`https://wa.me/91${captain.mobile}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: '#25D366', color: '#fff', textDecoration: 'none',
                  borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700,
                  boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382a1 1 0 00-1.447-.143c-.404.342-.834.682-1.267.892-.434.21-.84.168-1.34-.168A11.13 11.13 0 0111.6 13.6a11.05 11.05 0 01-1.342-1.818c-.335-.5-.377-.907-.168-1.34.21-.434.55-.864.892-1.267a1 1 0 00-.143-1.447l-2.3-2.3a1 1 0 00-1.361.04C5.916 6.63 5 8.14 5 9.756c0 4.84 3.945 8.9 8.86 9.043 1.65.048 3.24-.897 4.297-2.09a1 1 0 00.04-1.362l-2.3-2.3z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                  WhatsApp Captain
                </a>
              )}
              <button onClick={() => navigate('/applications')} style={{ background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,107,58,0.25)' }}>
                Track Application Status
              </button>
              <button onClick={() => navigate('/jobs')} style={{ background: '#F7F8F5', color: '#3D4E3F', border: 'none', borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Browse More Jobs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom CTA ── */}
      {step < totalQ + 1 && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          background: '#fff', borderTop: '1px solid #E8EAE5',
          padding: '16px 20px calc(16px + env(safe-area-inset-bottom, 0px))',
          zIndex: 100,
        }}>
          <button
            onClick={() => {
              if (step < totalQ) setStep(s => s + 1);
              else submit();
            }}
            disabled={!canNext}
            style={{
              width: '100%', height: 52, borderRadius: 14,
              background: canNext ? '#1B6B3A' : '#E8EAE5',
              color: canNext ? '#fff' : '#9CA3AF',
              border: 'none', fontSize: 15, fontWeight: 700,
              cursor: canNext ? 'pointer' : 'default',
              transition: 'all 0.2s',
              boxShadow: canNext ? '0 4px 16px rgba(27,107,58,0.3)' : 'none',
            }}>
            {step < totalQ ? t('common.continue') : t('apply.submit')}
          </button>
        </div>
      )}
    </div>
  );
}
