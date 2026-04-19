import React from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { haversine, walkTime, formatSalary } from '../data/store';

const CAT_LABEL: Record<string, string> = {
  security: 'Security', housekeeping: 'Housekeeping', driver: 'Driver',
  cook: 'Cook', helper: 'Helper', technician: 'Technician',
  gardener: 'Gardener', caretaker: 'Caretaker', skill: 'Skilled',
};

const CAT_ACCENT: Record<string, string> = {
  security:     '#1B6B3A',
  housekeeping: '#B45309',
  driver:       '#1D4ED8',
  cook:         '#6D28D9',
  helper:       '#B91C1C',
  technician:   '#0E7490',
  skill:        '#166534',
};

interface Props { job: Job; workerLat: number; workerLng: number; compact?: boolean; }

export function JobCard({ job, workerLat, workerLng, compact }: Props) {
  const dist   = haversine(workerLat, workerLng, job.lat, job.lng);
  const wtime  = walkTime(dist);
  const accent = CAT_ACCENT[job.category] || '#374151';
  const salary = formatSalary(job.salary.min, job.salary.max);
  const spots  = job.openings - job.filled;

  /* ─── Compact card — horizontal strip ─── */
  if (compact) return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: 200,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Accent bar */}
        <div style={{ height: 3, background: accent }} />
        <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Category tag + urgent */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.6,
              color: accent, textTransform: 'uppercase',
            }}>{CAT_LABEL[job.category] || 'Job'}</span>
            {job.urgent && (
              <span style={{
                fontSize: 9, fontWeight: 700, color: '#B91C1C',
                background: '#FEF2F2', padding: '1px 6px', borderRadius: 4,
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>Urgent</span>
            )}
          </div>

          {/* Role */}
          <div style={{
            fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 14,
            color: '#111827', lineHeight: 1.25,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{job.role}</div>

          {/* Employer */}
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, lineHeight: 1.2 }}>
            {job.employerName}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#F3F4F6' }} />

          {/* Salary + distance */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 16, color: '#111827' }}>
                {salary}
              </span>
              <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>/mo</span>
            </div>
            <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{dist.toFixed(1)} km</span>
          </div>

          {/* Perks */}
          {(job.food || job.accommodation) && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {job.food && (
                <span style={{ fontSize: 10, color: '#065F46', background: '#ECFDF5', padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>
                  Meals included
                </span>
              )}
              {job.accommodation && (
                <span style={{ fontSize: 10, color: '#1E40AF', background: '#EFF6FF', padding: '2px 7px', borderRadius: 5, fontWeight: 600 }}>
                  Stay included
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  /* ─── Full card ─── */
  return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        {/* Left accent bar */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: 4, background: accent, flexShrink: 0, borderRadius: '0 0 0 0' }} />

          <div style={{ flex: 1, padding: '14px 14px 14px 12px' }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: accent,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                }}>{CAT_LABEL[job.category] || 'Job'}</span>
                <div style={{
                  fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 17,
                  color: '#111827', lineHeight: 1.25, marginTop: 1,
                }}>{job.role}</div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: 500 }}>
                  {job.employerName}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {job.urgent && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#B91C1C',
                    background: '#FEF2F2', padding: '2px 8px', borderRadius: 5,
                    letterSpacing: 0.4, textTransform: 'uppercase', whiteSpace: 'nowrap',
                  }}>Urgent</span>
                )}
                {spots <= 2 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#92400E',
                    background: '#FFF7ED', padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap',
                  }}>{spots} spot{spots > 1 ? 's' : ''} left</span>
                )}
              </div>
            </div>

            {/* Row 2 — meta */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              fontSize: 12, color: '#6B7280', fontWeight: 500, margin: '8px 0',
            }}>
              <span>{dist.toFixed(1)} km away</span>
              <span style={{ color: '#D1D5DB' }}>•</span>
              <span>{wtime} walk</span>
              <span style={{ color: '#D1D5DB' }}>•</span>
              <span>{spots} openings</span>
              {job.food && (
                <>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span style={{ color: '#065F46', fontWeight: 600 }}>Meals</span>
                </>
              )}
              {job.accommodation && (
                <>
                  <span style={{ color: '#D1D5DB' }}>•</span>
                  <span style={{ color: '#1E40AF', fontWeight: 600 }}>Stay</span>
                </>
              )}
            </div>

            {/* Row 3 — footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #F3F4F6', paddingTop: 10, marginTop: 2,
            }}>
              <div>
                <div style={{
                  fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 20, color: '#111827', lineHeight: 1,
                }}>
                  {salary}<span style={{ fontWeight: 500, fontSize: 11, color: '#9CA3AF' }}>/mo</span>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                  {job.employerRating} rating · {job.employerReviewCount} reviews
                </div>
              </div>
              <div style={{
                background: accent, color: '#fff', borderRadius: 10,
                padding: '9px 18px', fontFamily: 'Baloo 2', fontWeight: 700,
                fontSize: 13, letterSpacing: 0.2,
              }}>
                Apply
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
