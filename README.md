# K3 Monitoring System - Smart CCTV (Capstone Project)

Sistem Monitoring Keselamatan dan Kesehatan Kerja (K3) Full-Stack berbasis AI (YOLO) untuk mendeteksi tingkat kepatuhan penggunaan Alat Pelindung Diri (APD) secara *real-time* di lingkungan kerja (seperti pabrik Epson).

Sistem ini memiliki arsitektur **Mikroservis**:
1. **Frontend (React + Vite)**: Dashboard interaktif, manajemen user, laporan pelanggaran, & stream CCTV.
2. **Backend Server (FastAPI)**: Pusat logika bisnis (CRUD, autentikasi, API Laporan).
3. **AI Worker (Flask + OpenCV + YOLO)**: Mengelola koneksi *stream* kamera RTSP/HTTP, mendeteksi objek dengan model YOLO, dan mengirimkan notifikasi.

---

## 🚀 Fitur Utama

- **Deteksi APD Real-time**: Webhook API & AI Worker untuk menganalisis dan mendeteksi ketiadaan Helm, Rompi, atau Sarung Tangan.
- **Manajemen Pelanggaran**: Pencatatan riwayat pelanggaran APD secara otomatis lengkap dengan bukti foto (*snapshot*).
- **Notifikasi WhatsApp (WAHA)**: Pengiriman peringatan pelanggaran via WhatsApp Gateway saat pelanggaran divalidasi/ditindak.
- **Role-Based Access Control (RBAC)**: Autentikasi JWT yang memisahkan hak akses antara **Admin** (Akses Penuh: Tambah Kamera, Manajemen User, Edit Status Kamera) dan **Manager** (Mode Read-Only/Pemantauan Saja).
- **Graceful Shutdown & Standby Mode**: Pemutusan arus kamera (*stream*) secara pintar pada backend Python untuk menghemat memori (*resource* server) dan mencegah proses *zombie* (error *Corrupt JPEG*).
- **Ekspor Data**: Fungsionalitas mengunduh data daftar pengguna menjadi CSV menggunakan native Javascript.
- **Dukungan Vercel & Ngrok**: Arsitektur routing dan `CORS` yang sangat *flexible* (`allow_origin_regex=".*"`) dan terintegrasi *Bypass Headers* otomatis (`ngrok-skip-browser-warning`, `Bypass-Tunnel-Reminder`). Memungkinkan aplikasi berjalan secara dinamis lintas Vercel dan *Localhost Tunnels*.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React.js (Vite), Axios, Bootstrap, CSS Native (Glassmorphism UI)
- **Backend Core**: FastAPI (Python 3.9+)
- **AI Worker**: Flask, OpenCV, requests
- **Database**: MySQL 8.0 (via SQLAlchemy & PyMySQL)
- **Notifikasi**: WAHA (WhatsApp HTTP API)
- **Infrastruktur**: Docker & Docker Compose

---

## 💻 Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi ini, pastikan sistem sudah terinstal:
1. **Python 3.9+**
2. **Node.js (versi 18+)** dan NPM
3. **Docker Desktop** (atau Docker Engine & Docker Compose)

---

## ⚙️ Langkah-langkah Menjalankan Proyek

### 1. Clone Repositori
```bash
git clone https://github.com/UsernameKamu/K3-capstone.git
cd K3-capstone
```

### 2. Konfigurasi Environment Variables
Sistem ini menggunakan Environment Variables terpisah antara backend dan frontend:

**Backend (FastAPI):**
1. Salin `.env.example` menjadi `.env` di *root directory*.
2. Sesuaikan kredensial `SECRET_KEY`, Database URL, dan token WAHA Anda.

**Frontend (React/Vite):**
1. Masuk ke folder `kepston/` dan buat file `.env`.
2. Tambahkan alamat URL backend Anda secara dinamis:
   ```env
   VITE_API_FASTAPI=http://localhost:8090
   VITE_API_FLASK=http://localhost:5000
   ```
   *(Ganti dengan URL Ngrok/Localtunnel jika ingin mengaksesnya melalui public network).*

### 3. Jalankan Database & WhatsApp API (Docker)
Jalankan perintah ini di root folder proyek:
```bash
docker-compose up -d
```
*(Catatan: MySQL akan berjalan otomatis dan diinisialisasi oleh file `init.sql`).*

### 4. Menyalakan Backend (FastAPI - Port 8090)
Buat *virtual environment* dan jalankan server FastAPI:
```bash
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Linux/Mac

pip install -r requirements.txt
uvicorn main:app --reload --port 8090
```

### 5. Menyalakan AI Worker (Flask - Port 5000)
Jalankan *script* pendeteksi YOLO secara paralel (di tab terminal baru):
```bash
.\venv\Scripts\activate
python ai_worker/k3_detector.py
```

### 6. Menyalakan Frontend (React - Port 5173)
Buka tab terminal baru, lalu masuk ke folder frontend:
```bash
cd kepston
npm install
npm run dev
```
Buka browser dan akses aplikasi Anda di `http://localhost:5173`.

---

## 📚 Dokumentasi API Interaktif (Swagger UI)

Setelah server FastAPI berjalan, seluruh API Endpoint dapat langsung diuji (*test*) melalui:
- **Swagger UI**: [http://localhost:8090/docs](http://localhost:8090/docs)
- **ReDoc**: [http://localhost:8090/redoc](http://localhost:8090/redoc)

---

## 📂 Struktur Folder Proyek
```text
K3-capstone/
├── app/                 # Backend Core (FastAPI)
│   ├── api/             # Endpoint Controllers (auth, camera, users, violations)
│   ├── core/            # Config, Security (JWT), DB Dependensi
│   ├── models/          # Schema Database SQLAlchemy
│   ├── schemas/         # Validasi JSON Pydantic
│   └── services/        # Business Logic & WAHA Integration
├── ai_worker/           # Backend AI Worker (Flask)
│   └── k3_detector.py   # Script koneksi RTSP, deteksi YOLO, dan MJPEG Generator
├── kepston/             # Frontend Dashboard (React + Vite)
│   ├── src/             # Komponen React, Pages, CSS
│   └── .env             # Routing VITE_API_FASTAPI & VITE_API_FLASK
├── uploads/             # Folder penyimpanan Snapshot/Screenshot Pelanggaran
├── main.py              # Entry Point FastAPI
├── docker-compose.yml   # Docker Config untuk MySQL & WAHA
├── requirements.txt     # Library Python Backend
└── init.sql             # Script Inisialisasi Tabel Database
```
