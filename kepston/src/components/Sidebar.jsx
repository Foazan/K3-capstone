import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { id: "dashboard", icon: "📊", label: "Dashboard", path: "/" },
  { id: "cctv", icon: "📷", label: "Live CCTV", path: "/live-cctv" },
  { id: "laporan", icon: "📋", label: "Laporan", path: "/laporan" },
  { id: "pengguna", icon: "👥", label: "Pengguna", path: "/pengguna" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cameraCount, setCameraCount] = useState(0);

  useEffect(() => {
    const fetchCameraCount = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
        const token = localStorage.getItem("token") || ""; 
        const response = await fetch(`${apiUrl}/api/camera/?status_cam=true`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setCameraCount(result.total || result.items?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching camera count:", error);
      }
    };
    fetchCameraCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <aside 
      className="app-sidebar flex flex-col justify-start pt-8"
      style={{
        position: 'sticky', // Digunakan sticky agar bertingkah seperti fixed saat scroll tapi tidak merusak layout d-flex di sebelahnya
        top: 0,
        height: '100vh',
        width: '260px',
        minWidth: '260px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingTop: '2rem', // Statis pt-8
        margin: 0,
        boxSizing: 'border-box'
      }}
    >
      <div className="sidebar-section-label" style={{ marginTop: 0 }}>Menu Utama</div>

      {menuItems.map((item) => (
        <div
          key={item.id}
          className={`sidebar-menu-item ${
            location.pathname === item.path ? "active" : ""
          }`}
          onClick={() => navigate(item.path)}
        >
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div
        style={{
          margin: "20px 16px 0",
          padding: "12px",
          background: "#f0fdf4",
          borderRadius: 10,
          border: "1px solid #bbf7d0",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#065f46",
            marginBottom: 4,
          }}
        >
          🟢 Sistem Aktif
        </div>

        <div style={{ fontSize: 10.5, color: "#047857" }}>
          AI Detection: Online
        </div>

        <div style={{ fontSize: 10.5, color: "#047857" }}>
          {cameraCount} Kamera Terhubung
        </div>
      </div>

      <div 
        className="sidebar-menu-item" 
        onClick={handleLogout} 
        style={{ marginTop: "auto", marginBottom: "20px", color: "#ef4444", fontWeight: 600, cursor: "pointer" }}
      >
        <span style={{ fontSize: 16 }}>🚪</span>
        Logout
      </div>
    </aside>
  );
}