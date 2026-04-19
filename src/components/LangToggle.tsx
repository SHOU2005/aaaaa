/**
 * LangToggle — Floating EN / हिं pill switcher
 * Can be placed in any page header.
 * Calls setLang from LangContext so the entire app re-renders.
 */
import React from 'react';
import { useLang } from '../i18n/useT';

export function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();
  const isHi = lang === 'hi';

  return (
    <button
      onClick={() => setLang(isHi ? 'en' : 'hi')}
      title={isHi ? 'Switch to English' : 'हिन्दी में जाएं'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 0,
        background: 'rgba(255,255,255,0.15)',
        border: '1.5px solid rgba(255,255,255,0.3)',
        borderRadius: 999, padding: 0, cursor: 'pointer',
        overflow: 'hidden', height: 30, flexShrink: 0,
        ...style,
      }}
    >
      {/* EN pill */}
      <span style={{
        padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
        fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
        background: !isHi ? '#fff' : 'transparent',
        color: !isHi ? '#1B6B3A' : 'rgba(255,255,255,0.6)',
        borderRadius: '999px 0 0 999px',
        transition: 'all 0.2s',
      }}>EN</span>
      {/* HI pill */}
      <span style={{
        padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
        fontSize: 11, fontWeight: 700,
        background: isHi ? '#fff' : 'transparent',
        color: isHi ? '#1B6B3A' : 'rgba(255,255,255,0.6)',
        borderRadius: '0 999px 999px 0',
        transition: 'all 0.2s',
      }}>हिं</span>
    </button>
  );
}

/** Dark-mode variant for use on white/cream backgrounds */
export function LangToggleDark({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();
  const isHi = lang === 'hi';

  return (
    <button
      onClick={() => setLang(isHi ? 'en' : 'hi')}
      title={isHi ? 'Switch to English' : 'हिन्दी में जाएं'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 0,
        background: '#F1F2EE',
        border: '1.5px solid #D1D5DB',
        borderRadius: 999, padding: 0, cursor: 'pointer',
        overflow: 'hidden', height: 30, flexShrink: 0,
        ...style,
      }}
    >
      <span style={{
        padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
        fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
        background: !isHi ? '#1B6B3A' : 'transparent',
        color: !isHi ? '#fff' : '#6B7280',
        borderRadius: '999px 0 0 999px',
        transition: 'all 0.2s',
      }}>EN</span>
      <span style={{
        padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center',
        fontSize: 11, fontWeight: 700,
        background: isHi ? '#1B6B3A' : 'transparent',
        color: isHi ? '#fff' : '#6B7280',
        borderRadius: '0 999px 999px 0',
        transition: 'all 0.2s',
      }}>हिं</span>
    </button>
  );
}
