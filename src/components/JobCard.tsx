import React from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { haversine, walkTime, formatSalary, getCaptain } from '../data/store';

export const CAT_LABEL: Record<string, string> = {
  security:     'Security',
  housekeeping: 'Housekeeping',
  driver:       'Driver',
  cook:         'Cook',
  helper:       'Helper',
  technician:   'Technician',
  gardener:     'Gardener',
  caretaker:    'Caretaker',
  skill:        'Skilled',
};

export const CAT_ACCENT: Record<string, string> = {
  security:     '#1B6B3A',
  housekeeping: '#B45309',
  driver:       '#1D4ED8',
  cook:         '#6D28D9',
  helper:       '#B91C1C',
  technician:   '#0E7490',
  gardener:     '#059669',
  caretaker:    '#DB2777',
  skill:        '#374151',
};

interface Props {
  job: Job;
  workerLat: number;
  workerLng: number;
  compact?: boolean;
}

export function JobCard({ job, workerLat, workerLng, compact }: Props) {
  const dist   = haversine(workerLat, workerLng, job.lat, job.lng);
  const wtime  = walkTime(dist);
  const accent = CAT_ACCENT[job.category] || '#374151';
  const salary = formatSalary(job.salary.min, job.salary.max);
  const spots  = job.openings - job.filled;
  const captain = getCaptain(job.captainId);
  const isNew  = (Date.now() - new Date(job.postedAt).getTime()) < 48 * 60 * 60 * 1000;

  const waMsg = captain
    ? encodeURIComponent(
        `नमस्कार ${captain.name} जी! मेरा नाम ... है। आपके Switch पर "${job.role}" की नौकरी के बारे में जानकारी चाहिए थी (${job.employerName})। कृपया संपर्क करें।`
      )
    : encodeURIComponent(`नमस्कार! "${job.role}" की नौकरी के बारे में जानकारी चाहिए (${job.employerName}, ${job.location})।`);

  const waHref = captain
    ? `https://wa.me/91${captain.mobile}?text=${waMsg}`
    : `https://wa.me/?text=${waMsg}`;

  const perksLabel = [
    job.food && 'खाना',
    job.accommodation && 'रहना',
  ].filter(Boolean).join('+');

  /* ─── Compact horizontal card ─── */
  if (compact) return (
    <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div style={{
        width: 196,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        boxShadow: '0 2px 14px rgba(0,0,0,0.07)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ height: 3, background: accent }} />
        <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: accent, textTransform: 'uppercase' }}>
              {CAT_LABEL[job.category] || 'Job'}
            </span>
            {job.urgent && (
              <span style={{ fontSize: 9, fontWeight: 700, color: '#B91C1C', background: '#FEF2F2', padding: '1px 5px', borderRadius: 4 }}>
                ⚡ Urgent
              </span>
            )}
          </div>

          {/* SALARY HERO */}
          <div>
            <span style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 20, color: '#0D1B0F', letterSpacing: -0.3, lineHeight: 1 }}>
              {salary}
            </span>
            <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>/माह</span>
          </div>

          <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 13, color: '#111827', lineHeight: 1.25,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
            {job.role}
          </div>

          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {job.employerName}
          </div>

          <div style={{ height: 1, background: '#F3F4F6' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF' }}>
            <span>📍 {dist.toFixed(1)} km</span>
            <span style={{ display: 'flex', gap: 3 }}>
              {job.food && <span title="खाना">🍽️</span>}
              {job.accommodation && <span title="रहना">🛏️</span>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  /* ─── Full card ─── */
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E8EAE6',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      }}>
        {/* Top accent bar */}
        <div style={{ height: 4, background: accent }} />

        {/* Card body — tappable to open detail */}
        <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', display: 'block', padding: '14px 16px 12px' }}>

          {/* Row 1: category label + badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {CAT_LABEL[job.category] || 'Job'}
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {isNew && !job.urgent && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#1B6B3A', background: '#ECFDF5', padding: '2px 6px', borderRadius: 5, letterSpacing: 0.3 }}>NEW</span>
              )}
              {job.urgent && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#B91C1C', background: '#FEF2F2', padding: '2px 6px', borderRadius: 5, letterSpacing: 0.3 }}>⚡ URGENT</span>
              )}
              {spots <= 2 && spots > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, color: '#92400E', background: '#FFF7ED', padding: '2px 6px', borderRadius: 5 }}>{spots} बचे</span>
              )}
            </div>
          </div>

          {/* SALARY — dominant visual element */}
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontFamily: 'Baloo 2', fontWeight: 900, fontSize: 26, color: '#0D1B0F', letterSpacing: -0.5, lineHeight: 1 }}>
              {salary}
            </span>
            <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginLeft: 4 }}>/माह</span>
            {perksLabel && (
              <span style={{
                display: 'inline-block', marginLeft: 10, fontSize: 11, fontWeight: 700,
                color: '#065F46', background: '#ECFDF5', borderRadius: 6,
                padding: '2px 8px', verticalAlign: 'middle',
              }}>
                +{perksLabel} FREE
              </span>
            )}
          </div>

          {/* Role + employer */}
          <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: 16, color: '#111827', lineHeight: 1.2, marginBottom: 3 }}>
            {job.role}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 500, marginBottom: 12 }}>
            {job.employerName}
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', borderRadius: 7, padding: '3px 9px' }}>
              📍 {dist.toFixed(1)} km
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', borderRadius: 7, padding: '3px 9px' }}>
              🚶 {wtime}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', borderRadius: 7, padding: '3px 9px' }}>
              👤 {spots} खाली
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4B5563', background: '#F3F4F6', borderRadius: 7, padding: '3px 9px' }}>
              ⭐ {job.employerRating}
            </span>
          </div>
        </Link>

        {/* Action bar — outside the Link to avoid nested anchors */}
        <div style={{ display: 'flex', borderTop: '1px solid #F3F4F6' }}>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: '#ECFDF5', color: '#15803D',
              padding: '11px 0', fontSize: 13, fontWeight: 700, textDecoration: 'none',
              borderRight: '1px solid #F3F4F6',
            }}
            onClick={e => e.stopPropagation()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12.016 0C5.396 0 .016 5.38.016 12c0 2.126.558 4.122 1.528 5.854L.005 24l6.335-1.653A11.963 11.963 0 0012.016 24C18.636 24 24 18.62 24 12S18.636 0 12.016 0zm0 21.818c-1.96 0-3.784-.528-5.354-1.44l-.385-.228-3.977 1.038 1.058-3.863-.25-.4A9.797 9.797 0 012.2 12c0-5.412 4.404-9.818 9.816-9.818 5.412 0 9.818 4.406 9.818 9.818 0 5.412-4.406 9.818-9.818 9.818z"/>
            </svg>
            WhatsApp
          </a>
          <Link
            to={`/jobs/${job.id}`}
            style={{
              flex: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: accent, color: '#fff',
              padding: '11px 0', fontSize: 13, fontWeight: 700, textDecoration: 'none',
            }}
          >
            अप्लाई करें →
          </Link>
        </div>
      </div>
    </div>
  );
}
