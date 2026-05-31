import React, { useState, useEffect } from 'react';

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function SilhouetteSvg({ hasViolation, violationType }) {
  const color = hasViolation ? '#f87171' : '#4ade80';
  const helmetColor = hasViolation && violationType === 'helm' ? '#f87171' : '#fbbf24';
  const vestColor = hasViolation && violationType === 'rompi' ? '#f87171' : '#f97316';

  return (
    <svg width="70" height="120" viewBox="0 0 70 120" fill="none">
      <circle cx="35" cy="20" r="12" fill={color} opacity="0.8" />
      <ellipse cx="35" cy="11" rx="14" ry="7" fill={helmetColor} opacity="0.9" />
      <rect x="22" y="35" width="26" height="35" rx="6" fill={vestColor} opacity="0.85" />
      <rect x="8" y="37" width="12" height="28" rx="5" fill={color} opacity="0.7" />
      <rect x="50" y="37" width="12" height="28" rx="5" fill={color} opacity="0.7" />
      <rect x="22" y="71" width="11" height="35" rx="5" fill={color} opacity="0.7" />
      <rect x="37" y="71" width="11" height="35" rx="5" fill={color} opacity="0.7" />
    </svg>
  );
}

export default function CCTVFeed({ label, hasAlert, alertType, alertMessage, sceneType = 'warehouse' }) {
  const time = useTime();
  const timeStr = time.toLocaleTimeString('id-ID');
  const dateStr = time.toLocaleDateString('id-ID');

  const sceneColors = {
    warehouse: { bg: '#0d1117', floor: '#1a1f2e', accent: '#1e293b' },
    area_a: { bg: '#0a1628', floor: '#1a2540', accent: '#1e3a5f' },
    area_b: { bg: '#0d1f0d', floor: '#1a2e1a', accent: '#1e3b1e' },
    area_c: { bg: '#1a0d0d', floor: '#2e1a1a', accent: '#3b1e1e' },
  };

  const colors = sceneColors[sceneType] || sceneColors.warehouse;

  return (
    <div className={`cctv-feed ${hasAlert ? 'active-alert' : ''}`}>
      <div className="cctv-bg" style={{ background: `linear-gradient(160deg, ${colors.bg} 0%, ${colors.floor} 60%, ${colors.accent} 100%)` }} />

      <svg className="cctv-grid-detail" viewBox="0 0 400 225" preserveAspectRatio="none">
        {[0.3, 0.5, 0.7, 0.9].map((y, i) => (
          <line key={i} x1="0" y1={y * 225} x2="400" y2={y * 225} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {[-200, -100, 0, 100, 200, 300, 400, 500, 600].map((x, i) => (
          <line key={i} x1={x} y1="130" x2="200" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {/* Corner brackets */}
        <path d="M10 10 L10 22 M10 10 L22 10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        <path d="M390 10 L390 22 M390 10 L378 10" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        <path d="M10 215 L10 203 M10 215 L22 215" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
        <path d="M390 215 L390 203 M390 215 L378 215" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
      </svg>

      {/* Silhouettes scene */}
      <div className="cctv-scene">
        <div style={{ position: 'absolute', bottom: '15%', left: '20%', transform: 'scale(0.8)' }}>
          <SilhouetteSvg hasViolation={hasAlert} violationType={alertType} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'scale(0.95)' }}>
          <SilhouetteSvg hasViolation={false} />
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '68%', transform: 'scale(0.75)' }}>
          <SilhouetteSvg hasViolation={false} />
        </div>

        {/* Detection box */}
        {hasAlert && (
          <div style={{
            position: 'absolute', bottom: '12%', left: '17%',
            width: 80, height: 130,
            border: '2px solid #f87171',
            borderRadius: 4,
            boxShadow: '0 0 12px rgba(248,113,113,0.5)'
          }}>
            <div style={{
              position: 'absolute', top: -18, left: 0,
              background: '#f87171', color: '#fff',
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
              whiteSpace: 'nowrap', fontFamily: 'monospace'
            }}>
              VIOLATION {Math.floor(Math.random() * 30 + 80)}%
            </div>
          </div>
        )}
      </div>

      {/* Alert overlay */}
      {hasAlert && (
        <div className="cctv-alert-overlay">
          <span className="cctv-alert-badge">⚠ {alertMessage}</span>
        </div>
      )}

      {/* Label */}
      <div className="cctv-label">
        <span className="live-dot" />
        {label}
      </div>

      {/* Timestamp */}
      <div className="cctv-timestamp">{dateStr} {timeStr}</div>

      {/* Scan line */}
      <div className="cctv-bottom-bar" />
    </div>
  );
}