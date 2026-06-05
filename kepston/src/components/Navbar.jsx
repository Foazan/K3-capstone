import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ activePage, setActivePage }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`${apiUrl}/api/violations/?page_size=3`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          const items = result.items || [];
          setNotifications(items);
          
          const lastSeenId = parseInt(localStorage.getItem('lastSeenViolationId') || '0', 10);
          const newItemsCount = items.filter(item => item.id > lastSeenId).length;
          setUnreadCount(newItemsCount);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const userName = localStorage.getItem('name') || 'Administrator';
  const userInitials = userName.substring(0, 2).toUpperCase();
  
  // Get user info and role from token
  const token = localStorage.getItem("token");
  let userRole = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role) {
        userRole = payload.role;
      }
    } catch (e) {
      console.error("Error decoding token:", e);
    }
  }

  const user = {
    name: userName,
    role: userRole
  };
  
  const isCctvPage = location.pathname === '/live-cctv' || activePage === 'cctv';

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
          className={`nav-icon-btn ${isCctvPage ? 'active-cctv' : ''}`}
          onClick={() => {
            if (isCctvPage) {
              navigate('/');
              if (setActivePage) setActivePage('dashboard');
            } else {
              navigate('/live-cctv');
              if (setActivePage) setActivePage('cctv');
            }
          }}
          title="Live CCTV"
        >
          📷
          {isCctvPage && (
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
        <div style={{ position: 'relative' }}>
          <button 
            className="nav-icon-btn" 
            title="Notifikasi"
            onClick={() => {
              setShowDropdown(!showDropdown);
              if (!showDropdown) {
                if (notifications.length > 0) {
                  const latestId = notifications[0].id;
                  localStorage.setItem('lastSeenViolationId', latestId.toString());
                }
                setUnreadCount(0);
              }
            }}
          >
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: '-10px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              color: '#1e293b',
              width: '320px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              zIndex: 1000,
              padding: '15px',
              border: '1px solid #e5e7eb',
              textAlign: 'left'
            }}>
              <h6 style={{ margin: '0 0 12px 0', paddingBottom: '8px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>
                Pelanggaran Terbaru
              </h6>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', padding: '10px 0' }}>Tidak ada notifikasi</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notifications.map(notif => {
                    let dateStr = notif.created_at || new Date().toISOString();
                    if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
                      dateStr += "Z";
                    }
                    const dateObj = new Date(dateStr);
                    return (
                      <div key={notif.id} style={{ fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>
                          <span style={{ color: '#f05252' }}>⚠️</span> {notif.violation_type?.label_name || 'Pelanggaran'}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>📍 {notif.camera?.area_name || 'Lokasi tidak diketahui'}</div>
                        <div style={{ color: '#6b7280', fontSize: '11px' }}>🕒 {dateObj.toLocaleString('id-ID')}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
          <div className="user-avatar">{userInitials}</div>
          <div className="user-info d-none d-md-block">
            <div className="name">{user?.name}</div>
            <div className="role">
              {user?.role === 'manager' ? 'Manager Area' : user?.role === 'admin' ? 'Administrator' : 'Pengguna'}
            </div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>▾</span>
        </div>
      </div>
    </nav>
  );
}