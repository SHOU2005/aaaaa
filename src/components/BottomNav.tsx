import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useT } from '../i18n/useT';

// Premium SVG icons — no emoji
const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.5z"/>
    {filled && <path d="M9 21V12h6v9"/>}
    {!filled && <polyline points="9 21 9 12 15 12 15 21"/>}
  </svg>
);

const BriefcaseIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {filled
      ? <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M12 13v4M10 15h4"/>
      : <>
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
          <line x1="10" y1="14" x2="14" y2="14"/>
        </>
    }
  </svg>
);

const PeopleIcon = ({ filled }: { filled: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {filled
      ? <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2h16zM9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      : <>
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </>
    }
  </svg>
);

const ClipboardIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {filled
      ? <path d="M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2h-4M9 2a2 2 0 002 2h2a2 2 0 002-2M9 2a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
      : <>
          <path d="M9 2H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2h-4"/>
          <path d="M9 2a2 2 0 012-2h2a2 2 0 012 2"/>
          <path d="M9 2a2 2 0 002 2h2a2 2 0 002-2"/>
          <path d="M9 12l2 2 4-4"/>
        </>
    }
  </svg>
);

const PersonIcon = ({ filled }: { filled: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    {filled
      ? <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2h16zM12 11a4 4 0 100-8 4 4 0 000 8z"/>
      : <>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </>
    }
  </svg>
);

type NavItem = { to: string; label: string; Icon: React.FC<{ filled: boolean }> } | null;

const ITEMS: NavItem[] = [
  { to: '/home',         label: 'Home',    Icon: HomeIcon },
  { to: '/jobs',         label: 'Jobs',    Icon: BriefcaseIcon },
  null, // FAB (community)
  { to: '/applications', label: 'Status',  Icon: ClipboardIcon },
  { to: '/profile',      label: 'Profile', Icon: PersonIcon },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const t = useT();
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + '/');
  // Translated labels keyed to each route
  const labels: Record<string, string> = {
    '/home':         t('nav.home'),
    '/jobs':         t('nav.jobs'),
    '/applications': t('nav.status'),
    '/profile':      t('nav.profile'),
  };

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      height: `calc(var(--nav-h) + var(--bot-pad))`,
      paddingBottom: 'var(--bot-pad)',
      background: '#fff',
      borderTop: '1px solid #EAEEED',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      alignItems: 'center',
      zIndex: 200,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
    }}>
      {ITEMS.map((item, i) =>
        item === null ? (
          // FAB Community
          <div key="fab" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/community" style={{ textDecoration: 'none' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 18,
                background: 'linear-gradient(145deg, #1B6B3A, #168448)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(27,107,58,0.4), 0 1px 4px rgba(27,107,58,0.2)',
                marginTop: -18,
                border: '3px solid #fff',
              }}>
                <PeopleIcon filled={isActive('/community')} />
              </div>
            </Link>
          </div>
        ) : (
          <Link
            key={item.to}
            to={item.to}
            style={{
              textDecoration: 'none',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '4px 0',
              color: isActive(item.to) ? '#1B6B3A' : '#9CA3AF',
              transition: 'color 0.2s',
            }}
          >
            <div style={{
              width: 36, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10,
              background: isActive(item.to) ? '#ECFDF5' : 'transparent',
              transition: 'background 0.2s',
            }}>
              <item.Icon filled={isActive(item.to)} />
            </div>
            <span style={{ fontSize: 10, fontWeight: isActive(item.to) ? 700 : 500, letterSpacing: 0.1, lineHeight: 1 }}>
              {labels[item.to] ?? item.label}
            </span>
          </Link>
        )
      )}
    </nav>
  );
}
