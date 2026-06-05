/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CCTVFeed from "../components/CCTVFeed";

function LiveCCTV() {
  const [showModal, setShowModal] = useState(false);
  const [namaArea, setNamaArea] = useState("");
  const [urlKamera, setUrlKamera] = useState("");
  const [statusCam, setStatusCam] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [activeAiUrl, setActiveAiUrl] = useState(null);

  const fetchPythonStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_FLASK}/status`);
      if (res.status === 200) {
        setActiveAiUrl(res.data.current_url || null);
      }
    } catch(e) {
      setActiveAiUrl(null);
    }
  };

  const fetchCameras = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || ""; 
      const response = await axios.get(`${apiUrl}/api/camera/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.status === 200) {
        setAreas(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching cameras:", error);
    }
  };

  useEffect(() => {
    fetchCameras();
    fetchPythonStatus();
    const interval = setInterval(fetchPythonStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setNamaArea("");
    setUrlKamera("");
    setStatusCam(false);
    setEditingCamera(null);
  };

  const openEditModal = (area) => {
    setEditingCamera(area);
    setNamaArea(area.area_name);
    setUrlKamera(area.url || "");
    setStatusCam(area.status_cam === true);
    setShowModal(true);
  };

  const handleSaveArea = async () => {
    if (!namaArea.trim()) {
      alert("Nama area harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || ""; 
      
      const payload = { 
        area_name: namaArea, 
        url: urlKamera,
        status_cam: statusCam
      };

      let response;
      if (editingCamera) {
        // Edit mode (PATCH)
        response = await axios.patch(`${apiUrl}/api/camera/${editingCamera.id}/`, payload, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } else {
        // Create mode (POST)
        response = await axios.post(`${apiUrl}/api/camera/`, payload, {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      }
      
      if (response.status === 200 || response.status === 201) {
        // Sync ke Python YOLO
        try {
          const pyPayload = statusCam 
            ? { url: urlKamera, camera_id: editingCamera ? editingCamera.id : response.data?.id }
            : { url: "", camera_id: null };
            
          await axios.post(`${import.meta.env.VITE_API_FLASK}/update_stream`, pyPayload, {
            headers: { "Content-Type": "application/json" }
          });
          
          if (statusCam) {
            setActiveAiUrl(urlKamera);
          } else if (activeAiUrl === urlKamera) {
            setActiveAiUrl(null);
          }
        } catch(e) {
          console.error("Gagal sinkronisasi ke Python worker:", e);
        }

        await fetchCameras(); // Refresh the list
        fetchPythonStatus();
        handleCloseModal();
        alert(editingCamera ? "Berhasil mengupdate area kamera!" : "Berhasil menambahkan area kamera!");
      }
    } catch (error) {
      console.error("Error saving camera:", error);
      alert("Terjadi kesalahan saat menyimpan data kamera");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCamera = async (id) => {
    const area = areas.find(a => a.id === id);
    if (!area) return;

    if (!window.confirm("Apakah Anda yakin ingin menghapus area ini?")) {
      return;
    }
    
    try {
      // 1 & 2. Pre-Deletion Check dan Graceful Shutdown (Kill Signal)
      if (area.status_cam === true || (area.url && area.url === activeAiUrl)) {
        try {
          await axios.post(`${import.meta.env.VITE_API_FLASK}/update_stream`, {
            url: "",
            camera_id: null
          }, {
            headers: { "Content-Type": "application/json" }
          });
          
          // Hapus state aktif di frontend
          if (activeAiUrl === area.url) {
            setActiveAiUrl(null);
          }
        } catch (pyError) {
          console.warn("Gagal mengirim kill signal ke Python:", pyError);
        }
      }

      // 3. Eksekusi Hapus di Backend Utama (FastAPI)
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const token = localStorage.getItem("token") || ""; 
      
      const response = await axios.delete(`${apiUrl}/api/camera/${id}/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      // 4. Clean Up
      if (response.status === 204 || response.status === 200) {
        await fetchCameras();
        fetchPythonStatus(); // Memastikan state terbaru dengan Python
        alert("Area kamera berhasil dihapus!");
      }
    } catch (error) {
      console.error("Error deleting camera:", error);
      alert("Terjadi kesalahan saat menghapus kamera.");
    }
  };

  const tokenStr = localStorage.getItem("token") || "";
  let isAdmin = false;
  try {
    if (tokenStr) {
      const payload = JSON.parse(atob(tokenStr.split('.')[1]));
      isAdmin = payload.role === 'admin';
    }
  } catch (e) {}

  return (
    <div className="d-flex" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Sidebar activePage="cctv" setActivePage={() => {}} />

      <div className="flex-grow-1" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <Navbar activePage="cctv" setActivePage={() => {}} />

        <div className="p-4" style={{ flexGrow: 1, overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#111827' }}>📷 Live CCTV & Deteksi AI</h2>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                Monitoring video langsung dari ESP32 Cam dengan integrasi YOLO v8.
              </p>
            </div>
            {isAdmin && (
              <button 
                className="btn btn-primary shadow-sm"
                style={{ borderRadius: '8px', fontWeight: '600', padding: '8px 16px' }}
                onClick={() => {
                  setEditingCamera(null);
                  setNamaArea("");
                  setUrlKamera("");
                  setStatusCam(false);
                  setShowModal(true);
                }}
              >
                + Tambah Area
              </button>
            )}
          </div>

          <div className="row">
            {areas.length === 0 ? (
              <div className="col-12 text-center text-muted mt-5">
                <p>Belum ada area CCTV. Silakan tambah area baru.</p>
              </div>
            ) : (
              areas.map((area, index) => {
                const streamUrl = area.url && activeAiUrl === area.url 
                  ? `${import.meta.env.VITE_API_FLASK}/video_feed` 
                  : null;

                return (
                  <div className="col-md-6 mb-3" key={area.id || index}>
                    <CCTVFeed 
                      label={area.area_name} 
                      streamUrl={streamUrl} 
                      cameraId={area.id}
                      currentUrl={area.url || ""}
                      isActive={area.status_cam !== false}
                      isAdmin={isAdmin}
                      onUpdate={() => { fetchCameras(); fetchPythonStatus(); }}
                      onEdit={() => openEditModal(area)}
                      onDelete={() => handleDeleteCamera(area.id)}
                      setActiveAiUrl={setActiveAiUrl}
                    />
                  </div>
                );
              }))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "450px",
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
            }}
          >
            <h4 className="mb-3">{editingCamera ? "Edit Area CCTV" : "Tambah Area CCTV"}</h4>

            <div className="mb-3">
              <label className="form-label">
                Nama Area
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Contoh: Area Produksi"
                value={namaArea}
                onChange={(e) => setNamaArea(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                URL Kamera (Opsional)
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="http://192.168.1.10:81/stream"
                value={urlKamera}
                onChange={(e) => setUrlKamera(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="form-label d-block">Status Kamera</label>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="statusCamSwitch"
                  checked={statusCam}
                  onChange={(e) => setStatusCam(e.target.checked)}
                  disabled={loading}
                  style={{ cursor: "pointer" }}
                />
                <label 
                  className={`form-check-label fw-bold ${statusCam ? "text-success" : "text-danger"}`} 
                  htmlFor="statusCamSwitch"
                  style={{ cursor: "pointer" }}
                >
                  {statusCam ? "Aktif" : "Nonaktif"}
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-secondary"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Batal
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSaveArea}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveCCTV;