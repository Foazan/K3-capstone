import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ViolationTable from "../components/Violationtable";

export default function Report() {
  const [activePage, setActivePage] = useState("laporan");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterLokasi, setFilterLokasi] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");

  const handleResetFilter = () => {
    setFilterTanggal("");
    setFilterLokasi("Semua");
    setFilterJenis("Semua");
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/violations/");
        const result = await response.json();
        const fetchedData = result.items || [];
        
        const mappedData = fetchedData.map(item => {
          const dateObj = new Date(item.created_at);
          const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          let imgPath = item.image_path;
          if (imgPath && !imgPath.startsWith('http')) {
             if (!imgPath.startsWith('/')) imgPath = '/' + imgPath;
             imgPath = `http://localhost:8000${imgPath}`;
          }

          return {
            id: item.id,
            rawDate: dateObj,
            tanggal: formattedDate,
            waktu: formattedTime,
            jenis: item.violation_type?.label_name || 'Tidak Diketahui',
            lokasi: item.camera?.area_name || 'Tidak Diketahui',
            status: item.status === 'Sudah Ditindak' ? 'Sudah Ditindak' : 'Belum Ditindak',
            nama: item.violator_name || '',
            user_id: item.violator_nip || '',
            image_path: imgPath
          };
        });
        
        setData(mappedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueLocations = [...new Set(data.map(item => item.lokasi))].filter(Boolean);

  const filteredData = data.filter(item => {
    let matchTanggal = true;
    if (filterTanggal) {
      const d = item.rawDate;
      const itemDateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
      matchTanggal = itemDateStr === filterTanggal;
    }
    
    let matchLokasi = true;
    if (filterLokasi !== "Semua") {
      matchLokasi = item.lokasi === filterLokasi;
    }
    
    let matchJenis = true;
    if (filterJenis !== "Semua") {
      matchJenis = item.jenis === filterJenis;
    }
    
    return matchTanggal && matchLokasi && matchJenis;
  });

  return (
    <div className="d-flex">

      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main */}
      <div className="flex-grow-1">

        <Navbar activePage={activePage} setActivePage={setActivePage} />

        <div className="container-fluid mt-3">

          {/* 🔥 HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 style={{ fontWeight: 800, marginBottom: 4 }}>
                📊 Laporan Pelanggaran
              </h4>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Monitoring & Rekap Data Pelanggaran CCTV (YOLO Detection)
              </span>
            </div>

            <button className="btn btn-primary">
              ⬇ Export Laporan
            </button>
          </div>

          {/* 🔍 FILTER BAR */}
          <div className="card p-3 mb-4 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="row">

              <div className="col-md-3">
                <label className="form-label">Tanggal</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={filterTanggal} 
                  onChange={(e) => setFilterTanggal(e.target.value)} 
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Lokasi</label>
                <select 
                  className="form-select" 
                  value={filterLokasi} 
                  onChange={(e) => setFilterLokasi(e.target.value)}
                >
                  <option value="Semua">Semua</option>
                  {uniqueLocations.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Jenis</label>
                <select 
                  className="form-select"
                  value={filterJenis} 
                  onChange={(e) => setFilterJenis(e.target.value)}
                >
                  <option>Semua</option>
                  <option>Tidak Pakai Helm</option>
                  <option>Tidak Pakai Rompi</option>
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button className="btn btn-secondary w-100" onClick={handleResetFilter}>
                  Reset Filter
                </button>
              </div>

            </div>
          </div>

          {/* 📊 SUMMARY CARDS */}
          <div className="row mb-4">

            <div className="col-md-4">
              <div className="card p-3 shadow-sm" style={{ borderRadius: 12 }}>
                <h6>Total Pelanggaran</h6>
                <h3 style={{ fontWeight: 800 }}>{filteredData.length}</h3>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Berdasarkan filter aktif
                </span>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 shadow-sm" style={{ borderRadius: 12 }}>
                <h6>Sudah Ditindak</h6>
                <h3 className="text-success" style={{ fontWeight: 800 }}>
                  {filteredData.filter(d => d.status === 'Sudah Ditindak').length}
                </h3>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Telah ditangani
                </span>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card p-3 shadow-sm" style={{ borderRadius: 12 }}>
                <h6>Belum Ditindak</h6>
                <h3 className="text-danger" style={{ fontWeight: 800 }}>
                  {filteredData.filter(d => d.status === 'Belum Ditindak').length}
                </h3>
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  Perlu ditindaklanjuti
                </span>
              </div>
            </div>

          </div>

          {/* 📋 TABLE (PAKAI COMPONENT LU) */}
          <div className="card p-3 shadow-sm" style={{ borderRadius: 12 }}>
            {loading ? (
              <div className="text-center p-4">Sedang memuat data dari API...</div>
            ) : (
              <ViolationTable data={filteredData} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}