import React, { useState } from 'react';
// ── PostDetailPage — Premium Redesign ────────────────────────────────────────
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, getWorkerById, getCaptain, addComment, getWorker, timeAgo, initials, toggleLike } from '../data/store';

const AVATAR_COLORS = ['#1B6B3A', '#1E6FBF', '#7C3AED', '#E88C2A', '#DC3545', '#059669'];

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  job_available:   { label: 'Job Available',     color: '#1B6B3A', bg: '#E8F7EE', icon: '💼' },
  looking_for_job: { label: 'खोज रहे हैं',        color: '#1E6FBF', bg: '#EBF3FD', icon: '🔍' },
  tip:             { label: 'Job Tip',            color: '#E88C2A', bg: '#FEF3E2', icon: '💡' },
  success_story:   { label: 'Success Story',      color: '#7C3AED', bg: '#F5F3FF', icon: '🎉' },
  employer_review: { label: 'Employer Review',    color: '#6B21A8', bg: '#F3E8FF', icon: '⭐' },
  salary_review:   { label: 'Salary Info',        color: '#CA8A04', bg: '#FEFCE8', icon: '💰' },
  interview_tip:   { label: 'Interview Tip',      color: '#0891B2', bg: '#E0F2FE', icon: '📋' },
  voice:           { label: 'Voice Post',         color: '#1B6B3A', bg: '#E8F7EE', icon: '🎙️' },
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ fontSize: 20, color: i < rating ? '#F59E0B' : '#D1D5DB' }}>
          {i < rating ? '★' : '☆'}
        </span>
      ))}
      <span style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: '#F59E0B', marginLeft: 6, lineHeight: 1.3 }}>
        {rating}/5
      </span>
    </div>
  );
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState(() => getPost(id!));
  const [commentText, setCommentText] = useState('');
  const me = getWorker();
  const [liked, setLiked] = useState(() => post ? post.likes.includes(me.id) : false);
  const [likeCount, setLikeCount] = useState(() => post?.likes.length ?? 0);
  const [playing, setPlaying] = useState(false);

  const refresh = () => setPost(getPost(id!));

  if (!post) return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, color: 'var(--text-hi)' }}>Post नहीं मिली</div>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'var(--g700)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}
      >
        वापस जाएं
      </button>
    </div>
  );

  const worker = getWorkerById(post.authorId);
  const captain = !worker ? getCaptain(post.authorId) : null;
  const authorName = post.anonymous ? 'Anonymous' : (worker?.name || captain?.name || 'Switch');
  const authorReg = post.anonymous ? '' : (worker?.regNumber || captain?.regNumber || '');
  const authorInitials = post.anonymous ? '?' : initials(authorName);
  const avatarColor = AVATAR_COLORS[post.authorId.charCodeAt(post.authorId.length - 1) % AVATAR_COLORS.length];

  const typeMeta = TYPE_META[post.type] || TYPE_META['tip'];

  const handleLike = () => {
    toggleLike(post.id);
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    refresh();
  };

  const submitComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
    refresh();
  };

  const shareMsg = encodeURIComponent(`Switch Community: "${post.content.slice(0, 80)}…" — ${typeMeta.icon} ${typeMeta.label}`);
  const shareHref = `https://wa.me/?text=${shareMsg}`;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)', paddingBottom: 80 }}>

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
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.1 }}>
              {typeMeta.icon} {typeMeta.label}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>
              {post.comments.length} टिप्पणियाँ · {likeCount} Likes
            </div>
          </div>
          <a
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366', color: '#fff', borderRadius: 'var(--r-md)',
              padding: '7px 14px', fontSize: 12, fontWeight: 700,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            📲 Share
          </a>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ─── Post Card ─── */}
        <div style={{
          background: '#fff', borderRadius: 'var(--r-xl)',
          border: '1px solid var(--border)', overflow: 'hidden',
          boxShadow: 'var(--sh-card-md)', marginBottom: 16,
        }}>
          {/* Type accent strip */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${typeMeta.color}, ${typeMeta.color}88)` }} />

          <div style={{ padding: '16px 16px 0' }}>
            {/* Author row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: post.anonymous ? '#9CA3AF' : avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 16,
              }}>
                {authorInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-hi)' }}>{authorName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {authorReg && <span style={{ color: 'var(--g700)', fontWeight: 700 }}>{authorReg}</span>}
                  {authorReg && <span>·</span>}
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
              <div style={{
                background: typeMeta.bg, color: typeMeta.color,
                borderRadius: 'var(--r-sm)', padding: '4px 10px',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {typeMeta.icon} {typeMeta.label}
              </div>
            </div>

            {/* Content */}
            <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-hi)', marginBottom: 14 }}>
              {post.content}
            </div>

            {/* ─── Voice post player ─── */}
            {post.type === 'voice' && post.voiceUrl && (
              <div style={{
                background: 'var(--g50)', border: '1.5px solid var(--g100)',
                borderRadius: 'var(--r-lg)', padding: '12px 14px', marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <button
                  onClick={() => setPlaying(p => !p)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: playing ? 'var(--g700)' : 'var(--g50)',
                    border: '2px solid var(--g700)',
                    color: playing ? '#fff' : 'var(--g700)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  {playing ? '⏸' : '▶'}
                </button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  {Array.from({ length: 28 }, (_, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 99,
                      height: `${8 + Math.abs(Math.sin(i * 0.7 + 1)) * 22}px`,
                      background: playing ? 'var(--g600)' : 'var(--g200)',
                      flexShrink: 0,
                      animation: playing ? `wave 0.8s ease-in-out ${i * 0.04}s infinite alternate` : 'none',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 13, color: 'var(--g700)', flexShrink: 0 }}>
                  0:{(post.voiceDuration ?? 0).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {post.transcript && (
              <div style={{
                fontSize: 13, color: 'var(--text-lo)', fontStyle: 'italic',
                background: 'var(--n50)', borderRadius: 'var(--r-sm)',
                padding: '8px 12px', marginBottom: 14,
                borderLeft: '3px solid var(--g200)',
              }}>
                "{post.transcript}"
              </div>
            )}

            {/* ─── Job Available card ─── */}
            {post.jobRef && (
              <div style={{
                background: 'linear-gradient(135deg, #0D3D21, #168448)',
                borderRadius: 'var(--r-lg)', padding: '14px 16px',
                marginBottom: 14, overflow: 'hidden', position: 'relative',
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: 4 }}>💼 JOB AVAILABLE</div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 2 }}>
                  {post.jobRef.role}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 10 }}>
                  📍 {post.jobRef.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 28, color: '#fff', lineHeight: 1 }}>
                    {post.jobRef.salary}
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>/माह</span>
                </div>
                <a
                  href={`https://wa.me/91${post.jobRef.captainMobile}?text=${encodeURIComponent(`नमस्कार ${post.jobRef.captainName} जी! Switch पर "${post.jobRef.role}" (${post.jobRef.location}) की नौकरी देखी। जानकारी चाहिए।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#25D366', color: '#fff',
                    borderRadius: 'var(--r-md)', padding: '10px 18px',
                    fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  💬 WhatsApp पर अप्लाई करें
                </a>
              </div>
            )}

            {/* ─── Employer Review card ─── */}
            {post.employerRef && (
              <div style={{
                background: 'var(--amber-bg)', border: '1.5px solid #FDE68A',
                borderRadius: 'var(--r-lg)', padding: '14px 16px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, color: '#92400E', fontWeight: 700, marginBottom: 6 }}>⭐ EMPLOYER REVIEW</div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 18, color: 'var(--text-hi)', marginBottom: 8 }}>
                  {post.employerRef.name}
                </div>
                <StarRow rating={post.employerRef.rating} />
                <div style={{
                  fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6,
                  marginTop: 10, paddingTop: 10, borderTop: '1px solid #FDE68A',
                }}>
                  "{post.employerRef.feedback}"
                </div>
              </div>
            )}

            {/* ─── Success Story header ─── */}
            {post.type === 'success_story' && !post.jobRef && (
              <div style={{
                background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                border: '1.5px solid #DDD6FE', borderRadius: 'var(--r-lg)',
                padding: '12px 16px', marginBottom: 14, textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
                <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14, color: '#6D28D9' }}>
                  Success Story
                </div>
                <div style={{ fontSize: 12, color: '#7C3AED', marginTop: 2 }}>
                  यह worker नौकरी पाने में सफल हुए
                </div>
              </div>
            )}

            {/* ─── Action bar ─── */}
            <div style={{ display: 'flex', gap: 8, padding: '14px 0', borderTop: '1px solid var(--divider)' }}>
              <button
                onClick={handleLike}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: liked ? '#FEE2E2' : 'var(--n50)',
                  border: `1.5px solid ${liked ? '#FCA5A5' : 'var(--border)'}`,
                  borderRadius: 'var(--r-sm)', padding: '7px 14px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  color: liked ? '#DC2626' : 'var(--text-lo)',
                }}
              >
                {liked ? '❤️' : '🤍'} {likeCount > 0 ? likeCount : ''} Helpful
              </button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--n50)', border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '7px 14px',
                fontSize: 13, fontWeight: 600, color: 'var(--text-lo)',
              }}>
                💬 {post.comments.length}
              </div>
              <a
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto',
                  background: '#E8F7EE', border: '1.5px solid var(--g200)',
                  borderRadius: 'var(--r-sm)', padding: '7px 14px',
                  fontSize: 13, fontWeight: 600, color: 'var(--g700)', textDecoration: 'none',
                }}
              >
                📲 WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* ─── Comments Section ─── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 16,
            color: 'var(--text-hi)', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            💬 टिप्पणियाँ
            {post.comments.length > 0 && (
              <span style={{
                background: 'var(--g700)', color: '#fff',
                borderRadius: 99, padding: '1px 8px', fontSize: 12, fontWeight: 700,
              }}>
                {post.comments.length}
              </span>
            )}
          </div>

          {post.comments.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '28px 0',
              background: '#fff', borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border)', marginBottom: 8,
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 15, color: 'var(--text-hi)' }}>
                पहला comment करें!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-lo)', marginTop: 4 }}>
                अपनी राय share करें
              </div>
            </div>
          )}

          {post.comments.map(c => {
            const cWorker = getWorkerById(c.authorId) || getCaptain(c.authorId);
            const cName = (cWorker as any)?.name || 'User';
            const cColor = AVATAR_COLORS[c.authorId.charCodeAt(c.authorId.length - 1) % AVATAR_COLORS.length];
            const isMe = c.authorId === me.id;
            return (
              <div key={c.id} style={{
                display: 'flex', gap: 10, marginBottom: 10,
                flexDirection: isMe ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: isMe ? 'var(--g700)' : cColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 13,
                }}>
                  {initials(cName)}
                </div>
                <div style={{
                  background: isMe ? 'var(--g50)' : '#fff',
                  borderRadius: isMe ? '14px 0 14px 14px' : '0 14px 14px 14px',
                  padding: '10px 13px', flex: 1,
                  border: `1px solid ${isMe ? 'var(--g100)' : 'var(--border)'}`,
                  boxShadow: 'var(--sh-card)',
                  maxWidth: '85%',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: isMe ? 'var(--g700)' : 'var(--text-hi)', marginBottom: 3 }}>
                    {isMe ? 'आप' : cName}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-hi)' }}>{c.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 4 }}>{timeAgo(c.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Fixed Comment Input ─── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: '#fff', borderTop: '1px solid var(--border)',
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom,0px))',
        display: 'flex', gap: 10, alignItems: 'center',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--g700)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14,
        }}>
          {initials(me.name)}
        </div>
        <input
          placeholder="Comment लिखें…"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitComment()}
          style={{
            flex: 1, height: 42, padding: '0 14px',
            background: 'var(--n50)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-lg)', outline: 'none',
            fontSize: 14, color: 'var(--text-hi)', fontFamily: 'DM Sans',
          }}
        />
        <button
          onClick={submitComment}
          disabled={!commentText.trim()}
          style={{
            background: commentText.trim() ? 'var(--g700)' : 'var(--n200)',
            color: '#fff', border: 'none',
            borderRadius: 'var(--r-md)', padding: '0 16px', height: 42,
            fontWeight: 700, fontSize: 13, cursor: commentText.trim() ? 'pointer' : 'default',
            transition: 'background 0.2s', whiteSpace: 'nowrap',
          }}
        >
          भेजें →
        </button>
      </div>

      <style>{`@keyframes wave { from { transform: scaleY(0.5); } to { transform: scaleY(1.1); } }`}</style>
    </div>
  );
}
