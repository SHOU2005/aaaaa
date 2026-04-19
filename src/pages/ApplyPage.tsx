import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getCaptain, getWorker, addApplication, hasApplied } from '../data/store';
import { useLang } from '../i18n/useT';
import type { Application } from '../types';

function Confetti() {
  const dots = Array.from({ length: 18 }, (_, i) => i);
  const cols = ['#1B6B3A','#4ADE80','#fff','#A7F3D0','#168448','#FBBF24'];
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {dots.map(i => (
        <div key={i} style={{
          position: 'absolute',
          left: `${10 + (i * 4.7) % 80}%`,
          top: '-20px',
          width: 8 + (i % 5) * 3,
          height: 8 + (i % 4) * 3,
          borderRadius: i % 3 === 0 ? '50%' : 3,
          background: cols[i % cols.length],
          animation: `fall ${1.2 + (i % 8) * 0.18}s ${(i % 6) * 0.1}s ease-in forwards`,
        }} />
      ))}
      <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(540deg); opacity: 0.2; } }`}</style>
    </div>
  );
}

function QuestionCard({ q, sub, step, total, children }: {
  q: string; sub?: string; step: number; total: number; children: React.ReactNode;
}) {
  return (
    <div style={{ animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 20px 4px',
        padding: '16px 20px', marginBottom: 16,
        boxShadow: '0 4px 24px rgba(27,107,58,0.10)',
        border: '1.5px solid #E8EAE5',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          {step} / {total}
        </div>
        <div style={{ fontWeight: 700, fontSize: 17, color: '#0D1B0F', lineHeight: 1.4 }}>{q}</div>
        {sub && <div style={{ fontSize: 12, color: '#8A9A8C', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function TapOption({ label, sub, selected, onTap, accent = '#1B6B3A' }: {
  label: string; sub?: string; selected: boolean; onTap: () => void; accent?: string;
}) {
  return (
    <button onClick={onTap} style={{
      width: '100%', padding: '15px 18px', borderRadius: 14,
      background: selected ? `${accent}12` : '#F7F8F5',
      border: `2px solid ${selected ? accent : '#E8EAE5'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      textAlign: 'left', cursor: 'pointer', marginBottom: 9,
      transition: 'all 0.18s', transform: selected ? 'scale(1.01)' : 'scale(1)',
      boxShadow: selected ? `0 4px 14px ${accent}22` : 'none',
    }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14, color: selected ? accent : '#0D1B0F' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: '#8A9A8C', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: selected ? accent : '#E8EAE5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.18s',
      }}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </div>
    </button>
  );
}

const TOTAL_Q = 7;

export function ApplyPage() {
  const { lang } = useLang();
  const hi = lang === 'hi';

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const job    = getJob(id!);
  const worker = getWorker();
  const captain = job ? getCaptain(job.captainId) : null;

  const [step,        setStep]        = useState(0);
  const [hasExp,      setHasExp]      = useState<boolean | null>(null);
  const [available,   setAvailable]   = useState('');
  const [transport,   setTransport]   = useState('');
  const [ageRange,    setAgeRange]    = useState('');
  const [currentArea, setCurrentArea] = useState(worker.sector ?? '');
  const [hasGovtId,   setHasGovtId]   = useState<boolean | null>(null);
  const [shiftPref,   setShiftPref]   = useState('');
  const [note,        setNote]        = useState('');
  const [areaFocus,   setAreaFocus]   = useState(false);

  if (!job) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8F5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0D1B0F' }}>{hi ? 'Job नहीं मिली' : 'Job not found'}</div>
        <button onClick={() => navigate('/jobs')} style={{ marginTop: 12, background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
          ← {hi ? 'Jobs पर जाएं' : 'Back to Jobs'}
        </button>
      </div>
    </div>
  );
  if (hasApplied(id!) && step !== TOTAL_Q + 1) { navigate('/applications'); return null; }

  const waMsg = hi
    ? encodeURIComponent(`नमस्ते! मेरा नाम ${worker.name} है (${worker.regNumber}).\nमैंने ${job.role} की पोस्ट पर Apply किया है — ${job.employerName}। कृपया मुझसे संपर्क करें।`)
    : encodeURIComponent(`Hello! My name is ${worker.name} (${worker.regNumber}).\nI applied for ${job.role} at ${job.employerName}. Please contact me. Thank you.`);

  const submit = () => {
    const allAnswers = [
      `Exp: ${hasExp ? 'Yes' : 'Fresher'}`,
      `Start: ${available}`,
      `Commute: ${transport}`,
      `Age: ${ageRange}`,
      `Area: ${currentArea}`,
      `GovtID: ${hasGovtId ? 'Yes' : 'No'}`,
      `Shift: ${shiftPref}`,
      note ? `Note: ${note}` : '',
    ].filter(Boolean).join(' | ');

    const app: Application = {
      id: `app_${Date.now()}`,
      workerId: worker.id,
      jobId: job.id,
      captainId: job.captainId,
      currentStage: 'Applied',
      stages: [{ stage: 'Applied', at: new Date().toISOString(), note: '' }],
      workerNote: allAnswers,
      appliedAt: new Date().toISOString(),
    };
    addApplication(app);
    setStep(TOTAL_Q + 1);
  };

  const canNext = [
    hasExp !== null,
    available !== '',
    transport !== '',
    ageRange !== '',
    currentArea.trim().length >= 2,
    hasGovtId !== null,
    shiftPref !== '',
    true,
  ][step] ?? true;

  const initials = worker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const pct = step <= TOTAL_Q ? Math.round((step / (TOTAL_Q + 1)) * 100) : 100;

  const startLabel = { immediately: hi ? 'तुरंत' : 'Immediately', '1week': hi ? '1 हफ्ते में' : 'Within 1 week', '1month': hi ? '1 महीने में' : 'Within 1 month' }[available] ?? available;
  const commuteLabel = { walk: hi ? 'पैदल' : 'Walk', bike: hi ? 'बाइक / स्कूटर' : 'Bike / Scooter', auto: hi ? 'Auto / Taxi' : 'Auto / Taxi', bus: hi ? 'Bus / Metro' : 'Bus / Metro' }[transport] ?? transport;
  const shiftLabel = { morning: hi ? 'सुबह (6am–2pm)' : 'Morning (6am–2pm)', afternoon: hi ? 'दोपहर (2pm–10pm)' : 'Afternoon (2pm–10pm)', night: hi ? 'रात (10pm–6am)' : 'Night (10pm–6am)', any: hi ? 'कोई भी Shift' : 'Any shift' }[shiftPref] ?? shiftPref;

  const summaryRows = [
    { l: hi ? 'अनुभव' : 'Experience',     v: hasExp ? (hi ? 'अनुभव है' : 'Experienced') : (hi ? 'Fresher हूँ' : 'Fresher') },
    { l: hi ? 'Join कब' : 'Start date',    v: startLabel },
    { l: hi ? 'आना-जाना' : 'Commute',      v: commuteLabel },
    { l: hi ? 'उम्र' : 'Age',              v: ageRange },
    { l: hi ? 'रहने का इलाका' : 'Area',   v: currentArea },
    { l: hi ? 'Govt. ID' : 'Govt. ID',     v: hasGovtId ? (hi ? 'है' : 'Yes') : (hi ? 'नहीं है' : 'No') },
    { l: hi ? 'Shift पसंद' : 'Shift',      v: shiftLabel },
  ];

  return (
    <div style={{ minHeight: '100dvh', background: '#F7F8F5' }}>
      {step === TOTAL_Q + 1 && <Confetti />}

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, #0F3D21 0%, #1B6B3A 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 18px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {step < TOTAL_Q + 1 && (
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
              {step < TOTAL_Q
                ? (hi ? 'आवेदन फॉर्म' : 'Quick Application')
                : step === TOTAL_Q
                  ? (hi ? 'जाँचें और भेजें' : 'Review & Submit')
                  : (hi ? 'आवेदन हो गया!' : 'Applied!')}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
              {job.role} · {job.employerName}
            </div>
          </div>
          {step < TOTAL_Q && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              {step + 1}/{TOTAL_Q}
            </div>
          )}
        </div>
        {step < TOTAL_Q + 1 && (
          <div style={{ height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99, background: '#4ADE80',
              width: `${pct}%`, transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
            }} />
          </div>
        )}
      </div>

      <div style={{ padding: '20px 16px 120px' }}>

        {/* Q1 — Experience */}
        {step === 0 && (
          <QuestionCard
            q={hi ? `क्या आपके पास ${job.role} का काम का अनुभव है?` : `Do you have experience as a ${job.role}?`}
            sub={hi ? 'सच बताएं — Freshers को भी मौका मिलता है!' : 'Be honest — freshers are welcome too!'}
            step={1} total={TOTAL_Q}
          >
            <TapOption label={hi ? 'हाँ, मुझे अनुभव है' : 'Yes, I have experience'} sub={hi ? '1+ साल इस काम में' : '1+ years in this field'} selected={hasExp === true}  onTap={() => setHasExp(true)} />
            <TapOption label={hi ? 'नहीं, मैं Fresher हूँ' : "No, I'm a fresher"} sub={hi ? 'मैं सीखने के लिए तैयार हूँ' : 'Ready to learn and work hard'} selected={hasExp === false} onTap={() => setHasExp(false)} />
            {hasExp !== null && (
              <div style={{ background: '#ECFDF5', borderRadius: 12, padding: '12px 16px', marginTop: 4, display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'cardIn 0.3s ease both' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 13, color: '#1B6B3A', fontWeight: 600, lineHeight: 1.5 }}>
                  {hasExp
                    ? (hi ? 'अनुभवी candidates को priority मिलती है — बढ़िया!' : 'Experienced candidates get priority — great!')
                    : (hi ? 'कोई बात नहीं! यहाँ कई Freshers को job मिली है।' : 'No problem! Many freshers get hired here.')}
                </div>
              </div>
            )}
          </QuestionCard>
        )}

        {/* Q2 — Start date */}
        {step === 1 && (
          <QuestionCard
            q={hi ? 'आप काम कब से शुरू कर सकते हैं?' : 'When can you start work?'}
            step={2} total={TOTAL_Q}
          >
            {[
              { id: 'immediately', label: hi ? 'तुरंत / आज से' : 'Immediately',     sub: hi ? 'आज ही join करने के लिए तैयार हूँ' : 'Ready to join today itself' },
              { id: '1week',       label: hi ? '1 हफ्ते में' : 'Within 1 Week',      sub: hi ? 'थोड़ा समय चाहिए' : 'Need a few days to wrap up' },
              { id: '1month',      label: hi ? '1 महीने में' : 'Within 1 Month',     sub: hi ? 'Notice period में हूँ' : 'Currently serving notice period' },
            ].map(o => (
              <TapOption key={o.id} label={o.label} sub={o.sub} selected={available === o.id} onTap={() => setAvailable(o.id)} />
            ))}
          </QuestionCard>
        )}

        {/* Q3 — Commute */}
        {step === 2 && (
          <QuestionCard
            q={hi ? 'आप काम पर कैसे पहुँचेंगे?' : 'How will you commute to work?'}
            step={3} total={TOTAL_Q}
          >
            {[
              { id: 'walk', label: hi ? 'पैदल चलकर' : 'Walk', sub: hi ? 'घर के पास है' : 'Close to home' },
              { id: 'bike', label: hi ? 'बाइक / स्कूटर' : 'Bike / Scooter', sub: hi ? 'खुद की गाड़ी है' : 'Own vehicle' },
              { id: 'auto', label: hi ? 'Auto / Taxi' : 'Auto / Taxi', sub: hi ? 'किराए की गाड़ी' : 'Shared or private ride' },
              { id: 'bus',  label: hi ? 'Bus / Metro' : 'Bus / Metro', sub: hi ? 'सार्वजनिक यातायात' : 'Public transport' },
            ].map(o => (
              <TapOption key={o.id} label={o.label} sub={o.sub} selected={transport === o.id} onTap={() => setTransport(o.id)} />
            ))}
          </QuestionCard>
        )}

        {/* Q4 — Age */}
        {step === 3 && (
          <QuestionCard
            q={hi ? 'आपकी उम्र कितनी है?' : 'What is your age?'}
            sub={hi ? 'सही उम्र बताएं — इससे सही Job Match होती है' : 'This helps us match you with the right job'}
            step={4} total={TOTAL_Q}
          >
            {[
              { id: '18–25', label: hi ? '18–25 साल' : '18–25 years' },
              { id: '26–35', label: hi ? '26–35 साल' : '26–35 years' },
              { id: '36–45', label: hi ? '36–45 साल' : '36–45 years' },
              { id: '45+',   label: hi ? '45+ साल'   : '45+ years'   },
            ].map(o => (
              <TapOption key={o.id} label={o.label} selected={ageRange === o.id} onTap={() => setAgeRange(o.id)} />
            ))}
          </QuestionCard>
        )}

        {/* Q5 — Current area */}
        {step === 4 && (
          <QuestionCard
            q={hi ? 'आप अभी कहाँ रहते हैं?' : 'Where do you currently live?'}
            sub={hi ? 'Sector, Mohalla, या Colony लिखें' : 'Write your Sector, Colony, or Area name'}
            step={5} total={TOTAL_Q}
          >
            <input
              type="text"
              value={currentArea}
              onChange={e => setCurrentArea(e.target.value)}
              onFocus={() => setAreaFocus(true)}
              onBlur={() => setAreaFocus(false)}
              placeholder={hi ? 'जैसे: Sector 29, Gurgaon' : 'e.g. Sector 29, Gurgaon'}
              style={{
                width: '100%', height: 52, padding: '0 16px',
                border: `2px solid ${areaFocus ? '#1B6B3A' : '#E8EAE5'}`,
                borderRadius: 14, background: '#fff', fontSize: 15, fontWeight: 500,
                color: '#0D1B0F', outline: 'none', fontFamily: 'DM Sans',
                transition: 'border-color 0.15s',
              }}
            />
            {currentArea.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#8A9A8C' }}>
                {hi ? `"${currentArea}" — यह सही है?` : `"${currentArea}" — is this correct?`}
              </div>
            )}
          </QuestionCard>
        )}

        {/* Q6 — Govt ID */}
        {step === 5 && (
          <QuestionCard
            q={hi ? 'क्या आपके पास कोई Government ID है?' : 'Do you have a valid Government ID?'}
            sub={hi ? 'Aadhaar / PAN / Voter ID / Driving Licence' : 'Aadhaar / PAN / Voter ID / Driving Licence'}
            step={6} total={TOTAL_Q}
          >
            <TapOption label={hi ? 'हाँ, मेरे पास है' : 'Yes, I have one'} sub={hi ? 'Aadhaar / PAN / Voter ID है' : 'Aadhaar, PAN, or Voter ID available'} selected={hasGovtId === true}  onTap={() => setHasGovtId(true)} />
            <TapOption label={hi ? 'अभी नहीं है' : 'No, not yet'} sub={hi ? 'जल्द बनवा लूँगा' : 'Will arrange it soon'} selected={hasGovtId === false} onTap={() => setHasGovtId(false)} />
            {hasGovtId === false && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 12, padding: '12px 16px', marginTop: 4, fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                {hi ? 'Aadhaar Card जल्दी बनवाएं — Job join करते समय ज़रूरी होता है।' : 'Get your Aadhaar Card soon — it is required when you join.'}
              </div>
            )}
          </QuestionCard>
        )}

        {/* Q7 — Shift */}
        {step === 6 && (
          <QuestionCard
            q={hi ? 'आप कौन सी Shift में काम कर सकते हैं?' : 'Which shift can you work?'}
            step={7} total={TOTAL_Q}
          >
            {[
              { id: 'morning',   label: hi ? 'सुबह की Shift'   : 'Morning Shift',   sub: '6:00 AM – 2:00 PM' },
              { id: 'afternoon', label: hi ? 'दोपहर की Shift'  : 'Afternoon Shift', sub: '2:00 PM – 10:00 PM' },
              { id: 'night',     label: hi ? 'रात की Shift'    : 'Night Shift',     sub: '10:00 PM – 6:00 AM' },
              { id: 'any',       label: hi ? 'कोई भी Shift'    : 'Any Shift',       sub: hi ? 'मुझे कोई भी चलेगी' : 'Flexible with any schedule' },
            ].map(o => (
              <TapOption key={o.id} label={o.label} sub={o.sub} selected={shiftPref === o.id} onTap={() => setShiftPref(o.id)} />
            ))}
          </QuestionCard>
        )}

        {/* Confirm step */}
        {step === TOTAL_Q && (
          <div style={{ animation: 'cardIn 0.38s cubic-bezier(0.22,1,0.36,1) both' }}>
            <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1.5px solid #E8EAE5', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 19, color: '#fff', flexShrink: 0 }}>{initials}</div>
                <div>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>{worker.name}</div>
                  <div style={{ fontSize: 11, color: '#8A9A8C', letterSpacing: 1, fontFamily: 'monospace' }}>{worker.regNumber}</div>
                </div>
                {worker.isVerified && (
                  <div style={{ marginLeft: 'auto', background: '#ECFDF5', color: '#1B6B3A', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 800, letterSpacing: 0.3 }}>VERIFIED</div>
                )}
              </div>

              {summaryRows.map(row => (
                <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #F1F2EE' }}>
                  <span style={{ fontSize: 13, color: '#8A9A8C' }}>{row.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0D1B0F', textAlign: 'right', maxWidth: '60%' }}>{row.v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3D4E3F', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                {hi ? 'Captain को Message' : 'Note to Captain'} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({hi ? 'ज़रूरी नहीं' : 'optional'})</span>
              </div>
              <textarea
                placeholder={hi ? 'कुछ और बताना हो तो यहाँ लिखें…' : 'Anything else you want to share…'}
                rows={3}
                maxLength={150}
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{
                  width: '100%', borderRadius: 12, border: '1.5px solid #E8EAE5',
                  padding: '12px 14px', fontSize: 14, background: '#F7F8F5', outline: 'none',
                  color: '#0D1B0F', resize: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.target.style.borderColor = '#1B6B3A')}
                onBlur={e => (e.target.style.borderColor = '#E8EAE5')}
              />
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 }}>{note.length}/150</div>
            </div>

            <div style={{ background: '#ECFDF5', borderRadius: 14, padding: '14px 16px', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: 11, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{hi ? 'आवेदन किया जा रहा है' : 'Applying for'}</div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#0D1B0F' }}>{job.role}</div>
              <div style={{ fontSize: 13, color: '#3D4E3F' }}>{job.employerName} · {job.location}</div>
            </div>
          </div>
        )}

        {/* Success / Job Confirmed */}
        {step === TOTAL_Q + 1 && (
          <div style={{ animation: 'cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>

            {/* ── Hero banner ── */}
            <div style={{
              background: 'linear-gradient(150deg, #022010 0%, #0F5C34 50%, #168448 100%)',
              borderRadius: 28, padding: '36px 24px 32px', marginBottom: 16,
              textAlign: 'center', position: 'relative', overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(5,61,26,0.45)',
            }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.07)' }} />
              <div style={{ position: 'absolute', top: -25, right: -25, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 130, height: 130, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

              {/* Tick with glow rings */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  width: 88, height: 88, borderRadius: '50%', margin: '0 auto',
                  background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 14px rgba(74,222,128,0.06)',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4ADE80, #16A34A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(74,222,128,0.5)',
                  }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#4ADE80', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
                {hi ? 'बधाई हो!' : 'Congratulations!'}
              </div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 28, color: '#fff', lineHeight: 1.15, marginBottom: 14, letterSpacing: -0.5 }}>
                {hi ? 'आपकी Job Confirm\nहो गई है!' : 'Your Job is\nConfirmed!'}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 30, padding: '8px 20px',
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{worker.name} · {job.role}</span>
              </div>
            </div>

            {/* ── Job details card ── */}
            <div style={{
              background: '#fff', borderRadius: 22, overflow: 'hidden', marginBottom: 14,
              boxShadow: '0 2px 16px rgba(0,0,0,0.07), 0 8px 32px rgba(0,0,0,0.04)',
              border: '1px solid #E8EAE5',
            }}>
              <div style={{ height: 4, background: 'linear-gradient(90deg, #168448, #4ADE80)' }} />

              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #A7F3D0',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#168448" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17, color: '#0D1B0F' }}>{job.role}</div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.employerName} · {job.location}</div>
                </div>
                <div style={{ background: '#ECFDF5', color: '#166534', fontSize: 9, fontWeight: 800, padding: '5px 10px', borderRadius: 20, letterSpacing: 0.8, border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}>
                  CONFIRMED
                </div>
              </div>

              {job.salary?.min && (
                <div style={{ margin: '0 20px 16px', borderRadius: 14, background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)', border: '1px solid #BBF7D0', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                      {hi ? 'मासिक वेतन' : 'Monthly Salary'}
                    </div>
                    <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 22, color: '#168448', letterSpacing: -0.5 }}>
                      ₹{job.salary.min.toLocaleString('en-IN')}
                      {job.salary.max ? `–${job.salary.max.toLocaleString('en-IN')}` : '+'}<span style={{ fontSize: 13, fontWeight: 600, color: '#8A9A8C' }}>/माह</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 28 }}>💰</div>
                </div>
              )}

              <div style={{ padding: '14px 20px 18px', borderTop: '1px solid #F1F2EE' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#8A9A8C', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
                  {hi ? 'अगला कदम' : 'Next Step'}
                </div>
                <div style={{ fontSize: 14, color: '#0D1B0F', fontWeight: 600, lineHeight: 1.55, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', marginTop: 5, flexShrink: 0 }} />
                  {hi
                    ? <>Captain <strong>{captain?.name ?? 'Switch'}</strong> जल्द WhatsApp पर संपर्क करेंगे। Phone पास रखें!</>
                    : <>Captain <strong>{captain?.name ?? 'Switch'}</strong> will contact you on WhatsApp soon.</>}
                </div>
              </div>
            </div>

            {/* ── Motivational strip ── */}
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
              border: '1px solid #BBF7D0', borderRadius: 16,
              padding: '16px 18px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(34,197,94,0.3)', fontSize: 22,
              }}>💪</div>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, lineHeight: 1.55 }}>
                {hi
                  ? 'Switch पर Apply करने वाले 78% लोगों को 24 घंटे में Call आती है। शुभकामनाएं!'
                  : '78% of Switch applicants receive a call within 24 hours. Best of luck!'}
              </div>
            </div>

            {/* ── Share on WhatsApp ── */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(hi
                ? `🎉 मुझे Switch App से Job मिल गई!\n\n💼 Role: ${job.role}\n🏢 Company: ${job.employerName}\n📍 Location: ${job.location}\n\nSwitch App से घर के पास Job ढूंढो 👇\nDownload करो और अपने दोस्तों को भी बताओ!`
                : `🎉 I got a Job through Switch App!\n\n💼 Role: ${job.role}\n🏢 Company: ${job.employerName}\n📍 Location: ${job.location}\n\nFind jobs near your home on Switch App!\nDownload now!`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: '#25D366', color: '#fff', textDecoration: 'none',
                borderRadius: 16, padding: '17px', fontSize: 16, fontWeight: 700,
                boxShadow: '0 6px 24px rgba(37,211,102,0.45)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382a1 1 0 00-1.447-.143c-.404.342-.834.682-1.267.892-.434.21-.84.168-1.34-.168A11.13 11.13 0 0111.6 13.6a11.05 11.05 0 01-1.342-1.818c-.335-.5-.377-.907-.168-1.34.21-.434.55-.864.892-1.267a1 1 0 00-.143-1.447l-2.3-2.3a1 1 0 00-1.361.04C5.916 6.63 5 8.14 5 9.756c0 4.84 3.945 8.9 8.86 9.043 1.65.048 3.24-.897 4.297-2.09a1 1 0 00.04-1.362l-2.3-2.3z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
              {hi ? 'WhatsApp पर Share करें' : 'Share on WhatsApp'}
            </a>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      {step < TOTAL_Q + 1 && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430,
          background: '#fff', borderTop: '1px solid #E8EAE5',
          padding: '14px 16px calc(14px + env(safe-area-inset-bottom, 0px))',
          zIndex: 100,
        }}>
          <button
            onClick={() => { if (step < TOTAL_Q) setStep(s => s + 1); else submit(); }}
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
            {step < TOTAL_Q
              ? (hi ? 'आगे बढ़ें →' : 'Continue →')
              : (hi ? 'आवेदन भेजें' : 'Submit Application')}
          </button>
        </div>
      )}
    </div>
  );
}
