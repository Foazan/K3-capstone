import React, { useState } from 'react';
import IdentifyModal from './IdentifyModal';



export default function ViolationTable({ data = [], onUpdateRow }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);

  // const handleStatusToggle = (id) => {
  //   setData(prev => prev.map(row =>
  //     row.id === id
  //       ? { ...row, status: row.status === 'Sudah Ditindak' ? 'Belum Ditindak' : 'Sudah Ditindak' }
  //       : row
  //   ));
  // };

  const handleLihatBukti = (row) => {
    setSelectedRow(row);
    setShowModal(true);
  };
  const handleOpenIdentify = (row) => {
  if (row.status === "Belum Ditindak") {
    setSelectedRow(row);
    setShowIdentifyModal(true);
  }
};

const handleIdentifySubmit = (id, nama, user_id) => {
  if (onUpdateRow) {
    onUpdateRow(id, {
      status: "Sudah Ditindak",
      nama,
      user_id,
    });
  }

  setShowIdentifyModal(false);
};

  return (
    <div className="data-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 style={{ fontWeight: 700, margin: 0 }}>Data Pelanggaran</h6>
        <div className="d-flex gap-2">
          <button style={{
            background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
            padding: '5px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', color: '#374151'
          }}>
            ⬇ Export
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Waktu</th>
              <th>Jenis Pelanggaran</th>
              <th>Lokasi</th>
              <th>Status</th>
              <th>Bukti</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td style={{ fontWeight: 500 }}>{row.tanggal}</td>
                <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{row.waktu}</td>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {row.jenis === 'Tidak Pakai Helm' ? '⛑️' : '🦺'} {row.jenis}
                  </span>
                </td>
                <td>
                  <span style={{
                    background: '#f0f4ff', color: '#1a56db',
                    borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600
                  }}>{row.lokasi}</span>
                </td>
                <td>
                  <span
                    className={`badge-status ${row.status === 'Sudah Ditindak' ? 'badge-done' : 'badge-pending'}`}
                    onClick={() => handleOpenIdentify(row)}
                    style={{
                      cursor: row.status === "Belum Ditindak" ? "pointer" : "default",
                      background: row.status === 'Sudah Ditindak' ? '#def7ec' : '#fde8e8',
                      color: row.status === 'Sudah Ditindak' ? '#03543f' : '#9b1c1c',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}
                  >
                    {row.status}
                  </span>
                </td>
                <td>
                  <button className="btn-bukti" onClick={() => handleLihatBukti(row)}>
                    Lihat Bukti ▾
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
      </div>
      {showIdentifyModal && selectedRow && (
        <IdentifyModal
          data={selectedRow}
          onClose={() => setShowIdentifyModal(false)}
          onSuccess={handleIdentifySubmit}
        />
      )}
      {/* Modal Bukti */}
      {showModal && selectedRow && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: 28, maxWidth: 440, width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 style={{ fontWeight: 800, margin: 0 }}>📸 Bukti Pelanggaran</h6>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}
              >×</button>
            </div>

            {/* Real CCTV snapshot */}
            <div style={{
              background: '#f3f4f6', borderRadius: 12, aspectRatio: '16/9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden', marginBottom: 16
            }}>
              <img 
                src={selectedRow.image_path || "https://placehold.co/600x400/111/4ade80?text=NO+IMAGE+AVAILABLE"} 
                alt="Bukti Pelanggaran"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://placehold.co/600x400/111/4ade80?text=NO+IMAGE+AVAILABLE";
                }}
              />
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: 'rgba(240,82,82,0.9)', color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4
              }}>● VIOLATION DETECTED</div>
              <div style={{
                position: 'absolute', bottom: 8, right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: '#4ade80', fontFamily: 'monospace', fontSize: 10, padding: '2px 6px', borderRadius: 4
              }}>{selectedRow.tanggal} {selectedRow.waktu}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Tanggal', value: selectedRow.tanggal },
                { label: 'Waktu', value: selectedRow.waktu },
                { label: 'Lokasi', value: selectedRow.lokasi },
                { label: 'Jenis', value: selectedRow.jenis },
              ].map(item => (
                <div key={item.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10.5, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <button
              className="btn-bukti"
              style={{ width: '100%', padding: '10px' }}
              onClick={() => setShowModal(false)}
            >Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
