import React, { useState, useRef } from 'react';
// ── ComposePage — Premium Post Creator ────────────────────────────────────────
import { useNavigate } from 'react-router-dom';
import { addPost, getWorker, getCommunities } from '../data/store';
import type { Post, PostType } from '../types';

const POST_TYPES: { id: PostType; label: string; icon: string; desc: string; color: string; bg: string }[] = [
  { id: 'tip',            label: 'Tip / Advice',    icon: '💡', desc: 'Job tips, HR advice, kuch useful…',    color: '#D97706', bg: '#FFFBEB' },
  { id: 'looking_for_job',label: 'Job चाहिए',        icon: '🔍', desc: 'अपना experience बताएं, कहाँ चाहिए…',    color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'job_available',  label: 'Job Vacancy',      icon: '💼', desc: 'Role, location, salary share करें…',   color: '#168448', bg: '#F0FDF4' },
  { id: 'success_story',  label: 'Success Story',    icon: '🎉', desc: 'आपकी success कहानी share करें!',       color: '#2563EB', bg: '#EFF6FF' },
  { id: 'employer_review',label: 'Company Review',   icon: '⭐', desc: 'Honest company rating दें…',           color: '#DC2626', bg: '#FEF2F2' },
  { id: 'salary_review',  label: 'Salary Info',      icon: '💰', desc: 'Salary मिली — दूसरों को बताएं!',      color: '#0891B2', bg: '#F0F9FF' },
  { id: 'interview_tip',  label: 'Interview Tip',    icon: '📋', desc: 'Interview tips share करें…',          color: '#059669', bg: '#ECFDF5' },
  { id: 'voice',          label: 'Voice Post',       icon: '🎙️', desc: 'Bolke share karo — 15 sec max',       color: '#DB2777', bg: '#FDF2F8' },
];

const MOOD_EMOJIS = ['😊', '💪', '🤔', '😤', '🙏', '🎯', '🔥', '👍'];

export function ComposePage() {
  const navigate    = useNavigate();
  const worker      = getWorker();
  const communities = getCommunities();
  const myCommunities = communities.filter(c => worker.communityIds.includes(c.id));

  const [type,            setType]            = useState<PostType>('tip');
  const [content,         setContent]         = useState('');
  const [anonymous,       setAnonymous]       = useState(false);
  const [communityId,     setCommunityId]     = useState('');
  const [isRecording,     setIsRecording]     = useState(false);
  const [recordedDuration,setRecordedDuration]= useState(0);
  const [selectedMood,    setSelectedMood]    = useState<string | null>(null);
  const [charCount,       setCharCount]       = useState(0);
  const [step,            setStep]            = useState<'type' | 'write'>('type');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isVoice  = type === 'voice';
  const selMeta  = POST_TYPES.find(p => p.id === type)!;
  const canPost  = isVoice ? recordedDuration > 0 : content.trim().length > 0;

  const submit = () => {
    if (!canPost) return;
    const post: Post = {
      id: `post_${Date.now()}`,
      authorId: worker.id,
      type,
      content: isVoice ? (content || 'Voice post') : content,
      likes: [],
      comments: [],
      anonymous,
      createdAt: new Date().toISOString(),
      communityId: communityId || undefined,
      ...(isVoice ? { voiceUrl: `simulated_voice_${Date.now()}`, voiceDuration: recordedDuration || 9, transcript: content || 'Voice note…' } : {}),
    };
    addPost(post);
    navigate('/community');
  };

  const toggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      let t = recordedDuration;
      timerRef.current = setInterval(() => {
        t++;
        setRecordedDuration(t);
        if (t >= 15) {
          clearInterval(timerRef.current!);
          setIsRecording(false);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
      setIsRecording(false);
    }
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    setCharCount(val.length);
  };

  const initials = (worker.name ?? 'W').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(160deg, var(--g900) 0%, var(--g700) 100%)',
        padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => step === 'write' ? setStep('type') : navigate(-1)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 18,
              }}
            >
              {step === 'write' ? '←' : '✕'}
            </button>
            <div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, color: '#fff' }}>
                {step === 'type' ? 'Post बनाएं' : `${selMeta.icon} ${selMeta.label}`}
              </div>
              {step === 'write' && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{selMeta.desc}</div>
              )}
            </div>
          </div>

          {step === 'write' && (
            <button
              onClick={submit}
              disabled={!canPost}
              style={{
                background: canPost ? '#fff' : 'rgba(255,255,255,0.25)',
                color: canPost ? selMeta.color : 'rgba(255,255,255,0.5)',
                border: 'none', borderRadius: 'var(--r-md)', padding: '9px 18px',
                fontWeight: 700, fontSize: 14, cursor: canPost ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: canPost ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              Post करें →
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
          {[0,1].map(i => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: (step === 'type' ? i === 0 : true) ? '#4ADE80' : 'rgba(255,255,255,0.2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* ── STEP 1: Type Selector ── */}
      {step === 'type' && (
        <div style={{ padding: '20px 16px', flex: 1 }} className="anim-fade">
          <div style={{ fontSize: 13, color: 'var(--text-lo)', fontWeight: 600, marginBottom: 14, textAlign: 'center' }}>
            आप क्या share करना चाहते हैं?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {POST_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => { setType(pt.id); setStep('write'); }}
                style={{
                  background: type === pt.id ? pt.bg : 'var(--white)',
                  border: `1.5px solid ${type === pt.id ? pt.color : 'var(--border)'}`,
                  borderRadius: 'var(--r-xl)', padding: '16px 12px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--sh-card)',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{pt.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-hi)', marginBottom: 2 }}>{pt.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-lo)', lineHeight: 1.4 }}>{pt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2: Write Post ── */}
      {step === 'write' && (
        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }} className="anim-slide">

          {/* Author preview */}
          <div style={{
            background: 'var(--white)', borderRadius: 'var(--r-xl)', padding: '12px 14px',
            border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center',
            boxShadow: 'var(--sh-card)',
          }}>
            <div className="avatar av-md" style={{ background: anonymous ? 'var(--n400)' : 'var(--g700)' }}>
              {anonymous ? '?' : initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-hi)' }}>
                {anonymous ? 'Anonymous Worker' : worker.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-lo)' }}>
                {communityId
                  ? myCommunities.find(c => c.id === communityId)?.name || 'Community'
                  : 'Public Feed'} · अभी
              </div>
            </div>
            <div style={{
              marginLeft: 'auto', background: selMeta.bg, color: selMeta.color,
              borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700,
            }}>
              {selMeta.icon} {selMeta.label}
            </div>
          </div>

          {/* Community selector */}
          {myCommunities.length > 0 && (
            <div style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-lo)', fontWeight: 600, borderBottom: '1px solid var(--divider)' }}>
                📢 Share to:
              </div>
              <div style={{ display: 'flex', gap: 6, padding: '10px 14px', overflowX: 'auto' }}>
                <button
                  onClick={() => setCommunityId('')}
                  style={{
                    padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
                    border: '1.5px solid',
                    background: !communityId ? 'var(--g700)' : 'var(--white)',
                    color: !communityId ? '#fff' : 'var(--text-mid)',
                    borderColor: !communityId ? 'var(--g700)' : 'var(--border)',
                    fontSize: 12, fontWeight: 600,
                  }}
                >
                  🌐 Public
                </button>
                {myCommunities.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCommunityId(c.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
                      border: '1.5px solid',
                      background: communityId === c.id ? 'var(--g700)' : 'var(--white)',
                      color: communityId === c.id ? '#fff' : 'var(--text-mid)',
                      borderColor: communityId === c.id ? 'var(--g700)' : 'var(--border)',
                      fontSize: 12, fontWeight: 600,
                    }}
                  >
                    {c.avatar ?? '👥'} {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice Post UI */}
          {isVoice ? (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
              padding: 20, textAlign: 'center', boxShadow: 'var(--sh-card)',
            }}>
              {/* Record button */}
              <button
                onClick={toggleRecord}
                style={{
                  width: 88, height: 88, borderRadius: '50%',
                  background: isRecording
                    ? 'linear-gradient(135deg,#DC2626,#B91C1C)'
                    : 'linear-gradient(135deg,var(--g600),var(--g800))',
                  border: 'none', cursor: 'pointer', fontSize: 36, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  boxShadow: isRecording
                    ? '0 0 0 16px rgba(220,38,38,0.15), 0 4px 20px rgba(220,38,38,0.4)'
                    : '0 4px 20px rgba(22,132,72,0.4)',
                  transition: 'all 0.3s',
                  animation: isRecording ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}
              >
                {isRecording ? '⏹' : recordedDuration > 0 ? '🔄' : '🎙️'}
              </button>

              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, marginBottom: 4,
                color: isRecording ? 'var(--red)' : 'var(--text-hi)' }}>
                {isRecording
                  ? `🔴 Recording… ${recordedDuration}s / 15s`
                  : recordedDuration > 0
                    ? `✓ ${recordedDuration}s recorded`
                    : 'Record करें (max 15 sec)'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>
                {isRecording ? 'Stop करने के लिए tap करें' : 'Record करने के लिए tap करें'}
              </div>

              {/* Waveform */}
              {isRecording && (
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 14, height: 32, alignItems: 'flex-end' }}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} style={{
                      width: 4, borderRadius: 2, background: 'var(--red)',
                      height: `${8 + Math.random() * 24}px`,
                      animation: `pulse 0.5s ${i * 0.04}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {recordedDuration > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ height: 4, background: 'var(--n100)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(recordedDuration / 15) * 100}%`, background: 'var(--g700)', transition: 'width 1s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-lo)' }}>
                    <span>0s</span><span>15s max</span>
                  </div>
                </div>
              )}

              {/* Transcript */}
              <div style={{ marginTop: 16, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-lo)', marginBottom: 6 }}>Description (optional):</div>
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Voice post के बारे में लिखें…"
                  value={content}
                  onChange={e => handleContentChange(e.target.value)}
                  style={{ resize: 'none', height: 'auto', padding: '10px 14px' }}
                />
              </div>
            </div>
          ) : (
            /* Text Post Area */
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border)',
              overflow: 'hidden', boxShadow: 'var(--sh-card)',
            }}>
              <textarea
                value={content}
                onChange={e => handleContentChange(e.target.value)}
                placeholder={selMeta.desc}
                rows={7}
                style={{
                  width: '100%', border: 'none', outline: 'none', resize: 'none',
                  padding: '16px', fontSize: 15, lineHeight: 1.7,
                  color: 'var(--text-hi)', fontFamily: 'inherit', background: 'transparent',
                }}
                autoFocus
              />

              {/* Mood emoji row */}
              <div style={{ padding: '0 14px 12px', borderTop: '1px solid var(--divider)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-lo)', fontWeight: 600, marginBottom: 6, marginTop: 10 }}>
                  Mood चुनें (optional):
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {MOOD_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => {
                        const m = selectedMood === e ? null : e;
                        setSelectedMood(m);
                        if (m && !content.startsWith(m)) {
                          handleContentChange(m + ' ' + content.replace(/^[^\w\s]+ ?/, ''));
                        }
                      }}
                      style={{
                        fontSize: 22, cursor: 'pointer', border: '1.5px solid',
                        borderColor: selectedMood === e ? selMeta.color : 'var(--border)',
                        borderRadius: 8, width: 36, height: 36, background: selectedMood === e ? selMeta.bg : 'var(--white)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Char count */}
              <div style={{
                padding: '8px 16px', background: 'var(--n50)', borderTop: '1px solid var(--divider)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>
                  {charCount < 20 ? 'कम से कम कुछ लिखें...' : '✓ Ready to post'}
                </div>
                <div style={{ fontSize: 12, color: charCount > 400 ? 'var(--red)' : 'var(--text-lo)', fontWeight: 600 }}>
                  {charCount}/500
                </div>
              </div>
            </div>
          )}

          {/* Anonymous toggle (for reviews) */}
          {(type === 'employer_review' || type === 'salary_review') && (
            <div style={{
              background: 'var(--white)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)',
              padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: 'var(--sh-card)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Anonymous post करें</div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>आपका नाम नहीं दिखेगा</div>
              </div>
              <button
                className={`toggle-switch ${anonymous ? 'on' : ''}`}
                onClick={() => setAnonymous(a => !a)}
              />
            </div>
          )}

          {/* Bottom Post Button */}
          <button
            onClick={submit}
            disabled={!canPost}
            className="btn btn-primary btn-full"
            style={{
              height: 52, borderRadius: 'var(--r-lg)', fontSize: 15,
              marginTop: 'auto',
              background: canPost ? 'var(--g700)' : 'var(--n200)',
              boxShadow: canPost ? 'var(--sh-btn)' : 'none',
            }}
          >
            {canPost ? '🚀 Post करें!' : 'कुछ लिखें फिर post करें'}
          </button>
        </div>
      )}
    </div>
  );
}
