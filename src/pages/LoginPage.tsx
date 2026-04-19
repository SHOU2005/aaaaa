import React, { useState, useRef } from 'react';
// ── LoginPage — Premium redesign ───────────────────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n/useT';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { setOnboarded } from '../data/store';

export function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const t = useT();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = async () => {
    if (mobile.length !== 10) { setError(t('login.mobileLabel')); return; }
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
    if (code.length < 4) { setError('सही OTP डालें'); return; }
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
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) {
      otpRefs.current[i + 1]?.focus();
    }
  };

  return (
    <div className="auth-root">

      {/* ── Top hero half ── */}
      <div className="auth-top">
        <div className="auth-logo" style={{ animation: 'bounceIn 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
          📍
        </div>
        <div className="auth-brand-name" style={{ animation: 'slideUp 0.5s 0.15s cubic-bezier(0.22,1,0.36,1) both' }}>
          Switch
        </div>
        <div className="auth-tagline" style={{ animation: 'slideUp 0.5s 0.25s cubic-bezier(0.22,1,0.36,1) both' }}>
          Ghar ke Pass Job
        </div>
        <div className="auth-sub-tag" style={{ animation: 'fadeIn 0.5s 0.45s ease both' }}>
          India's #1 Local Job Network
        </div>
      </div>

      {/* ── Bottom white card ── */}
      <div className="auth-bottom anim-slide">

        {step === 'phone' ? (
          <>
            <div className="auth-heading">लॉग इन करें 👋</div>
            <div className="auth-sub">आपके नंबर पर OTP भेजा जाएगा</div>

            <div className="field">
              <label className="field-label">मोबाइल नंबर</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="field-input" style={{
                  width: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--n50)', flexShrink: 0, fontWeight: 700, color: 'var(--g700)',
                }}>
                  🇮🇳 +91
                </div>
                <input
                  id="login-mobile"
                  className="field-input"
                  type="tel" maxLength={10} placeholder="9876543210"
                  value={mobile}
                  onChange={e => { setMobile(e.target.value.replace(/\D/g, '')); setError(''); }}
                  style={{ flex: 1, fontSize: 18, fontWeight: 600, letterSpacing: 1 }}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                />
              </div>
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, fontWeight: 500 }}>{error}</div>}

            <button
              id="login-send-otp"
              className="btn btn-primary btn-full"
              onClick={sendOtp}
              disabled={loading || mobile.length !== 10}
              style={{ fontSize: 15, height: 52, borderRadius: 'var(--r-lg)', marginBottom: 16 }}
            >
              {loading ? '⏳ भेज रहे हैं...' : 'OTP भेजें →'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-lo)', fontSize: 12, justifyContent: 'center', marginBottom: 20 }}>
              🔒 10,000+ Workers का भरोसा • 100% Safe
            </div>

            <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-mid)' }}>
              पहली बार?{' '}
              <span
                onClick={() => navigate('/signup')}
                style={{ color: 'var(--g700)', fontWeight: 700, cursor: 'pointer' }}
              >
                खाता बनाएं →
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="auth-heading">OTP Enter करें 🔐</div>
            <div className="auth-sub">+91 {mobile} पर 6-digit OTP भेजा गया</div>

            {/* 6-Box OTP */}
            <div className="field">
              <div className="otp-row">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    className={`otp-box ${digit ? 'filled' : ''}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)}
                  />
                ))}
              </div>
            </div>

            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12, fontWeight: 500, textAlign: 'center' }}>{error}</div>}

            <button
              id="login-verify-otp"
              className="btn btn-primary btn-full"
              onClick={verifyOtp}
              disabled={loading || otp.join('').length < 4}
              style={{ fontSize: 15, height: 52, borderRadius: 'var(--r-lg)', marginBottom: 12 }}
            >
              {loading ? 'Verifying...' : 'Verify करें ✓'}
            </button>

            <button
              onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-lo)', fontSize: 13, width: '100%', cursor: 'pointer', textAlign: 'center', padding: 8 }}
            >
              ← नंबर बदलें
            </button>

            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-lo)' }}>
              OTP नहीं आया?{' '}
              <span style={{ color: 'var(--g700)', fontWeight: 600, cursor: 'pointer' }} onClick={sendOtp}>
                Resend करें
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
