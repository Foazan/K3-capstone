import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/' },
  { id: 'cctv', icon: '📷', label: 'Live CCTV', path: '/live-cctv' },
];

const menuLaporan = [
  { id: 'laporan', icon: '📋', label: 'Laporan', path: '/laporan' },
  { id: 'riwayat', icon: '🕒', label: 'Riwayat', path: '/riwayat' },
];

const menuPengaturan = [
  { id: 'area', icon: '📍', label: 'Kelola Area', path: '/area' },
  { id: 'pengguna', icon: '👥', label: 'Pengguna', path: '/pengguna' },
  { id: 'pengaturan', icon: '⚙️', label: 'Pengaturan', path: '/pengaturan' },
];

export default function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const [cameraCount, setCameraCount] = useState(1);

  const handleMenuClick = (item) => {
    if (setActivePage) setActivePage(item.id);
    if (item.path) navigate(item.path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-section-label">Menu Utama</div>
      {menuItems.map(item => (
        <div
          key={item.id}
          className={`sidebar-menu-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => handleMenuClick(item)}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div className="sidebar-section-label">Laporan</div>
      {menuLaporan.map(item => (
        <div
          key={item.id}
          className={`sidebar-menu-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => handleMenuClick(item)}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div className="sidebar-section-label">Pengaturan</div>
      {menuPengaturan.map(item => (
        <div
          key={item.id}
          className={`sidebar-menu-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => handleMenuClick(item)}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      {/* System status */}
      <div style={{ margin: '20px 16px 0', padding: '12px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>🟢 Sistem Aktif</div>
        <div style={{ fontSize: 10.5, color: '#047857' }}>AI Detection: Online</div>
        <div style={{ fontSize: 10.5, color: '#047857' }}>{cameraCount} Kamera Terhubung</div>
      </div>

      <div 
        className="sidebar-menu-item" 
        onClick={handleLogout} 
        style={{ marginTop: 'auto', marginBottom: '20px', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 16 }}>🚪</span>
        Logout
      </div>
    </aside>
  );
}