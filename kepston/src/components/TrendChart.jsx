import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function TrendChart({ data = [], periode = "hari_ini" }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Objek untuk menampung hasil grouping
    const grouped = {};

    data.forEach(item => {
      // Pastikan item memiliki objek Date rawDate
      if (!item.rawDate) return;
      
      let key = "";
      // Jika filter hari ini, kelompokkan per jam, selain itu per tanggal
      if (periode === "hari_ini") {
        const hours = item.rawDate.getHours().toString().padStart(2, '0');
        key = `${hours}:00`;
      } else {
        const day = item.rawDate.getDate();
        const month = item.rawDate.toLocaleString('id-ID', { month: 'short' });
        key = `${day} ${month}`;
      }

      // Hitung agregasi
      if (!grouped[key]) {
        grouped[key] = {
          waktu: key,
          Pelanggaran: 0,
          rawTime: item.rawDate.getTime() // Simpan timestamp untuk referensi sorting
        };
      }
      grouped[key].Pelanggaran += 1;
    });

    // Ubah ke array of objects
    const result = Object.values(grouped);

    // Sorting secara kronologis (waktu terlama ke terbaru)
    result.sort((a, b) => a.rawTime - b.rawTime);

    return result;
  }, [data, periode]);

  // Tampilan state jika data masih kosong
  if (chartData.length === 0) {
    return (
      <div className="chart-card d-flex flex-column justify-content-center align-items-center" style={{ height: '240px' }}>
        <span style={{ fontSize: '30px', marginBottom: '10px' }}>📉</span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Belum ada tren pelanggaran pada filter ini</span>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="card-title">Tren Pelanggaran</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171', display: 'inline-block' }}></span>
          Pelanggaran
        </span>
      </div>
      
      <div style={{ width: '100%', height: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPelanggaran" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="waktu" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'JetBrains Mono' }} 
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#f87171', fontWeight: 700, fontFamily: 'JetBrains Mono' }}
              labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '6px', fontWeight: 600 }}
            />
            <Area 
              type="monotone" 
              dataKey="Pelanggaran" 
              stroke="#f87171" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPelanggaran)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}