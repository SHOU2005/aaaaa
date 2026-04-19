import React, { useState } from 'react';
// ── CommunityJoinPage — Premium Community Onboarding ──────────────────────────
import { useParams, useNavigate } from 'react-router-dom';
import { getCommunity, getWorker, getAllWorkers, joinCommunity, initials } from '../data/store';

const AVATAR_COLORS = ['#168448','#2563EB','#7C3AED','#DC2626','#D97706','#0891B2','#DB2777','#059669'];

const ACTIVITY_LEVELS = [
  { label: 'कल 12 posts', icon: '📝' },
  { label: '245 हफ्ते members', icon: '👥' },
  { label: 'Daily active', icon: '🟢' },
];

const FAKE_POSTS = [
  { text: 'Security guard ki job kab se start hogi?', author: 'Ramesh K.', time: '2 घंटे पहले', likes: 8 },
  { text: 'Sector 45 mein bahut achha experience raha 🙏', author: 'Suresh V.', time: '5 घंटे पहले', likes: 14 },
  { text: 'New opening hai kya is month?', author: 'Priya D.', time: '1 दिन पहले', likes: 3 },
];

export function CommunityJoinPage() {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const community   = getCommunity(id!);
  const worker      = getWorker();
  const allWorkers  = getAllWorkers();
  const [joining,   setJoining] = useState(false);
  const [joined,    setJoined]  = useState(false);

  if (!community) return (
    <div className="empty" style={{ minHeight: '100dvh' }}>
      <div className="empty-icon">👥</div>
      <div className="empty-title">Community नहीं मिली</div>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate('/community')}>← वापस जाएं</button>
    </div>
  );

  const alreadyJoined = joined || worker.communityIds.includes(community.id);
  const members       = allWorkers.filter(w => community.memberIds.includes(w.id)).slice(0, 6);
  const memberCount   = community.memberIds?.length || 0;

  const handleJoin = () => {
    setJoining(true);
    setTimeout(() => {
      joinCommunity(community.id);
      setJoining(false);
      setJoined(true);
    }, 1200);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)', paddingBottom: 24 }}>

      {/* ── HERO ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        {/* Back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <button onClick={() => navigate(-1)} className="icon-btn icon-btn--white">←</button>
          {!alreadyJoined && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Tap to join & read posts</div>
          )}
        </div>

        {/* Community icon + name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--r-xl)',
            background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(8px)',
          }}>
            {community.avatar || community.icon || '👥'}
          </div>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 6 }}>
            {community.name}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: 280, margin: '0 auto', marginBottom: 16 }}>
            {community.description}
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '👥', val: `${memberCount} members` },
              { icon: '📝', val: '12 posts/day' },
              { icon: '🟢', val: 'Very Active' },
            ].map(s => (
              <div key={s.val} style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 'var(--r-lg)', padding: '6px 14px',
                fontSize: 12, color: '#fff', fontWeight: 600,
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                <span>{s.icon}</span> {s.val}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '0 16px', marginTop: -12 }}>

        {/* JOIN / JOINED card */}
        {!alreadyJoined ? (
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
            padding: '20px 16px', marginBottom: 14,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 17, color: 'var(--text-hi)', marginBottom: 4 }}>
                इस community में join करें
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-lo)' }}>
                Job tips, updates, और local workers से connect करें
              </div>
            </div>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn btn-primary btn-full"
              style={{ height: 52, fontSize: 16, borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden' }}
            >
              {joining ? (
                <span style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ animation: 'pulse 1s ease-in-out infinite' }}>⌛</span> Joining…
                </span>
              ) : '⚡ Join करें — Free!'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-lo)' }}>
              🔒 Free · No spam · Leave anytime
            </div>
          </div>
        ) : (
          // ── JOINED success card ──
          <div style={{
            background: 'linear-gradient(135deg, var(--g50), var(--g100))',
            borderRadius: 'var(--r-xl)', border: '1px solid var(--g200)',
            padding: '20px 16px', marginBottom: 14, textAlign: 'center',
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: 'var(--g700)' }}>
              Welcome to the Community!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>
              {community.name} में आप join हो गए
            </div>
            <button
              onClick={() => navigate('/community')}
              className="btn btn-primary"
              style={{ marginTop: 14, width: '100%', height: 48 }}
            >
              Feed देखें →
            </button>
          </div>
        )}

        {/* ── Members Preview ── */}
        {members.length > 0 && (
          <div className="card" style={{ marginBottom: 14, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15 }}>👥 Members</div>
              <span style={{ fontSize: 12, color: 'var(--g700)', fontWeight: 600 }}>
                +{Math.max(0, memberCount - members.length)} more
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {members.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div className="avatar av-md" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {initials(m.name)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-lo)', textAlign: 'center', maxWidth: 52, fontWeight: 500 }}>
                    {m.name.split(' ')[0]}
                  </div>
                </div>
              ))}
              {memberCount > members.length && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div className="avatar av-md" style={{ background: 'var(--n200)', color: 'var(--text-mid)', fontSize: 12 }}>
                    +{memberCount - members.length}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-lo)' }}>more</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Recent Activity preview ── */}
        <div className="card" style={{ marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--divider)' }}>
            💬 Recent Discussions
          </div>
          {FAKE_POSTS.map((p, i) => (
            <div key={i} style={{
              padding: '12px 16px',
              borderBottom: i < FAKE_POSTS.length - 1 ? '1px solid var(--divider)' : 'none',
              filter: alreadyJoined ? 'none' : i > 0 ? 'blur(2px)' : 'none',
              pointerEvents: alreadyJoined ? 'auto' : 'none',
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 13, background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                  {p.author.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-hi)', lineHeight: 1.5, marginBottom: 4 }}>{p.text}</div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--text-lo)' }}>
                    <span>👤 {p.author}</span>
                    <span>🕐 {p.time}</span>
                    <span>❤️ {p.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!alreadyJoined && (
            <div style={{
              padding: '10px 16px', background: 'var(--g50)', borderTop: '1px solid var(--g100)',
              textAlign: 'center', fontSize: 12, color: 'var(--g800)', fontWeight: 600,
            }}>
              🔒 Join करें और सभी posts देखें
            </div>
          )}
        </div>

        {/* ── Why join? ── */}
        <div className="card" style={{ marginBottom: 14, padding: '14px 16px' }}>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            🌟 Join करने के फायदे
          </div>
          {[
            { icon: '💡', t: 'Job Tips & Advice', sub: 'Local workers से tips पाएं' },
            { icon: '💼', t: 'Exclusive Job Alerts', sub: 'पहले मिलेंगी नई jobs' },
            { icon: '🤝', t: 'Referral Network', sub: 'दोस्त refer करके कमाएं' },
            { icon: '📅', t: 'Events & Training', sub: 'Local job melas की info' },
          ].map((b, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 'var(--r-sm)', background: 'var(--g50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>{b.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-hi)' }}>{b.t}</div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 1 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom join CTA */}
        {!alreadyJoined && (
          <button
            onClick={handleJoin}
            disabled={joining}
            className="btn btn-primary btn-full"
            style={{ height: 52, fontSize: 15, borderRadius: 'var(--r-lg)' }}
          >
            {joining ? '⌛ Joining…' : `🚀 Join ${community.name}`}
          </button>
        )}
      </div>
    </div>
  );
}
