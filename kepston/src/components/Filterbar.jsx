import React from 'react';

export default function FilterBar({ periode, lokasi, jenis, onPeriodeChange, onLokasiChange, onJenisChange, violationsData = [] }) {
  const uniqueLocations = [...new Set(violationsData.map(v => v.lokasi))].filter(Boolean);
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
          {uniqueLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Jenis Pelanggaran</span>
        <select className="filter-select" value={jenis} onChange={e => onJenisChange(e.target.value)}>
          <option value="semua">Semua</option>
          <option value="helm">Tidak Pakai Helm</option>
          <option value="rompi">Tidak Pakai Rompi</option>
        </select>
      </div>
    </div>
  );
}