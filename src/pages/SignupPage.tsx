import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveWorker, setOnboarded, generateRegNumber, getWorker } from '../data/store';
import { useT } from '../i18n/useT';
import type { Language } from '../types';

const LANGS = [
  { id: 'hi',  label: 'हिन्दी',   sub: 'ऐप हिन्दी में चलेगा' },
  { id: 'hig', label: 'Hinglish', sub: 'Hindi + English mix' },
  { id: 'en',  label: 'English',  sub: 'Full English mode' },
];

const JOB_TYPES = [
  { id: 'Security Guard', label: 'Security Guard' },
  { id: 'Housekeeping',   label: 'Housekeeping' },
  { id: 'Driver',         label: 'Driver' },
  { id: 'Cook',           label: 'Cook / Chef' },
  { id: 'Helper',         label: 'Helper' },
  { id: 'Technician',     label: 'Technician' },
];

const STEPS_META = [
  { title: 'Language',    sub: 'Choose your preferred language' },
  { title: 'Your Details', sub: 'Tell us about yourself' },
  { title: 'Work Type',   sub: 'What kind of work do you do?' },
  { title: 'Get Verified', sub: 'Stand out to employers' },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: '#3D4E3F', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = 'text', maxLength }: {
  placeholder: string; value: string; onChange: (v: string) => void; type?: string; maxLength?: number;
}) {
  return (
    <input
      type={type} maxLength={maxLength} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', height: 52, border: '1.5px solid #E8EAE5', borderRadius: 12,
        padding: '0 16px', fontSize: 15, fontWeight: 500, background: '#F7F8F5',
        outline: 'none', color: '#0D1B0F', letterSpacing: type === 'tel' ? 1.5 : 0,
      }}
      onFocus={e => e.target.style.borderColor = '#1B6B3A'}
      onBlur={e => e.target.style.borderColor = '#E8EAE5'}
    />
  );
}

export function SignupPage() {
  const [step,   setStep]  = useState(0);
  const [lang,   setLang]  = useState<Language>('hi');
  const [name,   setName]  = useState('');
  const [mobile, setMobile]= useState('');
  const [types,  setTypes] = useState<string[]>([]);
  const [photo,  setPhoto] = useState(false);
  const t = useT();
  const navigate = useNavigate();
  // Translated step titles (re-computed when lang changes via t)
  const stepsLabels = [
    { title: t('signup.step0.title'), sub: t('signup.step0.sub') },
    { title: t('signup.step1.title'), sub: t('signup.step1.sub') },
    { title: t('signup.step2.title'), sub: t('signup.step2.sub') },
    { title: t('signup.step3.title'), sub: t('signup.step3.sub') },
  ];


  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);
  const toggleType = (id: string) =>
    setTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const finish = () => {
    const base = getWorker();
    saveWorker({
      ...base,
      name: name || 'Worker',
      mobile: mobile || '9999999999',
      jobTypes: types, skills: types,
      language: lang,
      isVerified: photo,
      regNumber: generateRegNumber(),
    });
    setOnboarded();
    navigate('/home');
  };

  const primary  = '#1B6B3A';
  const canNext0 = true;
  const canNext1 = name.trim().length >= 2 && mobile.length === 10;
  const canNext2 = types.length > 0;
  const canNext  = [canNext0, canNext1, canNext2, true][step];

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F8F5' }}>

      {/* ── Top green header ── */}
      <div style={{
        background: `linear-gradient(165deg, #0F3D21 0%, ${primary} 55%, #168448 100%)`,
        padding: 'calc(env(safe-area-inset-top,0px) + 48px) 20px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background rings */}
        {[200, 320, 440].map(size => (
          <div key={size} style={{
            position: 'absolute', width: size, height: size,
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
          }} />
        ))}

        {/* Back / brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'relative' }}>
          <button
            onClick={() => step === 0 ? navigate('/login') : back()}
            style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style={{ fontFamily: '"DM Serif Display","Georgia",serif', fontSize: 28, color: '#fff', letterSpacing: -1 }}>Switch</div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Step {step + 1} of {stepsLabels.length}
          </div>
        </div>

        {/* Step heading */}
        <div style={{ position: 'relative' }}>
          <div style={{ fontWeight: 800, fontSize: 26, color: '#fff', letterSpacing: -0.5, lineHeight: 1.1, marginBottom: 4 }}>
            {stepsLabels[step].title}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
            {stepsLabels[step].sub}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 5, marginTop: 20 }}>
          {STEPS_META.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: i <= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* ── Form card ── */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: '28px 28px 0 0',
        marginTop: -20, padding: '28px 20px 40px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
        animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1) both',
      }}>

        {/* ─ Step 0: Language ─ */}
        {step === 0 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {LANGS.map(l => (
                <button key={l.id} onClick={() => setLang(l.id as Language)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                  borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  background: lang === l.id ? '#ECFDF5' : '#F7F8F5',
                  border: `1.5px solid ${lang === l.id ? primary : '#E8EAE5'}`,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: lang === l.id ? primary : '#E8EAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={lang === l.id ? '#fff' : '#6B7280'} strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: lang === l.id ? primary : '#0D1B0F' }}>{l.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{l.sub}</div>
                  </div>
                  {lang === l.id && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─ Step 1: Basic info ─ */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <FieldLabel>Full Name</FieldLabel>
              <Input placeholder="e.g. Rahul Kumar" value={name} onChange={setName} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <FieldLabel>Mobile Number</FieldLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 62, height: 52, background: '#F2F4F0', border: '1.5px solid #E8EAE5', borderRadius: 12, fontSize: 13, fontWeight: 700, color: primary, flexShrink: 0 }}>
                  +91
                </div>
                <Input placeholder="98765 43210" value={mobile} onChange={v => setMobile(v.replace(/\D/g, ''))} type="tel" maxLength={10} />
              </div>
            </div>
          </div>
        )}

        {/* ─ Step 2: Job types ─ */}
        {step === 2 && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              {JOB_TYPES.map(jt => {
                const sel = types.includes(jt.id);
                return (
                  <button key={jt.id} onClick={() => toggleType(jt.id)} style={{
                    padding: '16px 12px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                    background: sel ? '#ECFDF5' : '#F7F8F5',
                    border: `1.5px solid ${sel ? primary : '#E8EAE5'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: sel ? primary : '#0D1B0F' }}>{jt.label}</span>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: sel ? primary : '#E8EAE5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </button>
                );
              })}
            </div>
            {types.length > 0 && (
              <div style={{ fontSize: 12, color: '#8A9A8C', marginTop: 8 }}>
                {types.length} selected · You can always change this later
              </div>
            )}
          </div>
        )}

        {/* ─ Step 3: Verification ─ */}
        {step === 3 && (
          <div>
            {/* Benefits */}
            <div style={{ background: '#ECFDF5', borderRadius: 14, padding: '16px', marginBottom: 20, border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1B6B3A', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Benefits of Verification</div>
              {[
                { text: 'Verified badge on your profile', icon: '✓' },
                { text: 'Employers call you directly', icon: '✓' },
                { text: '3× more salary offers on average', icon: '✓' },
              ].map(b => (
                <div key={b.text} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1B6B3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize: 13, color: '#1B6B3A', fontWeight: 600 }}>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Selfie upload */}
            <div onClick={() => setPhoto(true)} style={{
              height: 130, borderRadius: 16, cursor: 'pointer', marginBottom: 12,
              border: `2px dashed ${photo ? primary : '#D1D5DB'}`,
              background: photo ? '#ECFDF5' : '#F7F8F5',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: photo ? primary : '#E8EAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={photo ? 'white' : '#6B7280'} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <span style={{ fontSize: 13, color: photo ? primary : '#9CA3AF', fontWeight: 700 }}>
                {photo ? 'Selfie Uploaded' : 'Tap to Upload Selfie'}
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 }}>
              Aadhar verification can also be done later from your profile
            </div>
          </div>
        )}

        {/* ─ Primary action button ─ */}
        <button
          onClick={step === stepsLabels.length - 1 ? finish : next}
          disabled={!canNext}
          style={{
            width: '100%', height: 52, borderRadius: 14, marginTop: 8,
            background: canNext ? primary : '#E8EAE5',
            color: canNext ? '#fff' : '#9CA3AF',
            border: 'none', fontSize: 15, fontWeight: 700, cursor: canNext ? 'pointer' : 'default',
            boxShadow: canNext ? `0 4px 16px rgba(27,107,58,0.3)` : 'none',
            transition: 'all 0.2s',
          }}>
          {step === stepsLabels.length - 1
            ? (photo ? t('signup.createAccount') : t('signup.skipContinue'))
            : t('common.continue')}
        </button>

        {/* Bottom link */}
        {step === 0 && (
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8A9A8C' }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} style={{ color: primary, fontWeight: 700, cursor: 'pointer' }}>
              Sign in
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
