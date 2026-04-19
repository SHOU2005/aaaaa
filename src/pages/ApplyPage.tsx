import React from 'react';
// ── Apply Flow (3-step) ────────────────────────────────────────────────────────
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getCaptain, getWorker, addApplication, hasApplied } from '../data/store';
import type { Application } from '../types';

export function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const job = getJob(id!);
  const worker = getWorker();
  const captain = job ? getCaptain(job.captainId) : null;
  const [step, setStep] = useState(0);
  const [hasExp, setHasExp] = useState(true);
  const [available, setAvailable] = useState('immediately');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!job) return <div className="empty-state"><div className="empty-title">Job नहीं मिली</div></div>;
  if (hasApplied(id!)) {
    navigate(`/applications`);
    return null;
  }

  const submit = () => {
    const app: Application = {
      id: `app_${Date.now()}`,
      workerId: worker.id,
      jobId: job.id,
      captainId: job.captainId,
      currentStage: 'Applied',
      stages: [{ stage: 'Applied', at: new Date().toISOString(), note: '' }],
      workerNote: note,
      appliedAt: new Date().toISOString(),
    };
    addApplication(app);
    setStep(2);
    setSubmitted(true);
  };

  const waMsg = encodeURIComponent(`नमस्ते! मेरा नाम ${worker.name} है (${worker.regNumber}).\nमैंने ${job.role} (${job.employerName}) के लिए Apply किया है। Please contact करें। धन्यवाद।`);

  const steps = [
    // Step 0 — Confirm profile
    <div key="s0" className="fade-in" style={{ padding: '0 16px' }}>
      <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
        <div className="avatar avatar--xl" style={{ background: 'var(--green-dark)', margin: '0 auto 12px' }}>
          {worker.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18 }}>{worker.name}</div>
        <span className="pill pill--reg" style={{ marginTop: 4 }}>{worker.regNumber}</span>
      </div>

      <div className="card card--shadow" style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>आपकी जानकारी सही है?</div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Security Guard experience है?</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className={`btn btn--sm ${hasExp ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setHasExp(true)}>✓ हाँ</button>
              <button className={`btn btn--sm ${!hasExp ? 'btn--primary' : 'btn--ghost'}`} onClick={() => setHasExp(false)}>नहीं</button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Available कब से?</div>
            <div className="avail-toggle">
              {[{ id: 'immediately', l: 'अभी' }, { id: '1week', l: '1 हफ़्ता' }, { id: '1month', l: '1 महीना' }].map(o => (
                <button key={o.id} className={`avail-btn ${available === o.id ? 'active' : ''}`} onClick={() => setAvailable(o.id)}>{o.l}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Captain को note (optional):</div>
            <textarea
              className="input"
              placeholder="जैसे: मुझे night shift चाहिए…"
              rows={3}
              maxLength={100}
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{ resize: 'none' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{note.length}/100</div>
          </div>
        </div>
      </div>
      <button className="btn btn--primary btn--full" onClick={() => setStep(1)}>अगला →</button>
    </div>,

    // Step 1 — Documents
    <div key="s1" className="fade-in" style={{ padding: '0 16px' }}>
      <div style={{ fontFamily: 'Baloo 2', fontSize: 18, fontWeight: 700, margin: '16px 0 14px' }}>Documents</div>
      <div className="card card--shadow" style={{ marginBottom: 16 }}>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>इस नौकरी के लिए ज़रूरी:</div>
          {(Array.isArray(job.documents) ? job.documents : typeof job.documents === 'object' && job.documents !== null ? Object.entries(job.documents).filter(([,v]) => v).map(([k]) => k) : typeof job.documents === 'string' ? [job.documents] : []).map((doc: string) => {
            const docName = doc === 'aadhar' ? 'Aadhar Card' : doc === 'police_verification' ? 'Police Verification' : 'Driving Licence';
            const hasDoc = doc === 'aadhar' ? worker.documents.aadhar : doc === 'police_verification' ? worker.documents.policeVerification : true;
            return (
              <div key={doc} className="doc-row">
                <div className="doc-name">{docName}</div>
                <div className={`doc-status ${hasDoc ? 'uploaded' : 'pending'}`}>
                  {hasDoc ? '✓ Uploaded' : '⚠ Pending'}
                  {!hasDoc && <button style={{ marginLeft: 8, fontSize: 12, color: 'var(--amber)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Upload →</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--text-secondary)', border: '1px solid var(--amber)' }}>
        💡 बिना Police Verification के भी apply कर सकते हैं। Captain आगे की guidance देंगे।
      </div>
      <button className="btn btn--primary btn--full" onClick={submit}>Apply करें →</button>
    </div>,

    // Step 2 — Confirmation
    <div key="s2" className="fade-in" style={{ padding: '0 16px', textAlign: 'center' }}>
      <div style={{ padding: '40px 0 24px' }}>
        <div style={{ fontSize: 72, animation: 'scaleIn 600ms ease', display: 'block' }}>🎉</div>
        <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 24, color: 'var(--green-dark)', marginTop: 12 }}>Application भेज दी! ✓</div>
        
        <div className="card card--shadow" style={{ margin: '20px 0 16px', textAlign: 'left', padding: 16 }}>
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 16 }}>{job.role}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{job.employerName}</div>
        </div>

        {captain && (
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
            Captain <strong>{captain.name}</strong> को आपकी application मिल गई।<br />
            वो जल्द ही WhatsApp पर contact करेंगे।
          </div>
        )}

        {/* WhatsApp message preview */}
        {captain && (
          <div style={{ background: '#DCF8C6', borderRadius: 12, padding: '12px 14px', margin: '0 0 20px', textAlign: 'left', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 12, color: '#075E54' }}>📲 WhatsApp message Captain को:</div>
            नमस्ते! मेरा नाम {worker.name} है ({worker.regNumber}).<br />
            मैंने {job.role} ({job.employerName}) के लिए Apply किया है। Please contact करें। धन्यवाद।
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          {captain && (
            <a
              href={`https://wa.me/91${captain.mobile}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--full"
            >
              📲 Captain को WhatsApp
            </a>
          )}
          <button className="btn btn--primary btn--full" onClick={() => navigate('/applications')}>Status देखें →</button>
          <button className="btn btn--ghost btn--full" onClick={() => navigate('/jobs')}>और नौकरियां देखें</button>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="page--no-nav" style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {step < 2 && <button onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18 }}>←</button>}
            <div>
              <div style={{ fontFamily: 'Baloo 2', fontWeight: 700, fontSize: 18, color: '#fff' }}>
                {step === 2 ? '✓ Application Submit' : `Apply — Step ${step + 1}/2`}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{job.role} · {job.employerName}</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {step < 2 && (
          <div style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
            <div style={{ height: '100%', width: `${(step + 1) / 2 * 100}%`, background: '#fff', borderRadius: 2, transition: 'width 300ms' }} />
          </div>
        )}
      </div>

      {steps[step]}
    </div>
  );
}
