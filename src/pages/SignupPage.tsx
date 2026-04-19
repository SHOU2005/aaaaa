import React from 'react';
// ── SignupPage ────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveWorker, setOnboarded, generateRegNumber, getWorker } from '../data/store';
import type { Language } from '../types';

const LANGS = [
  { id: 'hi',  emoji: '🇮🇳', label: 'हिन्दी',   desc: 'ऐप हिन्दी में' },
  { id: 'hig', emoji: '🤝', label: 'Hinglish', desc: 'Mix of dono' },
  { id: 'en',  emoji: '🌍', label: 'English',  desc: 'Full English' },
];

const JOB_TYPES = [
  { id: 'Security Guard', icon: '🔒', label: 'Security' },
  { id: 'Housekeeping',   icon: '🧹', label: 'Housekeeping' },
  { id: 'Driver',         icon: '🚗', label: 'Driver' },
  { id: 'Cook',           icon: '👨‍🍳', label: 'Cook / Chef' },
  { id: 'Helper',         icon: '🏗️',  label: 'Helper' },
  { id: 'Technician',     icon: '🔧', label: 'Technician' },
];

export function SignupPage() {
  const [step,  setStep]  = useState(0);
  const [lang,  setLang]  = useState<Language>('hi');
  const [name,  setName]  = useState('');
  const [mobile,setMobile]= useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [photo, setPhoto] = useState(false);
  const navigate = useNavigate();

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

  const STEPS = [
    /* 0 — Language */
    <div key="lang">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🗣️</div>
        <div className="auth-heading">भाषा चुनें</div>
        <div className="auth-sub">Choose your language</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {LANGS.map(l => (
          <button key={l.id} onClick={() => setLang(l.id as Language)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
            borderRadius: 'var(--r-lg)', background: lang === l.id ? 'var(--g50)' : 'var(--n50)',
            border: `2px solid ${lang === l.id ? 'var(--g700)' : 'var(--border)'}`,
            cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{ fontSize: 24 }}>{l.emoji}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: lang === l.id ? 'var(--g700)' : 'var(--text-hi)' }}>{l.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{l.desc}</div>
            </div>
            {lang === l.id && <span style={{ marginLeft: 'auto', color: 'var(--g700)', fontSize: 18 }}>✓</span>}
          </button>
        ))}
      </div>
      <button className="btn btn-primary btn-full" onClick={next}>अगला →</button>
    </div>,

    /* 1 — Basic Info */
    <div key="info">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>👤</div>
        <div className="auth-heading">आपकी जानकारी</div>
        <div className="auth-sub">Profile बनाएं</div>
      </div>
      <div className="field">
        <label className="field-label">आपका पूरा नाम *</label>
        <input className="field-input" placeholder="Rahul Kumar" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">मोबाइल नंबर *</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="field-input" style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--n100)', flexShrink: 0 }}>+91</div>
          <input className="field-input" style={{ flex: 1 }} type="tel" maxLength={10} placeholder="9876543210" value={mobile} onChange={e => setMobile(e.target.value)} />
        </div>
      </div>
      <button className="btn btn-primary btn-full" onClick={next} disabled={!name || mobile.length !== 10} style={{ marginTop: 8 }}>
        अगला →
      </button>
    </div>,

    /* 2 — Job Types */
    <div key="jobs">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>💼</div>
        <div className="auth-heading">क्या काम करते हैं?</div>
        <div className="auth-sub">एक या अधिक चुनें</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {JOB_TYPES.map(jt => {
          const sel = types.includes(jt.id);
          return (
            <button key={jt.id} onClick={() => toggleType(jt.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '16px 12px', borderRadius: 'var(--r-lg)',
              background: sel ? 'var(--g50)' : 'var(--n50)',
              border: `2px solid ${sel ? 'var(--g700)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}>
              <span style={{ fontSize: 30 }}>{jt.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 13, color: sel ? 'var(--g700)' : 'var(--text-hi)' }}>{jt.label}</span>
            </button>
          );
        })}
      </div>
      <button className="btn btn-primary btn-full" onClick={next} disabled={types.length === 0}>
        अगला →
      </button>
    </div>,

    /* 3 — Switch Verified */
    <div key="verify">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>⭐</div>
        <div className="auth-heading">Switch Verified बनें</div>
        <div className="auth-sub">Verified workers को 3× ज़्यादा calls आती हैं</div>
      </div>

      <div style={{ background: 'var(--amber-bg)', border: '1.5px solid #FDE68A', borderRadius: 'var(--r-lg)', padding: 14, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 6 }}>क्या मिलेगा?</div>
        {['⭐ Profile पर Verified badge', '📞 Employers directly call करते हैं', '💰 ज़्यादा salary offers'].map(b => (
          <div key={b} style={{ fontSize: 13, color: '#78350F', marginBottom: 4 }}>{b}</div>
        ))}
      </div>

      {/* Selfie upload */}
      <div
        onClick={() => setPhoto(true)}
        style={{
          height: 130, borderRadius: 'var(--r-xl)', cursor: 'pointer', marginBottom: 12,
          border: `2px dashed ${photo ? 'var(--g700)' : 'var(--n300)'}`,
          background: photo ? 'var(--g50)' : 'var(--n50)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <span style={{ fontSize: 32 }}>{photo ? '📸' : '📷'}</span>
        <span style={{ fontSize: 13, color: photo ? 'var(--g700)' : 'var(--text-lo)', fontWeight: 600 }}>
          {photo ? 'Selfie Uploaded ✓' : 'Tap to Upload Selfie'}
        </span>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-lo)', textAlign: 'center', marginBottom: 20 }}>
        Aadhar verification भी ज़रूरी है (बाद में भी हो सकता है)
      </div>

      <button className="btn btn-primary btn-full" onClick={finish} style={{ marginBottom: 10 }}>
        {photo ? 'Account बनाएं ✓' : 'Skip & बाद में करें'}
      </button>
    </div>,
  ];

  return (
    <div className="auth-root">
      {/* Logo top */}
      <div style={{ width: '100%', maxWidth: 390, textAlign: 'center', marginBottom: 20 }}>
        <div className="auth-logo">📍</div>
      </div>

      {/* Progress */}
      <div className="progress-dots" style={{ width: '100%', maxWidth: 390, padding: '0 4px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`progress-dot ${i <= step ? 'done' : ''}`} />
        ))}
      </div>

      <div className="auth-card anim-slide">
        {STEPS[step]}
      </div>

      {step > 0 && (
        <button
          onClick={back}
          style={{ background: 'none', border: 'none', color: 'var(--text-lo)', fontSize: 14, marginTop: 14, cursor: 'pointer' }}
        >
          ← वापस जाएं
        </button>
      )}
      {step === 0 && (
        <div style={{ marginTop: 14, fontSize: 14, color: 'var(--text-mid)' }}>
          पहले से खाता है?{' '}
          <span onClick={() => location.href='/login'} style={{ color: 'var(--g700)', fontWeight: 700, cursor: 'pointer' }}>
            लॉग इन करें →
          </span>
        </div>
      )}
    </div>
  );
}
