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

  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueJenis, setUniqueJenis] = useState([]);

  const handleResetFilter = () => {
    setFilterTanggal("");
    setFilterLokasi("Semua");
    setFilterJenis("Semua");
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
        const token = localStorage.getItem("token") || "";
        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Fetch data master Lokasi dari database
        try {
          const camRes = await fetch(`${apiUrl}/api/camera/`, { headers });
          if (camRes.ok) {
            const camData = await camRes.json();
            const areas = [...new Set((camData.items || []).map(c => c.area_name))].filter(Boolean);
            setUniqueLocations(areas);
          }
        } catch (e) {
          console.error("Error fetching cameras:", e);
        }

        // 2. Fetch data master Jenis Pelanggaran dari database
        try {
          const typeRes = await fetch(`${apiUrl}/api/violation-types/`, { headers });
          if (typeRes.ok) {
            const typeData = await typeRes.json();
            const types = [...new Set((typeData.items || []).map(t => t.label_name))].filter(Boolean);
            setUniqueJenis(types);
          }
        } catch (e) {
          console.error("Error fetching violation types:", e);
        }

        // 3. Fetch laporan pelanggaran (ambil lebih banyak data untuk tabel agar sinkron)
        const response = await fetch(`${apiUrl}/api/violations/?page_size=100`, { headers });
        
        if (!response.ok) {
          console.error("Gagal mengambil data laporan:", await response.text());
        } else {
          const result = await response.json();
          const fetchedData = result.items || [];
          
          const mappedData = fetchedData.map(item => {
            const dateObj = new Date(item.created_at);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            let imgPath = item.image_path;
            if (imgPath && !imgPath.startsWith('http')) {
               if (!imgPath.startsWith('/')) imgPath = '/' + imgPath;
               imgPath = `http://localhost:8090${imgPath}`;
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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  const handleUpdateRow = (id, updatedFields) => {
    setData(prevData => prevData.map(item => 
      item.id === id ? { ...item, ...updatedFields } : item
    ));
  };

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

  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    // 1. Header kolom berbahasa Indonesia
    const headers = ["Tanggal", "Waktu", "Jenis Pelanggaran", "Lokasi", "Status"];
    
    // 2. Map array of objects menjadi baris CSV
    const csvRows = [];
    csvRows.push(headers.join(",")); // Header row

    filteredData.forEach(item => {
      // Menggunakan kutip agar aman dari karakter koma di dalam string
      const values = [
        `"${item.tanggal}"`,
        `"${item.waktu}"`,
        `"${item.jenis}"`,
        `"${item.lokasi}"`,
        `"${item.status}"`
      ];
      csvRows.push(values.join(","));
    });

    // 3. Gabungkan menjadi satu string CSV
    const csvString = csvRows.join("\n");

    // 4. Buat objek Blob dan elemen <a> untuk mendownload file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const today = new Date();
    const formattedToday = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    link.setAttribute("download", `Laporan_K3_${formattedToday}.csv`);
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

            <button className="btn btn-primary" onClick={handleExportCSV}>
              ⬇ Export Laporan
            </button>
          </div>

          {/* 🔍 FILTER BAR */}
          <div className="card p-4 mb-4 shadow-sm border-0" style={{ borderRadius: 12, backgroundColor: '#ffffff' }}>
            <div className="row g-3 align-items-end">

              <div className="col-12 col-md-3">
                <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Tanggal</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={filterTanggal} 
                  onChange={(e) => setFilterTanggal(e.target.value)} 
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Lokasi</label>
                <select 
                  className="form-select" 
                  value={filterLokasi} 
                  onChange={(e) => setFilterLokasi(e.target.value)}
                >
                  <option value="Semua">Semua Lokasi</option>
                  {uniqueLocations.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label text-muted" style={{ fontSize: '13px', fontWeight: 'bold' }}>Jenis Pelanggaran</label>
                <select 
                  className="form-select"
                  value={filterJenis} 
                  onChange={(e) => setFilterJenis(e.target.value)}
                >
                  <option value="Semua">Semua Jenis</option>
                  {uniqueJenis.map((jenis, idx) => (
                    <option key={idx} value={jenis}>{jenis}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-3">
                <button className="btn btn-outline-secondary w-100 fw-bold d-flex justify-content-center align-items-center gap-2" onClick={handleResetFilter}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                  </svg>
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
              <ViolationTable data={filteredData} onUpdateRow={handleUpdateRow} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}