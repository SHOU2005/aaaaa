import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { setOnboarded } from '../data/store';

export function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = async () => {
    if (mobile.length !== 10) { setError('Please enter a valid 10-digit number'); return; }
    setError(''); setLoading(true);
    if (isSupabaseConfigured()) {
      const { error: e } = await supabase.auth.signInWithOtp({ phone: `+91${mobile}` });
      if (e) { setError(e.message); setLoading(false); return; }
    } else {
      await new Promise(r => setTimeout(r, 800));
    }
    setLoading(false); setStep('otp');
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 4) { setError('Enter a valid OTP'); return; }
    setError(''); setLoading(true);
    if (isSupabaseConfigured()) {
      const { error: e } = await supabase.auth.verifyOtp({ phone: `+91${mobile}`, token: code, type: 'sms' });
      if (e) { setError(e.message); setLoading(false); return; }
    } else {
      await new Promise(r => setTimeout(r, 600));
    }
    setOnboarded();
    navigate('/home');
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp]; next[i] = d; setOtp(next);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const canSubmit = mobile.length === 10;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F8F5' }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(165deg, #0F3D21 0%, #1B6B3A 55%, #168448 100%)',
        flex: '0 0 44%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px 40px', position: 'relative', overflow: 'hidden',
      }}>
        {[220, 340, 460].map(size => (
          <div key={size} style={{
            position: 'absolute', width: size, height: size,
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '50%',
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none',
          }} />
        ))}
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20, backdropFilter: 'blur(8px)',
          animation: 'scaleIn 0.5s cubic-bezier(0.22,1,0.36,1) both',
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style={{
          fontFamily: '"DM Serif Display", "Georgia", serif', fontWeight: 400,
          fontSize: 44, color: '#fff', letterSpacing: -1.5, lineHeight: 1,
          animation: 'slideUp 0.5s 0.1s cubic-bezier(0.22,1,0.36,1) both',
        }}>Switch</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginTop: 8, fontWeight: 400, animation: 'fadeIn 0.5s 0.3s ease both' }}>
          घर के पास Job
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeIn 0.5s 0.5s ease both' }}>
          {['10k+ Workers', 'Verified Jobs', '100% Free'].map(t => (
            <span key={t} style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: 20, fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Form card ── */}
      <div style={{
        flex: 1, background: '#fff', borderRadius: '28px 28px 0 0', marginTop: -24,
        padding: '32px 24px 40px', boxShadow: '0 -8px 32px rgba(0,0,0,0.08)',
        animation: 'slideUp 0.4s 0.15s cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {step === 'phone' ? (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 24, color: '#0D1B0F', letterSpacing: -0.5, marginBottom: 6 }}>Welcome back</div>
              <div style={{ fontSize: 14, color: '#8A9A8C' }}>Enter your mobile number to continue</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#3D4E3F', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' as const }}>Mobile Number</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 62, height: 52, background: '#F2F4F0', border: '1.5px solid #E8EAE5', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#1B6B3A', flexShrink: 0 }}>
                  +91
                </div>
                <input
                  id="login-mobile" type="tel" maxLength={10} placeholder="98765 43210"
                  value={mobile}
                  onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  style={{ flex: 1, height: 52, border: '1.5px solid #E8EAE5', borderRadius: 12, padding: '0 16px', fontSize: 18, fontWeight: 600, letterSpacing: 2, background: '#F7F8F5', outline: 'none', color: '#0D1B0F' }}
                />
              </div>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button id="login-send-otp" onClick={sendOtp} disabled={loading || !canSubmit}
              style={{
                width: '100%', height: 52, borderRadius: 14, marginBottom: 20,
                background: canSubmit ? '#1B6B3A' : '#E8EAE5',
                color: canSubmit ? '#fff' : '#8A9A8C', border: 'none',
                fontSize: 15, fontWeight: 700, cursor: canSubmit ? 'pointer' : 'default',
                boxShadow: canSubmit ? '0 4px 16px rgba(27,107,58,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>

            <div style={{ textAlign: 'center', fontSize: 14, color: '#8A9A8C' }}>
              New to Switch?{' '}
              <span onClick={() => navigate('/signup')} style={{ color: '#1B6B3A', fontWeight: 700, cursor: 'pointer' }}>
                Create account
              </span>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, fontSize: 24, color: '#0D1B0F', letterSpacing: -0.5, marginBottom: 6 }}>Verify OTP</div>
              <div style={{ fontSize: 14, color: '#8A9A8C' }}>6-digit code sent to +91 {mobile}</div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => { otpRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  style={{ width: 46, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#0D1B0F', border: `2px solid ${digit ? '#1B6B3A' : '#E8EAE5'}`, borderRadius: 14, background: digit ? '#ECFDF5' : '#F7F8F5', outline: 'none', transition: 'all 0.15s' }}
                />
              ))}
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 16, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button id="login-verify-otp" onClick={verifyOtp} disabled={loading || otp.join('').length < 4}
              style={{ width: '100%', height: 52, borderRadius: 14, background: '#1B6B3A', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(27,107,58,0.3)', marginBottom: 16 }}>
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                style={{ background: 'none', border: 'none', color: '#8A9A8C', fontSize: 13, cursor: 'pointer', padding: 0 }}>
                ← Change number
              </button>
              <button onClick={sendOtp}
                style={{ background: 'none', border: 'none', color: '#1B6B3A', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
