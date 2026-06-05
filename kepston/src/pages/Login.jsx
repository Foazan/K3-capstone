import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.username && form.password) {
      try {
        const apiUrl = import.meta.env.VITE_API_FASTAPI || "http://localhost:8090";
        const formData = new URLSearchParams();
        formData.append("username", form.username);
        formData.append("password", form.password);

        const response = await fetch(`${apiUrl}/api/auth/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("name", form.username);
          navigate("/");
        } else {
          alert("Login gagal. Periksa username dan password Anda.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("Terjadi kesalahan saat menghubungi server.");
      }
    }
  };

  const goToRegister = () => {
    navigate("/register");
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
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            padding: 60,
            color: "#fff",
            position: "relative",
            background:
              "linear-gradient(160deg, rgba(37,99,235,0.3), rgba(15,23,42,0.95))",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "rgba(59,130,246,0.15)",
              filter: "blur(40px)",
            }}
          />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
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
              Smart CCTV
              <br />
              Monitoring System
            </h1>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: 15,
                lineHeight: 1.7,
                maxWidth: 420,
              }}
            >
              Sistem monitoring pelanggaran berbasis AI YOLO untuk mendeteksi
              penggunaan APD secara real-time melalui kamera CCTV.
            </p>

            <div
              style={{
                marginTop: 40,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {[
                "YOLO Detection",
                "Realtime Monitoring",
                "Violation Tracking",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            background: "#fff",
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontWeight: 800,
                marginBottom: 8,
                color: "#0f172a",
              }}
            >
              Welcome Back 👋
            </h2>

            <p style={{ color: "#64748b", fontSize: 14 }}>
              Login untuk mengakses dashboard monitoring
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 8,
                  display: "block",
                  color: "#334155",
                }}
              >
                Username
              </label>

              <input
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  marginBottom: 8,
                  display: "block",
                  color: "#334155",
                }}
              >
                Password
              </label>

              <input
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  outline: "none",
                  fontSize: 14,
                }}
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
              Login ke Dashboard
            </button>
          </form>

          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontSize: 14,
              color: "#64748b",
            }}
          >
            Belum punya akun?
            <span
              onClick={goToRegister}
              style={{
                color: "#2563eb",
                fontWeight: 700,
                marginLeft: 6,
                cursor: "pointer",
              }}
            >
              Register
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}