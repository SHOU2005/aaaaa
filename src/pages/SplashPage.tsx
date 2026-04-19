import React, { useEffect, useState } from 'react';
// ── SplashPage ─────────────────────────────────────────────────────────────────
import { useNavigate } from 'react-router-dom';

export function SplashPage() {
  const navigate = useNavigate();
  const [dotIndex, setDotIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Appear after tiny delay for smooth mount
    const t0 = setTimeout(() => setVisible(true), 50);

    // Animate loading dots
    const ticker = setInterval(() => {
      setDotIndex(i => (i + 1) % 3);
    }, 600);

    // Auto-redirect after 2.6 s
    const t1 = setTimeout(() => {
      clearInterval(ticker);
      navigate('/login');
    }, 2600);

    return () => { clearTimeout(t0); clearTimeout(t1); clearInterval(ticker); };
  }, [navigate]);

  return (
    <div
      className="splash-root"
      onClick={() => navigate('/login')}
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
    >
      {/* Decorative background circles */}
      <div className="splash-bg-circle" style={{ width: 500, height: 500, top: -180, right: -180 }} />
      <div className="splash-bg-circle" style={{ width: 300, height: 300, bottom: -80, left: -80 }} />
      <div className="splash-bg-circle" style={{ width: 180, height: 180, top: '30%', left: -60 }} />

      {/* Logo & branding */}
      <div className="splash-logo-wrap">
        {/* Icon */}
        <div
          className="splash-icon"
          style={{ animation: visible ? 'bounceIn 0.6s cubic-bezier(0.22,1,0.36,1) both, float 3s 0.6s ease-in-out infinite' : 'none' }}
        >
          📍
        </div>

        {/* Brand name */}
        <div style={{ textAlign: 'center' }}>
          <div
            className="splash-brand"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(16px)',
              transition: 'opacity 0.4s 0.1s ease, transform 0.4s 0.1s ease',
            }}
          >
            Switch
          </div>
          <div
            className="splash-tagline"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(10px)',
              transition: 'opacity 0.4s 0.2s ease, transform 0.4s 0.2s ease',
            }}
          >
            Ghar ke Pass Job
          </div>
          <div
            className="splash-sub"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.4s 0.35s ease',
            }}
          >
            India's #1 Local Job Network
          </div>
        </div>
      </div>

      {/* Animated dots */}
      <div
        className="splash-dots"
        style={{ animation: visible ? 'fadeIn 0.5s 0.8s ease both' : 'none' }}
      >
        {[0, 1, 2].map(i => (
          <div key={i} className={`splash-dot ${dotIndex === i ? 'active' : ''}`} />
        ))}
      </div>

      {/* Tap hint */}
      <div style={{
        position: 'absolute', bottom: 48, fontSize: 12,
        color: 'rgba(255,255,255,0.3)', letterSpacing: 1,
        animation: visible ? 'fadeIn 0.5s 1.2s ease both' : 'none',
      }}>
        Tap anywhere to continue
      </div>
    </div>
  );
}
