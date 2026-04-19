import React from 'react';
// ── JobCard ───────────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { haversine, walkTime, formatSalary } from '../data/store';

const DOT_COLORS: Record<string, string> = {
  security: '#1B6B3A', housekeeping: '#E88C2A', driver: '#2563EB',
  cook: '#7C3AED', helper: '#DC2626', technician: '#0891B2',
  gardener: '#059669', caretaker: '#DB2777',
};

interface Props { job: Job; workerLat: number; workerLng: number; compact?: boolean; }

export function JobCard({ job, workerLat, workerLng, compact }: Props) {
  const dist  = haversine(workerLat, workerLng, job.lat, job.lng);
  const color = DOT_COLORS[job.category] || '#6B7280';

  /* ── Horizontal compact card ── */
  if (compact) return (
    <Link to={`/jobs/${job.id}`} className="jch">
      <div className="jch-top">
        <div className="jch-dot" style={{ background: color }} />
        {job.urgent && <span className="badge badge-red">⚡</span>}
      </div>
      <div className="jch-role">{job.role}</div>
      <div className="jch-company">{job.employerName}</div>
      <div className="jch-dist">📍 {dist.toFixed(1)} km · {walkTime(dist)}</div>
      <div>
        <span className="jch-salary">{formatSalary(job.salary.min, job.salary.max)}</span>
        <span className="jch-per">/माह</span>
      </div>
    </Link>
  );

  /* ── Full width list card ── */
  return (
    <Link to={`/jobs/${job.id}`} className="jc">
      <div className="jc-header">
        <div className="jc-left">
          <div className="jc-role">
            <span className="jc-role-dot" style={{ background: color }} />
            {job.role}
          </div>
          <div className="jc-company">{job.employerName}</div>
        </div>
        <div className="jc-badges">
          {job.urgent && <span className="badge badge-red">⚡ Urgent</span>}
          {job.openings <= 2 && <span className="badge badge-amber">{job.openings} बचे</span>}
        </div>
      </div>

      <div className="jc-meta">
        <span className="jc-meta-item">📍 {dist.toFixed(1)} km</span>
        <span className="jc-meta-item" style={{ color: 'var(--n300)' }}>·</span>
        <span className="jc-meta-item">🚶 {walkTime(dist)}</span>
        <span className="jc-meta-item" style={{ color: 'var(--n300)' }}>·</span>
        <span className="jc-meta-item">👔 {job.openings} खाली</span>
        {job.food          && <span className="badge badge-green" style={{ marginLeft: 4 }}>🍽 खाना</span>}
        {job.accommodation && <span className="badge badge-blue"  style={{ marginLeft: 4 }}>🏠 रहना</span>}
      </div>

      <div className="jc-footer">
        <div>
          <div>
            <span className="jc-salary">{formatSalary(job.salary.min, job.salary.max)}</span>
            <span className="jc-period">/महीना</span>
          </div>
          <div className="jc-rating">⭐ {job.employerRating} ({job.employerReviewCount})</div>
        </div>
        <button className="btn btn-primary btn-sm">Apply →</button>
      </div>
    </Link>
  );
}
