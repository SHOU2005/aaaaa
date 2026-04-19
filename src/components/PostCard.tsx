import React from 'react';
// ── Post Card ─────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Post } from '../types';
import { getWorkerById, getCaptain, timeAgo, toggleLike, getWorker, initials, categoryColor } from '../data/store';

const POST_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  job_available: { label: '💼 Job', color: '#1B6B3A', bg: '#E8F7EE' },
  looking_for_job: { label: '🔍 खोज रहे हैं', color: '#1E6FBF', bg: '#EBF3FD' },
  tip: { label: '💡 Tip', color: '#E88C2A', bg: '#FEF3E2' },
  success_story: { label: '🎉 Success', color: '#7C3AED', bg: '#F5F3FF' },
  employer_review: { label: '⭐ Review', color: '#6B21A8', bg: '#F3E8FF' },
  salary_review: { label: '💰 Salary', color: '#CA8A04', bg: '#FEFCE8' },
  interview_tip: { label: '📋 Interview', color: '#E88C2A', bg: '#FEF3E2' },
  voice: { label: '🎙️ Voice', color: '#1B6B3A', bg: '#E8F7EE' },
};

const AVATAR_COLORS = ['#1B6B3A', '#1E6FBF', '#7C3AED', '#E88C2A', '#DC3545', '#059669'];

interface Props {
  post: Post;
  onUpdate?: () => void;
}

export function PostCard({ post, onUpdate }: Props) {
  const me = getWorker();
  const [liked, setLiked] = useState(post.likes.includes(me.id));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [playing, setPlaying] = useState(false);

  // author
  const worker = getWorkerById(post.authorId);
  const captain = !worker ? getCaptain(post.authorId) : null;
  const authorName = post.anonymous ? 'Anonymous' : (worker?.name || captain?.name || 'Switch');
  const authorReg = post.anonymous ? '' : (worker?.regNumber || captain?.regNumber || '');
  const authorInitials = post.anonymous ? '?' : initials(authorName);
  const avatarColor = AVATAR_COLORS[post.authorId.charCodeAt(post.authorId.length - 1) % AVATAR_COLORS.length];

  const typeInfo = POST_TYPE_LABELS[post.type] || POST_TYPE_LABELS['tip'];

  const handleLike = () => {
    toggleLike(post.id);
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
    onUpdate?.();
  };

  return (
    <div className="card card--shadow post-card fade-in" style={{ marginBottom: 12 }}>
      {/* Header */}
      <div className="post-header">
        <div className="avatar avatar--md" style={{ background: post.anonymous ? '#9CA3AF' : avatarColor }}>
          {authorInitials}
        </div>
        <div style={{ flex: 1 }}>
          <div className="post-author">{authorName}</div>
          <div className="post-time">
            {authorReg && <span style={{ color: 'var(--red)', fontWeight: 700, marginRight: 6, fontSize: 12 }}>{authorReg}</span>}
            {timeAgo(post.createdAt)}
          </div>
        </div>
        <div className="post-type-badge">
          <span className="pill" style={{ background: typeInfo.bg, color: typeInfo.color }}>
            {typeInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="post-content">{post.content}</div>

      {/* Voice */}
      {post.type === 'voice' && post.voiceUrl && (
        <div className="voice-player" style={{ marginTop: 10 }}>
          <button className="voice-btn" onClick={() => setPlaying(p => !p)}>
            {playing ? '⏸' : '▶'}
          </button>
          <div className="waveform">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="waveform-bar" style={{
                height: `${20 + Math.sin(i * 0.8) * 16}px`,
                animationDelay: `${i * 0.05}s`,
                animationPlayState: playing ? 'running' : 'paused',
                opacity: playing ? 1 : 0.6,
              }} />
            ))}
          </div>
          <span className="voice-duration">0:{post.voiceDuration?.toString().padStart(2, '0')}</span>
        </div>
      )}
      {post.transcript && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic', padding: '0 2px' }}>
          "{post.transcript}"
        </div>
      )}

      {/* Job ref */}
      {post.jobRef && (
        <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 12px', marginTop: 10, border: '1px solid var(--green-border)' }}>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14 }}>{post.jobRef.role}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{post.jobRef.location}</div>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, color: 'var(--green-dark)', fontSize: 14, marginTop: 2 }}>{post.jobRef.salary}/mo</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Captain: {post.jobRef.captainName}</div>
          <a
            href={`https://wa.me/91${me.mobile}?text=नमस्ते! Job के बारे में बात करनी है।`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--whatsapp btn--sm"
            style={{ marginTop: 8, borderRadius: 8 }}
          >
            📲 WhatsApp पर संपर्क
          </a>
        </div>
      )}

      {/* Employer ref */}
      {post.employerRef && (
        <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: '10px 12px', marginTop: 10, border: '1px dashed var(--amber)' }}>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 14 }}>{post.employerRef.name}</div>
          <div style={{ color: 'var(--amber)', fontWeight: 700, fontSize: 14, marginTop: 2 }}>{'⭐'.repeat(post.employerRef.rating)}{'☆'.repeat(5 - post.employerRef.rating)} {post.employerRef.rating}/5</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{post.employerRef.feedback}</div>
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button className={`post-action ${liked ? 'liked' : ''}`} onClick={handleLike}>
          {liked ? '❤️' : '🤍'} {likeCount > 0 ? likeCount : ''} Helpful
        </button>
        <Link to={`/community/post/${post.id}`} className="post-action" style={{ textDecoration: 'none' }}>
          💬 {post.comments.length} Comments
        </Link>
        <a
          href={`https://wa.me/?text=Switch Community post: ${encodeURIComponent(post.content.slice(0, 80))}`}
          className="post-action"
          style={{ textDecoration: 'none', marginLeft: 'auto' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          📲 Share
        </a>
      </div>
    </div>
  );
}
