import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StartCard from "../components/StartCard";
import TrendChart from "../components/TrendChart";
import DonutChart from "../components/DonutChart";
import ViolationTable from "../components/Violationtable";
import Filterbar from "../components/Filterbar";

function Dashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [periode, setPeriode] = useState("hari_ini");
  const [lokasi, setLokasi] = useState("semua");
  const [jenis, setJenis] = useState("semua");
  const [violationsData, setViolationsData] = useState([]);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const token = localStorage.getItem("token") || ""; 
        
        const response = await fetch(`${apiUrl}/api/violations?page_size=100`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) return;

        const result = await response.json();

        const formattedData = result.items.map(item => {
          let dateStr = item.created_at;
          if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
            dateStr += "Z";
          }
          const dateObj = new Date(dateStr);
          
          return {
            id: item.id,
            rawDate: dateObj,
            tanggal: dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            waktu: dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            jenis: item.violation_type?.label_name || "Tidak diketahui",
            lokasi: item.camera?.area_name || "Tidak diketahui",
            status: (item.violator_name || item.status === "SUDAH_DITINDAK" || item.status === "Sudah Ditindak") ? "Sudah Ditindak" : "Belum Ditindak",
            image_path: item.image_path,
            nama: item.violator_name || "", 
            user_id: item.violator_nip || ""
          };
        });
        setViolationsData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchViolations();
  }, []);

  const filteredViolations = violationsData.filter(item => {
    // Filter Jenis
    if (jenis !== 'semua') {
      const matchHelm = jenis === 'helm' && item.jenis.toLowerCase().includes('helm');
      const matchRompi = jenis === 'rompi' && item.jenis.toLowerCase().includes('rompi');
      if (!matchHelm && !matchRompi) return false;
    }

    // Filter Lokasi
    if (lokasi !== 'semua') {
      if (item.lokasi !== lokasi) return false;
    }

    // Filter Periode
    if (periode !== 'custom') {
      const now = new Date();
      const itemDate = item.rawDate;
      
      if (periode === 'hari_ini') {
        if (itemDate.toDateString() !== now.toDateString()) return false;
      } else if (periode === 'minggu_ini') {
        const pastWeek = new Date();
        pastWeek.setDate(now.getDate() - 7);
        if (itemDate < pastWeek || itemDate > now) return false;
      } else if (periode === 'bulan_ini') {
        if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  const totalFiltered = filteredViolations.length;
  const helmFiltered = filteredViolations.filter(v => v.jenis.toLowerCase().includes('helm')).length;
  const rompiFiltered = filteredViolations.filter(v => v.jenis.toLowerCase().includes('rompi')).length;
  
  // Logic placeholder untuk Compliance Rate
  // Misalnya default 100%, kurangi 2% untuk tiap pelanggaran
  const complianceRate = totalFiltered > 0 ? Math.max(0, 100 - (totalFiltered * 2)) + "%" : "100%";
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content */}
      <div className="flex-grow-1">
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        <div className="container-fluid mt-3">
          <Filterbar 
            periode={periode} 
            lokasi={lokasi} 
            jenis={jenis} 
            onPeriodeChange={setPeriode} 
            onLokasiChange={setLokasi} 
            onJenisChange={setJenis}
            violationsData={violationsData}
          />

          {/* Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3 mb-md-0">
              <StartCard title="Total Pelanggaran" value={totalFiltered} icon="⚠️" />
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <StartCard title="Tidak Pakai Helm" value={helmFiltered} icon="⛑️" />
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <StartCard title="Tidak Pakai Rompi" value={rompiFiltered} icon="🦺" />
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <StartCard title="Compliance Rate" value={complianceRate} icon="👷‍♂️✅" />
            </div>
          </div>

          {/* Charts */}
          <div className="row mt-4">
            <div className="col-md-8">
              <TrendChart data={filteredViolations} periode={periode} />
            </div>
            <div className="col-md-4">
              <DonutChart data={filteredViolations} />
            </div>
          </div>

          {/* Table */}
          <div className="mt-4">
            <ViolationTable 
              data={filteredViolations} 
              onUpdateRow={(id, newRowData) => {
                setViolationsData(prev => prev.map(row => row.id === id ? { ...row, ...newRowData } : row));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;