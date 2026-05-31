import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DonutChart({ data = [] }) {
  let rompiCount = 0;
  let helmCount = 0;
  
  if (data && data.length > 0) {
    rompiCount = data.filter(d => d.jenis.toLowerCase().includes('rompi')).length;
    helmCount = data.filter(d => d.jenis.toLowerCase().includes('helm')).length;
  }
  
  // Format hasil perhitungan menjadi array of objects untuk Recharts
  const chartData = [
    { name: 'Tidak Pakai Rompi', value: Number(rompiCount) },
    { name: 'Tidak Pakai Helm', value: Number(helmCount) }
  ];

  const total = rompiCount + helmCount;
  
  // Jika data 0, tampilkan default abu-abu agar chart tetap ter-render
  const displayData = total === 0 ? [{ name: 'Belum Ada Pelanggaran', value: 1 }] : chartData;
  const COLORS = total === 0 ? ['#e5e7eb'] : ['#f87171', '#3b82f6'];

  return (
    <div className="chart-card h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="card-title">Jenis Pelanggaran</span>
        <div className="d-flex gap-3">
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', display: 'inline-block' }}></span>
            Rompi
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#6b7280' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
            Helm
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-center" style={{ gap: 24, height: '180px' }}>
        
        {/* Kontainer Chart Recharts */}
        <div style={{ width: '180px', height: '180px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={total === 0 ? 0 : 5}
                dataKey="value"
                stroke="none"
              >
                {displayData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {total > 0 && <Tooltip formatter={(value) => [`${value} Kasus`, "Jumlah"]} />}
            </PieChart>
          </ResponsiveContainer>
          
          {/* Teks Total di tengah Donut */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', pointerEvents: 'none'
          }}>
             <span style={{ fontSize: 13, color: '#6b7280', fontFamily: 'Plus Jakarta Sans' }}>Total</span>
             <span style={{ fontSize: 22, fontWeight: 800, color: '#111827', fontFamily: 'JetBrains Mono, monospace' }}>{total}</span>
          </div>
        </div>

        {/* Legend / Angka Samping */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fef2f2', borderRadius: 10, padding: '10px 16px', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: '#f87171', fontWeight: 700, marginBottom: 2 }}>🦺 Tidak Pakai Rompi</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>{rompiCount}</div>
          </div>
          <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 16px', minWidth: 120 }}>
            <div style={{ fontSize: 11, color: '#3b82f6', fontWeight: 700, marginBottom: 2 }}>⛑️ Tidak Pakai Helm</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#111', fontFamily: "'JetBrains Mono', monospace" }}>{helmCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}