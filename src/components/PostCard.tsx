import React, { useState } from 'react';
// ── PostCard — Premium Feed Card ──────────────────────────────────────────────
import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { getWorkerById, getCaptain, timeAgo, toggleLike, getWorker, initials } from '../data/store';

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

const AVATAR_COLORS = ['#1B6B3A', '#1E6FBF', '#7C3AED', '#E88C2A', '#DC3545', '#059669'];

interface Props { post: Post; onUpdate?: () => void; }

export function PostCard({ post, onUpdate }: Props) {
  const me = getWorker();
  const [liked, setLiked] = useState(post.likes.includes(me.id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [playing, setPlaying] = useState(false);

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
    onUpdate?.();
  };

  const shareMsg = encodeURIComponent(`Switch Community: "${post.content.slice(0, 80)}" — ${typeMeta.icon} ${typeMeta.label}`);

  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--r-xl)',
      border: '1px solid var(--border)', overflow: 'hidden',
      boxShadow: 'var(--sh-card)', marginBottom: 12,
    }}>
      {/* Type accent top strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${typeMeta.color}, ${typeMeta.color}55)` }} />

      <div style={{ padding: '14px 14px 0' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: post.anonymous ? '#9CA3AF' : avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15,
          }}>
            {authorInitials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {authorName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-lo)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
              {authorReg && <span style={{ color: 'var(--g700)', fontWeight: 700 }}>{authorReg}</span>}
              {authorReg && <span>·</span>}
              <span>{timeAgo(post.createdAt)}</span>
            </div>
          </div>
          <div style={{
            background: typeMeta.bg, color: typeMeta.color,
            borderRadius: 'var(--r-xs)', padding: '3px 8px',
            fontSize: 10, fontWeight: 700, flexShrink: 0,
          }}>
            {typeMeta.icon} {typeMeta.label}
          </div>
        </div>

        {/* Content */}
        <Link to={`/community/post/${post.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            fontSize: 14, lineHeight: 1.7, color: 'var(--text-hi)',
            marginBottom: 12, display: '-webkit-box',
            WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.content}
          </div>
        </Link>

        {/* Voice player (compact) */}
        {post.type === 'voice' && post.voiceUrl && (
          <div style={{
            background: 'var(--g50)', border: '1px solid var(--g100)',
            borderRadius: 'var(--r-md)', padding: '10px 12px',
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          }}>
            <button
              onClick={e => { e.preventDefault(); setPlaying(p => !p); }}
              style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: playing ? 'var(--g700)' : '#fff',
                border: '1.5px solid var(--g700)',
                color: playing ? '#fff' : 'var(--g700)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} style={{
                  width: 2.5, borderRadius: 99,
                  height: `${6 + Math.abs(Math.sin(i * 0.7 + 1)) * 18}px`,
                  background: playing ? 'var(--g500)' : 'var(--g200)',
                  flexShrink: 0,
                }} />
              ))}
            </div>
            <span style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 12, color: 'var(--g700)', flexShrink: 0 }}>
              0:{(post.voiceDuration ?? 0).toString().padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Job ref (compact) */}
        {post.jobRef && (
          <div style={{
            background: 'linear-gradient(135deg, #0D3D21, #168448)',
            borderRadius: 'var(--r-md)', padding: '11px 13px',
            marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 14, color: '#fff' }}>{post.jobRef.role}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>📍 {post.jobRef.location}</div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 20, color: '#fff', marginTop: 2 }}>
                {post.jobRef.salary}<span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>/माह</span>
              </div>
            </div>
            <a
              href={`https://wa.me/91${post.jobRef.captainMobile}?text=${encodeURIComponent(`नमस्कार! Switch पर "${post.jobRef.role}" की नौकरी देखी।`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                background: '#25D366', color: '#fff', borderRadius: 'var(--r-sm)',
                padding: '8px 12px', fontSize: 12, fontWeight: 700,
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              💬 Apply
            </a>
          </div>
        )}

        {/* Employer review (compact) */}
        {post.employerRef && (
          <div style={{
            background: 'var(--amber-bg)', border: '1px solid #FDE68A',
            borderRadius: 'var(--r-md)', padding: '10px 13px', marginBottom: 12,
          }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14, color: 'var(--text-hi)', marginBottom: 4 }}>
              {post.employerRef.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 5 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={{ fontSize: 14, color: i < post.employerRef!.rating ? '#F59E0B' : '#D1D5DB' }}>
                  {i < post.employerRef!.rating ? '★' : '☆'}
                </span>
              ))}
              <span style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 13, color: '#F59E0B', marginLeft: 4 }}>
                {post.employerRef.rating}/5
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-lo)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{post.employerRef.feedback}"
            </div>
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 12, borderTop: '1px solid var(--divider)', paddingTop: 12 }}>
          <button
            onClick={handleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: liked ? '#FEE2E2' : 'var(--n50)',
              border: `1px solid ${liked ? '#FCA5A5' : 'var(--border)'}`,
              borderRadius: 'var(--r-sm)', padding: '6px 12px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              color: liked ? '#DC2626' : 'var(--text-lo)',
            }}
          >
            {liked ? '❤️' : '🤍'} {likeCount > 0 ? likeCount : 'Helpful'}
          </button>
          <Link
            to={`/community/post/${post.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'var(--n50)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '6px 12px',
              fontSize: 12, fontWeight: 600, color: 'var(--text-lo)',
              textDecoration: 'none',
            }}
          >
            💬 {post.comments.length}
          </Link>
          <a
            href={`https://wa.me/?text=${shareMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto',
              background: '#E8F7EE', border: '1px solid var(--g100)',
              borderRadius: 'var(--r-sm)', padding: '6px 12px',
              fontSize: 12, fontWeight: 600, color: 'var(--g700)',
              textDecoration: 'none',
            }}
          >
            📲 Share
          </a>
        </div>
      </div>
    </div>
  );
}
