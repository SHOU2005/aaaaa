import React from 'react';
// ── Member Directory (Kutumb-style) ───────────────────────────────────────────
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { getAllWorkers, getWorker, getCaptains, initials } from '../data/store';

const TABS = [
  { id: 'all', label: 'सभी सदस्य' },
  { id: 'captains', label: 'Captain' },
  { id: 'available', label: '🟢 Available' },
  { id: 'myarea', label: 'मेरा इलाका' },
];

const AVATAR_COLORS = ['#1B6B3A', '#1E6FBF', '#7C3AED', '#E88C2A', '#DC3545', '#059669', '#DB2777', '#0891B2'];

export function MembersPage() {
  const me = getWorker();
  const allWorkers = getAllWorkers();
  const captains = getCaptains();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  let members: Array<{ id: string; name: string; regNumber: string; city: string; sector: string; bio: string; jobTypes: string[]; availability?: string; isCaptain?: boolean }> = [];

  if (tab === 'captains') {
    members = captains.map(c => ({ id: c.id, name: c.name, regNumber: c.regNumber, city: 'Gurgaon', sector: '', bio: `${c.placements} placements`, jobTypes: [], isCaptain: true }));
  } else {
    members = allWorkers.map(w => ({ id: w.id, name: w.name, regNumber: w.regNumber, city: w.city, sector: w.sector, bio: w.bio, jobTypes: w.jobTypes, availability: w.availability }));
    if (tab === 'available') members = members.filter(m => m.availability === 'available');
    if (tab === 'myarea') members = members.filter(m => m.sector === me.sector || m.city === me.city);
  }

  if (query) {
    const q = query.toLowerCase();
    members = members.filter(m => m.name.toLowerCase().includes(q) || m.jobTypes.some(jt => jt.toLowerCase().includes(q)));
  }

  return (
    <div className="page">
      <div className="topbar" style={{ paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 22, color: '#fff' }}>Switch Members</div>
        </div>
        <div className="search-bar" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="नाम या skill खोजें…"
            style={{ background: 'none', border: 'none', outline: 'none', flex: 1, color: '#fff', fontFamily: 'inherit', fontSize: 14 }}
          />
        </div>
      </div>

      {/* Refer a friend CTA */}
      <div style={{ margin: '14px 16px 0' }}>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Switch पर जुड़ो! मेरे invite link से: https://gharpaasjob.app/join?ref=${me.referralCode}\nयह एक job platform है जो आपके घर के पास naukri dhundhta hai.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--whatsapp)', color: '#fff', borderRadius: 12, padding: '12px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
        >
          📲 दोस्त को Invite करें — दोनों को ₹500 मिलेगा!
        </a>
      </div>

      {/* Tabs */}
      <div className="filter-scroll" style={{ paddingTop: 14 }}>
        {TABS.map(t => (
          <button key={t.id} className={`filter-chip ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label} {t.id === 'all' ? `(${allWorkers.length})` : t.id === 'captains' ? `(${captains.length})` : ''}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <div className="empty-title">कोई member नहीं</div>
          </div>
        ) : (
          members.map((m, idx) => {
            const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const isMe = m.id === me.id;
            return (
              <Link key={m.id} to={`/profile/${m.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card--shadow ripple" style={{ marginBottom: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', border: isMe ? '1.5px solid var(--green-border)' : '' }}>
                  <div className="avatar avatar--md" style={{ background: color, flexShrink: 0 }}>
                    {initials(m.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>{m.name}</div>
                      {isMe && <span className="pill pill--green" style={{ fontSize: 10 }}>आप</span>}
                      {m.isCaptain && <span className="pill pill--blue" style={{ fontSize: 10 }}>⭐ Captain</span>}
                      {m.availability === 'available' && !m.isCaptain && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                      {m.city.toUpperCase()}{m.sector ? `, ${m.sector}` : ''}
                    </div>
                    <div className="pill pill--reg" style={{ marginTop: 4, fontSize: 11 }}>{m.regNumber}</div>
                    {!m.isCaptain && m.jobTypes.length > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                        {m.jobTypes.join(' · ')}
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                      {m.bio.length > 80 ? m.bio.slice(0, 80) + '…' : m.bio}
                    </div>
                  </div>
                  <div style={{ color: 'var(--green-dark)', fontSize: 18, alignSelf: 'center' }}>›</div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
