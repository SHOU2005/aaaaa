import React, { useState } from 'react';
// ── Post Detail + Comments ────────────────────────────────────────────────────
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, getWorkerById, getCaptain, addComment, getWorker, timeAgo, initials } from '../data/store';
import { PostCard } from '../components/PostCard';

const AVATAR_COLORS = ['#1B6B3A', '#1E6FBF', '#7C3AED', '#E88C2A', '#DC3545', '#059669'];

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState(() => getPost(id!));
  const [commentText, setCommentText] = useState('');
  const me = getWorker();

  const refresh = () => setPost(getPost(id!));

  if (!post) return (
    <div className="empty-state">
      <div className="empty-title">Post नहीं मिली</div>
      <button className="btn btn--primary" onClick={() => navigate(-1)}>वापस</button>
    </div>
  );

  const submitComment = () => {
    if (!commentText.trim()) return;
    addComment(post.id, commentText.trim());
    setCommentText('');
    refresh();
  };

  return (
    <div className="page--no-nav" style={{ minHeight: '100dvh', background: 'var(--bg)', paddingBottom: 80 }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18 }}>←</button>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, color: '#fff' }}>Post</div>
        </div>
      </div>

      <div style={{ padding: 16 }}>
        <PostCard post={post} onUpdate={refresh} />

        {/* Comments */}
        <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 16, margin: '8px 0 12px' }}>
          💬 Comments ({post.comments.length})
        </div>

        {post.comments.map(c => {
          const author = getWorkerById(c.authorId) || getCaptain(c.authorId);
          const aName = author?.name || 'Unknown';
          const color = AVATAR_COLORS[c.authorId.charCodeAt(c.authorId.length - 1) % AVATAR_COLORS.length];
          return (
            <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
              <div className="avatar avatar--sm" style={{ background: color }}>{initials(aName)}</div>
              <div style={{ background: 'var(--card)', borderRadius: '0 12px 12px 12px', padding: '8px 12px', flex: 1, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{aName}</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 2 }}>{c.content}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{timeAgo(c.createdAt)}</div>
              </div>
            </div>
          );
        })}

        {post.comments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            पहले comment करें!
          </div>
        )}
      </div>

      {/* Comment input */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="avatar avatar--sm" style={{ background: 'var(--green-dark)', flexShrink: 0 }}>{initials(me.name)}</div>
        <input
          className="input"
          placeholder="Comment लिखें…"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submitComment()}
          style={{ flex: 1, height: 42, padding: '0 12px' }}
        />
        <button className="btn btn--primary btn--sm" onClick={submitComment} disabled={!commentText.trim()}>
          भेजें
        </button>
      </div>
    </div>
  );
}
