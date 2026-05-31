import React from 'react';

export default function Navbar({ activePage, setActivePage }) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const userName = localStorage.getItem('name') || 'Administrator';
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <nav className="app-navbar">
      {/* Left: Logo */}
      <div className="d-flex align-items-center">
        <span className="navbar-logo">EPSON®</span>
        <span className="navbar-title">K3 Monitoring Dashboard</span>
      </div>

      {/* Right: Actions */}
      <div className="navbar-actions">
        <div className="d-none d-md-flex align-items-center gap-1 me-2">
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            {dateStr} · {timeStr}
          </span>
        </div>

        {/* Live CCTV Button */}
        <button
          className={`nav-icon-btn ${activePage === 'cctv' ? 'active-cctv' : ''}`}
          onClick={() => setActivePage(activePage === 'cctv' ? 'dashboard' : 'cctv')}
          title="Live CCTV"
        >
          📷
          {activePage === 'cctv' && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              background: '#f05252', color: '#fff',
              fontSize: 8, fontWeight: 700,
              borderRadius: 20, padding: '1px 5px',
              fontFamily: 'monospace'
            }}>LIVE</span>
          )}
        </button>

        {/* Notification */}
        <button className="nav-icon-btn" title="Notifikasi">
          🔔
          <span className="notif-badge">3</span>
        </button>

        {/* User */}
        <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
          <div className="user-avatar">{userInitials}</div>
          <div className="user-info d-none d-md-block">
            <div className="name">{userName}</div>
            <div className="role">Administrator</div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>▾</span>
        </div>
      </div>
    </nav>
  );
}