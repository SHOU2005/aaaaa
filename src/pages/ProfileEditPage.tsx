import React, { useState, useRef } from 'react';
// ── ProfileEditPage — Edit Profile ────────────────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { getWorker, saveWorker } from '../data/store';
import type { Worker } from '../types';

const JOB_TYPES = [
  { id: 'Security Guard', icon: '🔒' },
  { id: 'Housekeeping',   icon: '🧹' },
  { id: 'Driver',         icon: '🚗' },
  { id: 'Cook',           icon: '👨‍🍳' },
  { id: 'Helper',         icon: '🏗️' },
  { id: 'Technician',     icon: '🔧' },
];

const AVAIL_OPTS: { id: Worker['availability']; icon: string; label: string }[] = [
  { id: 'available',     icon: '🟢', label: 'उपलब्ध हूँ — Job ढूंढ रहे हैं' },
  { id: 'notice_period', icon: '🟡', label: 'Notice Period में हूँ' },
  { id: 'working',       icon: '🔵', label: 'अभी काम पर हूँ' },
];

const AVATAR_COLORS = ['#168448', '#2563EB', '#7C3AED', '#DC2626', '#EA580C', '#0891B2'];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--r-xl)',
      border: '1px solid var(--border)', padding: 16, marginBottom: 14,
      boxShadow: 'var(--sh-card)',
    }}>
      <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14, color: 'var(--text-hi)', marginBottom: 14 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase' as const, letterSpacing: 0.6, marginBottom: 7 }}>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', maxLength, readOnly }: {
  value: string; onChange?: (v: string) => void; placeholder: string;
  type?: string; maxLength?: number; readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} placeholder={placeholder} maxLength={maxLength} readOnly={readOnly}
      onChange={e => onChange?.(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', height: 50, padding: '0 14px',
        background: readOnly ? 'var(--n50)' : '#fff',
        border: `1.5px solid ${focused ? 'var(--g600)' : 'var(--border)'}`,
        borderRadius: 'var(--r-md)', fontSize: 15, fontWeight: 500,
        color: readOnly ? 'var(--text-lo)' : 'var(--text-hi)',
        outline: 'none', fontFamily: 'DM Sans',
        transition: 'border-color 0.15s',
      }}
    />
  );
}

export function ProfileEditPage() {
  const navigate = useNavigate();
  const worker = getWorker();

  const [name,     setName]     = useState(worker.name ?? '');
  const [city,     setCity]     = useState(worker.city ?? '');
  const [sector,   setSector]   = useState(worker.sector ?? '');
  const [bio,      setBio]      = useState(worker.bio ?? '');
  const [jobTypes, setJobTypes] = useState<string[]>(worker.jobTypes ?? []);
  const [avail,    setAvail]    = useState<Worker['availability']>(worker.availability ?? 'available');
  const [saving,   setSaving]   = useState(false);
  const [done,     setDone]     = useState(false);
  const [bioFocus, setBioFocus] = useState(false);

  const initials = (name || 'W').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarBg = AVATAR_COLORS[(worker.name?.charCodeAt(0) ?? 87) % AVATAR_COLORS.length];

  const toggleType = (id: string) =>
    setJobTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const save = () => {
    if (saving || done) return;
    setSaving(true);
    saveWorker({
      ...worker,
      name: name.trim() || worker.name,
      city: city.trim() || worker.city,
      sector: sector.trim() || worker.sector,
      bio: bio.trim(),
      jobTypes,
      skills: jobTypes,
      availability: avail,
    });
    setTimeout(() => {
      setSaving(false);
      setDone(true);
      setTimeout(() => navigate('/profile'), 700);
    }, 500);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)', paddingBottom: 100 }}>

      {/* ─── Sticky Header ─── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 16px',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', width: 38, height: 38, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, flexShrink: 0,
            }}
          >←</button>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: '#fff', flex: 1 }}>
            Profile Edit
          </div>
          <button
            onClick={save}
            disabled={saving || done}
            style={{
              background: done ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.2)',
              border: `1px solid ${done ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.35)'}`,
              color: '#fff', borderRadius: 'var(--r-md)',
              padding: '7px 18px', fontWeight: 700, fontSize: 13,
              cursor: saving || done ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {done ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ─── Avatar Header ─── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '24px 0 20px',
      }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: avatarBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 28, color: '#fff',
            border: '3px solid var(--g100)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}>
            {initials}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 28, height: 28, borderRadius: '50%', background: 'var(--g700)',
            border: '2px solid #fff', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 13, cursor: 'pointer',
          }}>📷</div>
        </div>
        <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 16, color: 'var(--text-hi)' }}>{name || worker.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 2 }}>
          {worker.regNumber} · {worker.isVerified ? '⭐ Verified' : 'Unverified'}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ─── Basic Info ─── */}
        <SectionCard title="👤 Basic Information">
          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Full Name</FieldLabel>
            <TextInput value={name} onChange={setName} placeholder="Rahul Kumar" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <FieldLabel>Mobile Number</FieldLabel>
            <TextInput value={worker.mobile} placeholder="" readOnly />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <FieldLabel>City</FieldLabel>
              <TextInput value={city} onChange={setCity} placeholder="Gurgaon" />
            </div>
            <div>
              <FieldLabel>Sector / Area</FieldLabel>
              <TextInput value={sector} onChange={setSector} placeholder="Sector 29" />
            </div>
          </div>
          <div>
            <FieldLabel>Bio (Optional)</FieldLabel>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              onFocus={() => setBioFocus(true)}
              onBlur={() => setBioFocus(false)}
              placeholder="अपने बारे में लिखें — experience, skills, location preference…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', resize: 'none',
                background: '#fff', border: `1.5px solid ${bioFocus ? 'var(--g600)' : 'var(--border)'}`,
                borderRadius: 'var(--r-md)', fontSize: 14, fontFamily: 'DM Sans',
                outline: 'none', lineHeight: 1.6, color: 'var(--text-hi)',
                transition: 'border-color 0.15s',
              }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 4 }}>{bio.length}/200</div>
          </div>
        </SectionCard>

        {/* ─── Availability ─── */}
        <SectionCard title="⚡ Availability Status">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {AVAIL_OPTS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setAvail(opt.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
                  background: avail === opt.id ? 'var(--g50)' : '#F9FAFB',
                  border: `1.5px solid ${avail === opt.id ? 'var(--g600)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: avail === opt.id ? 'var(--g700)' : 'var(--text-mid)', flex: 1 }}>
                  {opt.label}
                </span>
                {avail === opt.id && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: 'var(--g700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ─── Job Preferences ─── */}
        <SectionCard title="💼 Job Preferences">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {JOB_TYPES.map(jt => {
              const sel = jobTypes.includes(jt.id);
              return (
                <button
                  key={jt.id}
                  onClick={() => toggleType(jt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 13px',
                    background: sel ? 'var(--g50)' : '#F9FAFB',
                    border: `1.5px solid ${sel ? 'var(--g600)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{jt.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: sel ? 'var(--g700)' : 'var(--text-mid)', flex: 1, textAlign: 'left' }}>
                    {jt.id}
                  </span>
                  {sel && <span style={{ color: 'var(--g700)', fontSize: 14, fontWeight: 800 }}>✓</span>}
                </button>
              );
            })}
          </div>
          {jobTypes.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 8, fontWeight: 500 }}>
              {jobTypes.length} selected
            </div>
          )}
        </SectionCard>

        {/* ─── Register Number (readonly) ─── */}
        <div style={{
          background: 'var(--n50)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-lg)', padding: '12px 16px', marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ fontSize: 18 }}>🪪</div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-lo)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Switch ID</div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: 'var(--text-hi)', letterSpacing: 1 }}>{worker.regNumber}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-lo)', fontStyle: 'italic' }}>Cannot change</div>
        </div>

      </div>

      {/* ─── Sticky Save Button ─── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#fff', borderTop: '1px solid var(--border)',
        padding: 'calc(12px + env(safe-area-inset-bottom,0px)) 16px 12px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <button
          onClick={save}
          disabled={saving || done}
          style={{
            width: '100%', height: 52,
            background: done ? '#16A34A' : saving ? 'var(--g600)' : 'var(--g700)',
            color: '#fff', border: 'none', borderRadius: 'var(--r-lg)',
            fontSize: 15, fontWeight: 700, cursor: saving || done ? 'default' : 'pointer',
            boxShadow: done || saving ? 'none' : 'var(--sh-btn)',
            transition: 'background 0.3s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {done
            ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
            : saving ? 'Saving…'
            : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
