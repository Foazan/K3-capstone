import React, { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

const GlobalNotification = () => {
  const prevTotalRef = useRef(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8090";
        const token = localStorage.getItem("token") || ""; 
        if (!token) return; // Only run if user is logged in

        // Gunakan endpoint yang ringan dengan limit 1 untuk mengecek total data
        const response = await fetch(`${apiUrl}/api/violations?page_size=1`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!response.ok) return;

        const result = await response.json();
        const currentTotal = result.total;

        if (!isFirstLoad.current && currentTotal > prevTotalRef.current) {
          toast.error("⚠️ Peringatan: Terdeteksi pelanggaran K3 baru!", {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#fff',
              color: '#d32f2f',
              fontWeight: 'bold',
            },
          });
        }
        
        prevTotalRef.current = currentTotal;
        isFirstLoad.current = false;
      } catch (error) {
        console.error("Error fetching notification stats:", error);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return <Toaster />;
};

export default GlobalNotification;
