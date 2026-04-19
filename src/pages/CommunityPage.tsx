import React, { useState } from 'react';
// ── CommunityPage — Premium Redesign ──────────────────────────────────────────
import { Link, useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { PostCard } from '../components/PostCard';
import { getCommunities, getPosts, getWorker } from '../data/store';

const TRENDING = ['#GuardJobs', '#DelhiNCR', '#NewOpening', '#Housekeeping', '#Delivery', '#Security'];

const FAKE_EVENTS = [
  {
    id: 'e1', day: '24', month: 'APR',
    title: 'Job Mela — Gurgaon Sector 29',
    location: 'DLF Cyber Hub, Gurgaon',
    going: 142, type: '🏢 Hiring Drive',
    badge: 'Free Entry',
  },
  {
    id: 'e2', day: '28', month: 'APR',
    title: 'Security Guard Training Camp',
    location: 'Janakpuri Community Centre, Delhi',
    going: 67, type: '🎓 Training',
    badge: '₹200 Stipend',
  },
  {
    id: 'e3', day: '02', month: 'MAY',
    title: 'Delivery Partners Meetup',
    location: 'Connaught Place, New Delhi',
    going: 210, type: '🛵 Networking',
    badge: 'Lunch Included',
  },
];

const FAKE_STORIES = [
  { id: 's1', name: 'Ramesh',  color: '#168448', seen: false },
  { id: 's2', name: 'Priya',   color: '#7C3AED', seen: false },
  { id: 's3', name: 'Suresh',  color: '#DC2626', seen: true  },
  { id: 's4', name: 'Meena',   color: '#0891B2', seen: true  },
  { id: 's5', name: 'Vikram',  color: '#EA580C', seen: true  },
  { id: 's6', name: 'Lata',    color: '#2563EB', seen: true  },
];

type Tab = 'feed' | 'communities' | 'events';

export function CommunityPage() {
  const navigate        = useNavigate();
  const worker          = getWorker();
  const communities     = getCommunities ? getCommunities() : [];
  const allPosts        = getPosts().slice(0, 12);
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [activeTrend, setActiveTrend] = useState<string | null>(null);
  const [feedKey, setFeedKey] = useState(0);

  const initials = (worker.name ?? 'W').charAt(0).toUpperCase();

  return (
    <div style={{ paddingBottom: 'calc(var(--nav-h) + var(--bot-pad) + 12px)' }}>

      {/* ─── Header ─── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 16px) 16px 0',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 22, color: '#fff' }}>समुदाय 👥</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {communities.length} Communities · {allPosts.length} Posts
            </div>
          </div>
          <Link
            to="/community/compose"
            style={{
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 'var(--r-md)', padding: '8px 14px', color: '#fff',
              textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ✏️ Post
          </Link>
        </div>

        {/* 3-tab bar */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--r-lg)', padding: 3, gap: 2 }}>
          {([['feed', '📰 Feed'], ['communities', '🏘️ Groups'], ['events', '🗓️ Events']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setActiveTab(v)} style={{
              flex: 1, padding: '9px 0', borderRadius: 'calc(var(--r-lg) - 2px)',
              background: activeTab === v ? '#fff' : 'transparent',
              border: 'none', color: activeTab === v ? 'var(--g700)' : 'rgba(255,255,255,0.75)',
              fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div style={{ padding: '16px 16px 0' }}>

        {/* ══════════ FEED TAB ══════════ */}
        {activeTab === 'feed' && (
          <div className="anim-fade">

            {/* Stories Row */}
            <div className="section">
              <div className="hscroll" style={{ gap: 12, paddingBottom: 4 }}>
                {/* Add Story (self) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="story-avatar" style={{ background: 'var(--g700)' }}>{initials}</div>
                    <div style={{
                      position: 'absolute', bottom: -2, right: -2,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--g600)', border: '2px solid #fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', fontWeight: 700,
                    }}>+</div>
                  </div>
                  <span className="story-name">आप</span>
                </div>

                {/* Member stories */}
                {FAKE_STORIES.map(s => (
                  <div key={s.id} className="story-bubble">
                    <div className={`story-ring ${s.seen ? 'seen' : ''}`}>
                      <div className="story-avatar" style={{ background: s.color }}>
                        {s.name.charAt(0)}
                      </div>
                    </div>
                    <span className="story-name">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="section">
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14, color: 'var(--text-hi)', marginBottom: 8 }}>
                🔥 Trending Topics
              </div>
              <div className="hscroll" style={{ gap: 6, paddingBottom: 2 }}>
                {TRENDING.map(t => (
                  <button key={t} className={`trending-chip ${activeTrend === t ? 'active' : ''}`} onClick={() => setActiveTrend(activeTrend === t ? null : t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Spotlight */}
            {communities[0] && (
              <div className="section">
                <Link to={`/community/join/${communities[0].id}`} style={{ textDecoration: 'none' }}>
                  <div className="spotlight-card">
                    <div className="spotlight-eyebrow">
                      <span className="live-dot" style={{ fontSize: 9 }} />
                      Featured Community
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ fontSize: 40 }}>{communities[0].icon ?? '👥'}</div>
                      <div style={{ flex: 1 }}>
                        <div className="spotlight-name">{communities[0].name}</div>
                        <div className="spotlight-desc">{communities[0].description ?? 'Join karo aur ek doosre ki help karo!'}</div>
                        <div className="spotlight-meta">
                          <span className="spotlight-chip">👥 {(communities[0].memberCount ?? 0).toLocaleString()} members</span>
                          <span className="spotlight-chip">💬 Active daily</span>
                        </div>
                      </div>
                    </div>
                    <button style={{
                      marginTop: 12, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: 'var(--r-sm)', padding: '7px 16px', color: '#fff',
                      fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%',
                    }}>
                      Join करें → 
                    </button>
                  </div>
                </Link>
              </div>
            )}

            {/* Community Join Strip */}
            {communities.length > 0 && (
              <div className="section">
                <div className="section-head">
                  <span className="section-title" style={{ fontSize: 14 }}>Communities</span>
                  <button onClick={() => setActiveTab('communities')} className="section-link">सब देखें →</button>
                </div>
                <div className="hscroll">
                  {communities.map((c: any) => (
                    <Link key={c.id} to={`/community/join/${c.id}`} className={`comm-card ${c.joined ? 'joined' : ''}`}>
                      <div className="comm-emoji">{c.icon}</div>
                      <div className="comm-name">{c.name}</div>
                      <div className="comm-count">{c.memberCount?.toLocaleString() ?? '0'} members</div>
                      {c.joined && <div className="comm-joined-indicator" />}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Feed */}
            <div className="section">
              <div className="section-head">
                <span className="section-title" style={{ fontSize: 14 }}>
                  <span className="live-dot" />
                  Latest Posts
                </span>
              </div>

              {allPosts.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">💬</div>
                  <div className="empty-title">अभी कोई post नहीं</div>
                  <div className="empty-sub">पहला post आप करें!</div>
                  <Link to="/community/compose" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                    Post लिखें ✏️
                  </Link>
                </div>
              ) : (
                allPosts.map((post: any) => (
                  <PostCard key={`${post.id}-${feedKey}`} post={post} onUpdate={() => setFeedKey(k => k + 1)} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════ COMMUNITIES TAB ══════════ */}
        {activeTab === 'communities' && (
          <div className="anim-fade">
            <div className="section">
              {communities.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🏘️</div>
                  <div className="empty-title">कोई community नहीं</div>
                  <div className="empty-sub">जल्द ही communities आएंगी!</div>
                </div>
              ) : (
                communities.map((c: any) => (
                  <Link key={c.id} to={`/community/join/${c.id}`} style={{ textDecoration: 'none' }}>
                    <div className="card card-hoverable" style={{ marginBottom: 10, padding: '14px 16px', display: 'block' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 54, height: 54, borderRadius: 'var(--r-lg)',
                          background: 'var(--g50)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 28, flexShrink: 0,
                          border: '1px solid var(--g100)',
                        }}>
                          {c.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-hi)' }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 2 }}>{c.description}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 5 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-lo)' }}>👥 {c.memberCount?.toLocaleString()} members</span>
                            <span style={{ fontSize: 11, color: 'var(--g700)', fontWeight: 600 }}>● Active</span>
                          </div>
                        </div>
                        <div>
                          {c.joined
                            ? <span className="badge badge-green">✓ Joined</span>
                            : <span className="badge badge-grey">Join →</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════ EVENTS TAB ══════════ */}
        {activeTab === 'events' && (
          <div className="anim-fade">
            <div className="section">
              <div style={{
                background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                border: '1.5px solid #BFDBFE', borderRadius: 'var(--r-xl)',
                padding: 14, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center',
              }}>
                <span style={{ fontSize: 28 }}>📣</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1D4ED8' }}>Upcoming Events</div>
                  <div style={{ fontSize: 12, color: '#3B82F6' }}>Job Melas, Trainings & Meetups आपके पास</div>
                </div>
              </div>

              {FAKE_EVENTS.map(ev => (
                <div key={ev.id} className="event-card">
                  <div className="event-date-box">
                    <div className="event-day">{ev.day}</div>
                    <div className="event-month">{ev.month}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-lo)', fontWeight: 600 }}>{ev.type}</span>
                      <span className="badge badge-green" style={{ fontSize: 10 }}>{ev.badge}</span>
                    </div>
                    <div className="event-title">{ev.title}</div>
                    <div className="event-loc">📍 {ev.location}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className="event-going">👥 {ev.going} going</span>
                      <button style={{
                        background: 'var(--g700)', color: '#fff', border: 'none',
                        borderRadius: 'var(--r-sm)', padding: '5px 12px', fontSize: 12,
                        fontWeight: 700, cursor: 'pointer',
                      }}>
                        Register →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{
                padding: '16px', background: 'var(--n50)', borderRadius: 'var(--r-xl)',
                border: '1px dashed var(--border)', textAlign: 'center',
                color: 'var(--text-lo)', fontSize: 13,
              }}>
                🗓️ और Events आएंगे — Notifications ON रखें
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── FAB Compose ── */}
      <Link to="/community/compose" style={{
        position: 'fixed', bottom: 'calc(var(--nav-h) + var(--bot-pad) + 16px)', right: 20,
        width: 52, height: 52, borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, var(--g600), var(--g800))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, textDecoration: 'none',
        boxShadow: '0 4px 20px rgba(22,132,72,0.4)',
        zIndex: 50, animation: 'glow 3s ease-in-out infinite',
      }}>
        ✏️
      </Link>

      <BottomNav />
    </div>
  );
}
