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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [violationsData, setViolationsData] = useState([]);
  const [cctvCount, setCctvCount] = useState(0);
  const [areaCount, setAreaCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
        const token = localStorage.getItem("token") || "";

        // Fetch Violations
        const response = await fetch(`${apiUrl}/api/violations/?page_size=5000`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
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
        }

        // Fetch Cameras
        const camResponse = await fetch(`${apiUrl}/api/camera/?status_cam=true`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (camResponse.ok) {
          const camResult = await camResponse.json();
          setCctvCount(camResult.total || camResult.items?.length || 0);
          if (camResult.items) {
            const uniqueAreas = new Set(camResult.items.map(cam => cam.area_name).filter(Boolean));
            setAreaCount(uniqueAreas.size);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredViolations = violationsData.filter(item => {
    // Filter Jenis
    if (jenis !== 'semua') {
      const matchHelm = jenis === 'helm' && item.jenis.toLowerCase().includes('helm');
      const matchRompi = jenis === 'rompi' && item.jenis.toLowerCase().includes('rompi');
      const matchSarungTangan = jenis === 'sarung_tangan' && item.jenis.toLowerCase().includes('sarung tangan');
      const matchSepatu = jenis === 'sepatu' && item.jenis.toLowerCase().includes('sepatu');
      if (!matchHelm && !matchRompi && !matchSarungTangan && !matchSepatu) return false;
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
    } else {
      // Logic for 'custom' period
      const itemDate = item.rawDate;
      const itemDateStr = itemDate.getFullYear() + "-" + String(itemDate.getMonth() + 1).padStart(2, '0') + "-" + String(itemDate.getDate()).padStart(2, '0');

      if (startDate && endDate) {
        if (itemDateStr < startDate || itemDateStr > endDate) return false;
      } else if (startDate && !endDate) {
        if (itemDateStr < startDate) return false;
      } else if (!startDate && endDate) {
        if (itemDateStr > endDate) return false;
      }
    }
    return true;
  });

  const totalFiltered = filteredViolations.length;
  const now = new Date();
  const hariIniFiltered = filteredViolations.filter(v => v.rawDate.toDateString() === now.toDateString()).length;
  const areaTerpantau = areaCount;
  const cctvAktif = cctvCount;

  return (
    <div className="d-flex">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-grow-1">
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        <div className="container-fluid mt-3">
          <Filterbar
            periode={periode}
            lokasi={lokasi}
            jenis={jenis}
            startDate={startDate}
            endDate={endDate}
            onPeriodeChange={setPeriode}
            onLokasiChange={setLokasi}
            onJenisChange={setJenis}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            violationsData={violationsData}
          />

          <div className="row">
            <div className="col-md-3">
              <StartCard title="Total Pelanggaran" value={totalFiltered} icon="⚠️" />
            </div>
            <div className="col-md-3">
              <StartCard title="Hari Ini" value={hariIniFiltered} icon="📅" />
            </div>
            <div className="col-md-3">
              <StartCard title="CCTV Aktif" value={cctvAktif} icon="🎥" />
            </div>
            <div className="col-md-3">
              <StartCard title="Area Terpantau" value={areaTerpantau} icon="📍" />
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