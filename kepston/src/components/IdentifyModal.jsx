import { useState } from "react";

export default function IdentifyModal({ data, onClose, onSuccess }) {
  const [nama, setNama] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!data) return null;

  const handleSimpan = async () => {
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8090";
      const token = localStorage.getItem("token") || "";

      const response = await fetch(`${apiUrl}/api/violations/${data.id}/validate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          violator_name: nama,
          violator_nip: userId
        })
      });

      if (response.ok) {
        alert("Data pelanggar berhasil divalidasi dan disimpan!");
        if (onSuccess) onSuccess(data.id, nama, userId);
        onClose();
      } else {
        const err = await response.json();
        alert("Gagal menyimpan: " + (err.detail || "Terjadi kesalahan"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: 400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h5 style={{ fontWeight: 700 }}>Identifikasi Pelanggar</h5>

        <p style={{ fontSize: 13, color: "#6b7280" }}>
          {data.jenis} - {data.lokasi}
        </p>
        
        <input
          className="form-control mb-2"
          placeholder="Nama Pelanggar"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          disabled={isLoading}
        />

        <input
          className="form-control mb-3"
          placeholder="NIP / ID Karyawan"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={isLoading}
        />

        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Batal
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSimpan}
            disabled={!nama || !userId || isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}