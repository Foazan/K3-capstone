import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "manager",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Lengkapi semua field!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Password tidak sama!");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
      const response = await fetch(`${apiUrl}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role
        }),
      });

      if (response.ok) {
        alert("Register berhasil!");
        navigate('/login');
      } else {
        const err = await response.json();
        alert("Register gagal: " + (err.detail || "Terjadi kesalahan."));
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1150,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            padding: 60,
            color: "#fff",
            position: "relative",
            background:
              "linear-gradient(160deg, rgba(37,99,235,0.28), rgba(15,23,42,0.96))",
            overflow: "hidden",
          }}
        >
          {/* blur circle */}
          <div
            style={{
              position: "absolute",
              top: -120,
              right: -120,
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(59,130,246,0.16)",
              filter: "blur(40px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: -80,
              left: -80,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(14,165,233,0.12)",
              filter: "blur(30px)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 22,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 34,
                marginBottom: 28,
              }}
            >
              🛡️
            </div>

            <h1
              style={{
                fontSize: 42,
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 18,
              }}
            >
              Create
              <br />
              Your Account
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 430,
              }}
            >
              Daftarkan akun untuk mengakses sistem monitoring pelanggaran
              berbasis AI dan dashboard CCTV real-time.
            </p>

            {/* feature cards */}
            <div
              style={{
                marginTop: 40,
                display: "grid",
                gap: 14,
              }}
            >
              {[
                {
                  title: "Realtime Detection",
                  desc: "Deteksi pelanggaran otomatis menggunakan YOLO",
                },
                {
                  title: "Violation Tracking",
                  desc: "Pemantauan & tindak lanjut pelanggaran",
                },
                {
                  title: "Smart Reporting",
                  desc: "Laporan & statistik monitoring otomatis",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: "16px 18px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 4,
                      fontSize: 14,
                    }}
                  >
                    {item.title}
                  </div>

                  <div
                    style={{
                      color: "#cbd5e1",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            background: "#fff",
            padding: "52px 48px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontWeight: 800,
                marginBottom: 8,
                color: "#0f172a",
              }}
            >
              Register Account ✨
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Lengkapi data untuk membuat akun baru
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Username
              </label>

              <input
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Email
              </label>

              <input
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            {/* Role */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ ...inputStyle, cursor: "pointer", background: "#fff" }}
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                Password
              </label>

              <input
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                style={inputStyle}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
              }}
            >
              Create Account
            </button>
          </form>

          {/* footer */}
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 14,
              color: "#64748b",
            }}
          >
            Sudah punya akun?
            <span
              onClick={() => navigate('/login')}
              style={{
                color: "#2563eb",
                fontWeight: 700,
                marginLeft: 6,
                cursor: "pointer",
              }}
            >
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  outline: "none",
  fontSize: 14,
  transition: "0.2s",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 8,
  display: "block",
  color: "#334155",
};