import React from 'react';
// ── BottomNav — Premium Pill Design ───────────────────────────────────────────
import { Link, useLocation } from 'react-router-dom';

const ITEMS = [
  { to: '/home',         icon: '🏠', label: 'Home' },
  { to: '/jobs',         icon: '💼', label: 'Jobs' },
  null, // FAB slot
  { to: '/applications', icon: '📋', label: 'Status' },
  { to: '/profile',      icon: '👤', label: 'Profile' },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const active = (to: string) => pathname === to || pathname.startsWith(to + '/');

  return (
    <nav className="bottom-nav">
      {ITEMS.map((item, i) =>
        item === null ? (
          <div key="fab" className="nav-fab-slot">
            <Link to="/community" className="nav-fab" title="Community">
              👥
            </Link>
          </div>
        ) : (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${active(item.to) ? 'active' : ''}`}
          >
            <div className="nav-pill">
              <span className="nav-icon">{item.icon}</span>
            </div>
            <span className="nav-label">{item.label}</span>
          </Link>
        )
      )}
    </nav>
  );
}
