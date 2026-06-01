import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CCTVFeed from "../components/CCTVFeed";

function LiveCCTV() {
  const [activePage, setActivePage] = useState("cctv");
  const [streamStatus, setStreamStatus] = useState("loading");

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content */}
      <div className="flex-grow-1">
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        <div className="container-fluid mt-3">
          <h4>Live CCTV Monitoring</h4>

          <div className="row mt-3">
            <div className="col-md-6 mb-3">
              <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '225px', backgroundColor: '#0d1117', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Fallback / Loading State */}
                {streamStatus !== 'playing' && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', textAlign: 'center', zIndex: 2 }}>
                    {streamStatus === 'loading' ? (
                      <>
                        <div className="spinner-border spinner-border-sm mb-2" role="status"></div>
                        <div style={{ fontSize: '14px' }}>Loading stream...</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '14px' }}>Kamera Offline</div>
                    )}
                  </div>
                )}
                
                {/* Image Stream */}
                <img 
                  src={streamStatus === 'error' ? '' : (import.meta.env.VITE_STREAM_URL || "http://localhost:5000/video_feed")}
                  alt="Live CCTV"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    display: streamStatus === 'playing' ? 'block' : 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                  onLoad={() => setStreamStatus('playing')}
                  onError={() => setStreamStatus('error')}
                />
                
                {/* Label Overlay like CCTVFeed */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', fontSize: '12px', zIndex: 3, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
                  CCTV Area 1
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <CCTVFeed title="CCTV Area 2" />
            </div>
            <div className="col-md-6 mb-3">
              <CCTVFeed title="CCTV Area 3" />
            </div>
            <div className="col-md-6 mb-3">
              <CCTVFeed title="CCTV Area 4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveCCTV;