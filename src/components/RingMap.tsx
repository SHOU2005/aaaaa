// ── RingMap — Premium Map with OpenStreetMap tiles + job cards ─────────────────
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import type { Job } from '../types';
import { haversine, formatSalary, walkTime } from '../data/store';

const CAT_COLORS: Record<string, string> = {
  security:    '#1B6B3A',
  housekeeping:'#E88C2A',
  driver:      '#2563EB',
  cook:        '#7C3AED',
  helper:      '#DC2626',
  technician:  '#0891B2',
  gardener:    '#059669',
  caretaker:   '#DB2777',
};
const CAT_ICONS: Record<string, string> = {
  security: '🔒', housekeeping: '🧹', driver: '🚗', cook: '👨‍🍳',
  helper: '🏗️', technician: '🔧', gardener: '🌿', caretaker: '👴',
};

const salaryColor = (min: number) =>
  min >= 15000 ? '#16A34A' : min >= 12000 ? '#CA8A04' : min >= 9000 ? '#EA580C' : '#DC2626';

function MapSync() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 300); }, [map]);
  return null;
}

interface Props { jobs: Job[]; workerLat: number; workerLng: number; fullscreen?: boolean; }
interface Sel   { job: Job; dist: number; }

export function RingMap({ jobs, workerLat, workerLng, fullscreen }: Props) {
  const [sel,  setSel]  = useState<Sel | null>(null);
  const [mode, setMode] = useState<'category' | 'salary'>('category');
  const navigate = useNavigate();

  const center: [number, number] = [workerLat, workerLng];

  const mapJobs = useMemo(() =>
    jobs.filter(j => j.active)
      .map(j => ({ job: j, dist: haversine(workerLat, workerLng, j.lat, j.lng) }))
      .filter(d => d.dist <= 6),
    [jobs, workerLat, workerLng]
  );

  // Premium worker marker — pulsing green dot
  const workerIcon = useMemo(() => L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:24px;height:24px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(22,132,72,0.25);
          animation:ripple 1.8s ease-out infinite;
        "></div>
        <div style="
          position:absolute;inset:4px;border-radius:50%;
          background:#168448;
          border:2.5px solid white;
          box-shadow:0 2px 8px rgba(22,132,72,0.5);
        "></div>
      </div>
      <style>
        @keyframes ripple {
          0%{transform:scale(0.8);opacity:0.8}
          100%{transform:scale(2.4);opacity:0}
        }
      </style>
    `,
    iconSize: [24, 24], iconAnchor: [12, 12],
  }), []);

  const makeJobIcon = useCallback((job: Job, isSelected: boolean) => {
    const color = mode === 'salary' ? salaryColor(job.salary.min) : (CAT_COLORS[job.category] || '#6B7280');
    const emoji = CAT_ICONS[job.category] || '💼';
    const shortRole = job.role.length > 11 ? job.role.slice(0, 10) + '…' : job.role;
    const salaryK = `₹${Math.round(job.salary.min / 1000)}k`;

    if (isSelected) {
      return L.divIcon({
        className: '',
        html: `
          <div style="
            background:${color};border-radius:12px;
            padding:6px 10px;
            box-shadow:0 4px 18px rgba(0,0,0,0.28),0 0 0 3px rgba(255,255,255,0.95);
            display:flex;flex-direction:column;align-items:flex-start;gap:2px;
            min-width:108px;position:relative;
          ">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-size:12px;line-height:1;">${emoji}</span>
              <span style="font-size:11px;font-weight:800;color:#fff;font-family:sans-serif;white-space:nowrap;line-height:1.2;">${shortRole}</span>
            </div>
            <div style="font-size:14px;font-weight:900;color:#fff;font-family:sans-serif;line-height:1;">
              ${salaryK}<span style="font-size:9px;font-weight:600;opacity:0.75;">/mo</span>
            </div>
            <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid ${color};"></div>
          </div>`,
        iconSize: [120, 50],
        iconAnchor: [60, 56],
      });
    }

    return L.divIcon({
      className: '',
      html: `
        <div style="
          background:${color};border-radius:999px;
          padding:4px 7px;
          box-shadow:0 2px 8px rgba(0,0,0,0.22);
          border:2px solid rgba(255,255,255,0.92);
          display:flex;align-items:center;gap:3px;white-space:nowrap;
        ">
          <span style="font-size:10px;line-height:1;">${emoji}</span>
          <span style="font-size:11px;font-weight:700;color:#fff;font-family:sans-serif;">${salaryK}</span>
          ${job.urgent ? '<span style="font-size:8px;color:#FFD700;">⚡</span>' : ''}
        </div>`,
      iconSize: [72, 24],
      iconAnchor: [36, 24],
    });
  }, [mode]);

  const categories = [...new Set(mapJobs.map(d => d.job.category))];
  const mapHeight = fullscreen ? 'calc(100dvh - 260px)' : 280;

  return (
    <div className="map-card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="map-head">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="map-title">🗺️ Jobs Near Me</span>
          <span style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 1 }}>
            {mapJobs.length} jobs within 6km
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="map-toggle">
            <button className={`mt-btn ${mode === 'category' ? 'on' : ''}`} onClick={() => setMode('category')}>Role</button>
            <button className={`mt-btn ${mode === 'salary'   ? 'on' : ''}`} onClick={() => setMode('salary')}>₹ Pay</button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: mapHeight, position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={14}
          zoomControl={false}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <MapSync />

          {/* Premium OSM-based map tiles (CartoDB Voyager — looks like Google Maps) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={20}
          />

          {/* Distance rings */}
          {[1000, 3000, 5000].map((r, i) => (
            <Circle key={r} center={center} radius={r} pathOptions={{
              color: '#168448',
              fillColor: '#168448',
              fillOpacity: i === 0 ? 0.05 : 0,
              weight: i === 0 ? 2.5 : 1.5,
              dashArray: i > 0 ? '6 4' : undefined,
              opacity: 0.6,
            }} />
          ))}

          {/* Worker dot */}
          <Marker position={center} icon={workerIcon} />

          {/* Job markers */}
          {mapJobs.map(({ job, dist }) => {
            const isSelected = sel?.job.id === job.id;
            return (
              <Marker
                key={`${job.id}-${mode}`}
                position={[job.lat, job.lng]}
                icon={makeJobIcon(job, isSelected)}
                eventHandlers={{
                  click: () => setSel(prev => prev?.job.id === job.id ? null : { job, dist }),
                }}
              />
            );
          })}

          <ZoomControl position="bottomright" />
        </MapContainer>

        {/* Job popover */}
        {sel && (
          <div className="map-pop anim-slide" onClick={() => navigate(`/jobs/${sel.job.id}`)}>
            <button className="map-pop-close" onClick={e => { e.stopPropagation(); setSel(null); }}>✕</button>

            {/* Top row: icon + title */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--r-sm)', flexShrink: 0,
                background: (CAT_COLORS[sel.job.category] || '#6B7280') + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              }}>
                {CAT_ICONS[sel.job.category] || '💼'}
              </div>
              <div style={{ flex: 1 }}>
                <div className="map-pop-role">{sel.job.role}</div>
                <div className="map-pop-company">{sel.job.employerName}</div>
              </div>
            </div>

            <div className="map-pop-pills">
              <span className="badge badge-green">📍 {sel.dist.toFixed(1)} km · {walkTime(sel.dist)}</span>
              {sel.job.urgent && <span className="badge badge-red">⚡ Urgent</span>}
              <span className="badge badge-blue">👤 {sel.job.openings} खाली</span>
              {sel.job.food && <span className="badge badge-green">🍽️ खाना</span>}
            </div>

            <div className="map-pop-foot">
              <div>
                <div className="map-pop-salary">
                  {formatSalary(sel.job.salary.min, sel.job.salary.max)}
                  <span style={{ fontSize: 12, color: 'var(--text-lo)', fontWeight: 400 }}>/माह</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 2 }}>⭐ {sel.job.employerRating}</div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={e => { e.stopPropagation(); navigate(`/jobs/${sel.job.id}`); }}
              >
                Apply करें →
              </button>
            </div>
          </div>
        )}

        {/* Distance ring labels */}
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 500,
          display: 'flex', flexDirection: 'column', gap: 3, pointerEvents: 'none',
        }}>
          {['1km', '3km', '5km'].map(l => (
            <div key={l} style={{
              background: 'rgba(255,255,255,0.85)', borderRadius: 6,
              padding: '2px 6px', fontSize: 10, fontWeight: 700, color: 'var(--g700)',
              backdropFilter: 'blur(4px)',
            }}>{l}</div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 10, padding: '10px 14px',
        overflowX: 'auto', borderTop: '1px solid var(--divider)',
        background: 'var(--n50)',
      }}>
        {mode === 'category'
          ? categories.map(cat => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-lo)', whiteSpace: 'nowrap' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[cat] || '#6B7280' }} />
                {CAT_ICONS[cat] || '💼'} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </div>
            ))
          : [['#16A34A','₹15k+'],['#CA8A04','₹12–15k'],['#EA580C','₹9–12k'],['#DC2626','<₹9k']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: 'var(--text-lo)', whiteSpace: 'nowrap' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                {l}
              </div>
            ))
        }
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-lo)', whiteSpace: 'nowrap' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#168448', border: '2px solid white', boxShadow: '0 0 0 2px rgba(22,132,72,0.3)' }} />
          आप
        </div>
      </div>
    </div>
  );
}
