import React, { useState, useEffect } from 'react';

export default function FilterBar({ periode, lokasi, jenis, onPeriodeChange, onLokasiChange, onJenisChange, violationsData = [] }) {
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
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">Filter Periode</span>
        <select className="filter-select" value={periode} onChange={e => onPeriodeChange(e.target.value)}>
          <option value="hari_ini">Hari ini</option>
          <option value="minggu_ini">Minggu ini</option>
          <option value="bulan_ini">Bulan ini</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Filter Lokasi</span>
        <select className="filter-select" value={lokasi} onChange={e => onLokasiChange(e.target.value)}>
          <option value="semua">Semua Area</option>
          {cameras.map(item => (
            <option key={item.id} value={item.area_name}>{item.area_name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Jenis Pelanggaran</span>
        <select className="filter-select" value={jenis} onChange={e => onJenisChange(e.target.value)}>
          <option value="semua">Semua</option>
          <option value="helm">Tidak Pakai Helm</option>
          <option value="rompi">Tidak Pakai Rompi</option>
          <option value="sarung_tangan">Tidak Pakai Sarung Tangan</option>
          <option value="sepatu">Tidak Pakai Sepatu</option>
        </select>
      </div>
    </div>
  );
}