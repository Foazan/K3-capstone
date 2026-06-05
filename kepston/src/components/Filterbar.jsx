import React, { useState, useEffect } from 'react';

export default function FilterBar({ 
  periode, lokasi, jenis, startDate, endDate,
  onPeriodeChange, onLokasiChange, onJenisChange, onStartDateChange, onEndDateChange
}) {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8090";
        const token = localStorage.getItem("token") || "";
        const response = await fetch(`${apiUrl}/api/camera`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.items) {
            setCameras(data.items);
          }
        }
      } catch (error) {
        console.error("Error fetching cameras:", error);
      }
    };

    fetchCameras();
  }, []);

  return (
    <div className="card p-4 mb-4 shadow-sm border-0" style={{ borderRadius: 12 }}>
      <div className="d-flex flex-wrap align-items-end gap-4 w-100">
        
        {/* Dropdown 1 */}
        <div style={{ flex: 1, minWidth: "160px", maxWidth: "240px" }}>
          <span className="d-block mb-2 text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Filter Periode</span>
          <select className="form-select" value={periode} onChange={e => onPeriodeChange(e.target.value)}>
            <option value="hari_ini">Hari ini</option>
            <option value="minggu_ini">Minggu ini</option>
            <option value="bulan_ini">Bulan ini</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Dropdown 2 */}
        <div style={{ flex: 1, minWidth: "160px", maxWidth: "240px" }}>
          <span className="d-block mb-2 text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Filter Lokasi</span>
          <select className="form-select" value={lokasi} onChange={e => onLokasiChange(e.target.value)}>
            <option value="semua">Semua Area</option>
            {cameras.map(item => (
              <option key={item.id} value={item.area_name}>{item.area_name}</option>
            ))}
          </select>
        </div>

        {/* Dropdown 3 */}
        <div style={{ flex: 1, minWidth: "160px", maxWidth: "240px" }}>
          <span className="d-block mb-2 text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Jenis Pelanggaran</span>
          <select className="form-select" value={jenis} onChange={e => onJenisChange(e.target.value)}>
            <option value="semua">Semua Jenis</option>
            <option value="helm">Tidak Pakai Helm</option>
            <option value="rompi">Tidak Pakai Rompi</option>
            <option value="sarung_tangan">Tidak Pakai Sarung Tangan</option>
            <option value="sepatu">Tidak Pakai Sepatu</option>
          </select>
        </div>

        {/* Custom Date Inputs (mengalir secara natural di dalam flexbox) */}
        {periode === 'custom' && (
          <>
            <div style={{ flex: 1, minWidth: "160px", maxWidth: "240px", animation: 'fadeIn 0.3s ease-in-out' }}>
               <label className="d-block mb-2 text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Mulai Tanggal</label>
               <input 
                 type="date" 
                 className="form-control" 
                 value={startDate || ""} 
                 onChange={e => onStartDateChange(e.target.value)} 
                 title="Tanggal Mulai"
               />
            </div>
            <div style={{ flex: 1, minWidth: "160px", maxWidth: "240px", animation: 'fadeIn 0.3s ease-in-out' }}>
               <label className="d-block mb-2 text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Sampai Tanggal</label>
               <input 
                 type="date" 
                 className="form-control" 
                 value={endDate || ""} 
                 onChange={e => onEndDateChange(e.target.value)} 
                 title="Tanggal Selesai"
               />
            </div>
          </>
        )}
      </div>
    </div>
  );
}