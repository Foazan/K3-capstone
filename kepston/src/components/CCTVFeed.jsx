import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2 } from 'lucide-react';

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function CCTVFeed({ label, hasAlert, alertMessage, streamUrl, cameraId, currentUrl, isActive = true, isAdmin = false, onUpdate, onEdit, onDelete, setActiveAiUrl }) {
  const [inputUrl, setInputUrl] = useState(currentUrl || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeStreamUrl, setActiveStreamUrl] = useState(streamUrl);
  const [hasError, setHasError] = useState(false);
  const time = useTime();
  const timeStr = time.toLocaleTimeString('id-ID');
  const dateStr = time.toLocaleDateString('id-ID');

  useEffect(() => {
    setActiveStreamUrl(streamUrl);
    setInputUrl(currentUrl || "");
    setHasError(false);
  }, [streamUrl, currentUrl]);

  const handleUpdateUrl = async () => {
    if (!inputUrl.trim()) {
      alert("URL tidak boleh kosong!");
      return;
    }
    
    setIsUpdating(true);
    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || ""; 
      
      const payload = { 
        area_name: label, 
        status_cam: true, 
        url: inputUrl 
      };

      const response = await axios.patch(`${apiUrl}/api/camera/${cameraId}/`, payload, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        try {
          await axios.post(`${import.meta.env.VITE_API_FLASK}/update_stream`, { 
            url: inputUrl, 
            camera_id: cameraId 
          }, {
            headers: { "Content-Type": "application/json" }
          });
          
          if (setActiveAiUrl) {
            setActiveAiUrl(inputUrl); // Segera perbarui state di parent
          }
        } catch(e) {
          console.error("Error contacting Python worker:", e);
          alert("Peringatan: Gagal menghubungi server AI Python (CORS/Offline). " + (e.response?.data?.message || e.message));
        }
        
        if (onUpdate) onUpdate();
        setActiveStreamUrl(`${import.meta.env.VITE_API_FLASK}/video_feed`);
        setHasError(false);
        alert("Berhasil! Kamera sedang dihubungkan.");
      }
    } catch (error) {
      console.error("Error from backend:", error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '8px', opacity: isActive ? 1 : 0.7 }}>
      <div className={`cctv-feed ${hasAlert && isActive ? 'active-alert' : ''}`} style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', backgroundColor: '#0d1117' }}>
        
        {/* Action Buttons Overlay */}
        {isAdmin && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 11, display: 'flex', gap: '8px' }}>
            <button 
               className="btn btn-light shadow-sm" 
               style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85, transition: '0.2s' }} 
               onClick={onEdit}
               title="Edit Kamera"
               onMouseEnter={e => e.currentTarget.style.opacity = '1'}
               onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
             >
                <Edit2 size={16} color="#3b82f6" />
             </button>
             <button 
               className="btn btn-light shadow-sm" 
               style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.85, transition: '0.2s' }} 
               onClick={onDelete}
               title="Hapus Kamera"
               onMouseEnter={e => e.currentTarget.style.opacity = '1'}
               onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
             >
                <Trash2 size={16} color="#ef4444" />
             </button>
          </div>
        )}

        {!isActive ? (
          <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', height: '100%', color: '#6b7280', fontWeight: 'bold' }}>
            <div className="text-center">
               <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏸️</div>
               <div>Kamera Nonaktif</div>
            </div>
          </div>
        ) : !activeStreamUrl ? (
          <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', height: '100%', color: '#9ca3af', fontWeight: 'bold' }}>
            <div className="text-center">
               <div style={{ fontSize: '24px', marginBottom: '8px' }}>📡</div>
               <div>Menunggu Sinyal</div>
            </div>
          </div>
        ) : hasError ? (
          <div className="d-flex align-items-center justify-content-center" style={{ width: '100%', height: '100%', color: '#ef4444', fontWeight: 'bold' }}>
            <div className="text-center">
               <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
               <div>Kamera Offline</div>
            </div>
          </div>
        ) : (
          <img 
            src={activeStreamUrl} 
            alt={`CCTV Feed - ${label}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            onError={() => setHasError(true)}
          />
        )}

        {/* Alert overlay */}
        {hasAlert && (
          <div className="cctv-alert-overlay" style={{ zIndex: 10 }}>
            <span className="cctv-alert-badge">⚠ {alertMessage}</span>
          </div>
        )}

        {/* Label */}
        <div className="cctv-label" style={{ zIndex: 10 }}>
          <span className="live-dot" />
          {label}
        </div>

        {/* Timestamp */}
        <div className="cctv-timestamp" style={{ zIndex: 10 }}>{dateStr} {timeStr}</div>

        {/* Scan line */}
        <div className="cctv-bottom-bar" style={{ zIndex: 10 }} />
      </div>

      {/* Controller Form */}
      {isAdmin && (
        <div className="p-2 bg-white border-top">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light text-muted border-end-0" style={{ fontSize: '11px', fontWeight: '600' }}>
              IP
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="http://192.168.1.x:81/stream" 
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              style={{ fontSize: '12px' }}
            />
            <button 
              className="btn btn-primary" 
              type="button" 
              onClick={handleUpdateUrl}
              disabled={isUpdating}
              style={{ fontSize: '12px', fontWeight: '600', padding: '4px 12px' }}
            >
              {isUpdating ? "Connecting..." : "Hubungkan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}