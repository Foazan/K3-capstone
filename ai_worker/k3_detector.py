import cv2
import time
import requests
import threading
from ultralytics import YOLO
import logging
from flask import Flask, Response
from flask_cors import CORS

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ==========================================
# CONFIGURATION
# ==========================================
MODEL_PATH = "weights/best.pt"
CAMERA_SOURCE = 0 # Ubah ke URL RTSP (misal: "rtsp://username:password@ip:port/stream") jika menggunakan CCTV
API_ENDPOINT = "http://localhost:8000/api/violations/detect"
CAMERA_ID = 1
CONFIDENCE_THRESHOLD = 0.6
COOLDOWN_SECONDS = 30 # Waktu jeda (detik) per kelas pelanggaran

# ==========================================
# FLASK INIT
# ==========================================
app = Flask(__name__)
CORS(app)  # Tambahkan CORS agar React (port 5173/5174) bisa mengakses stream ini

# ==========================================
# INITIALIZATION
# ==========================================
try:
    model = YOLO(MODEL_PATH)
    model.to('cuda')
    logging.info(f"Berhasil memuat model YOLO dari {MODEL_PATH}")
    print("YOLO BERJALAN MENGGUNAKAN MESIN:", model.device)
    
    # Mengambil class mapping secara dinamis dari file weights model
    CLASS_NAMES = model.names
    print("[INFO] Kamus Kelas dari YOLO:", CLASS_NAMES)
except Exception as e:
    logging.error(f"Gagal memuat model YOLO: {e}")
    exit(1)

# Inisialisasi Kamera Global dengan cv2.CAP_DSHOW untuk Windows
if isinstance(CAMERA_SOURCE, int) or str(CAMERA_SOURCE).isdigit():
    cap = cv2.VideoCapture(int(CAMERA_SOURCE), cv2.CAP_DSHOW)
else:
    cap = cv2.VideoCapture(CAMERA_SOURCE)

if not cap.isOpened():
    logging.error(f"Gagal membuka sumber kamera: {CAMERA_SOURCE}")
    exit(1)

# Daftar ID kelas yang dianggap sebagai pelanggaran
VIOLATION_CLASS_IDS = [1, 2]

# Dictionary terjemahan kelas untuk tampilan (berdasarkan ID kelas)
TRANSLATIONS = {
    1: "Tidak Pakai Helm",
    2: "Tidak Pakai Rompi"
}

# Menyimpan waktu deteksi terakhir untuk sistem cooldown
# Format: {class_id: last_detection_timestamp_in_seconds}
last_alert_time = {}

def send_alert_background(class_id, frame):
    """
    Mengirimkan data pelanggaran dan gambar ke backend API secara asynchronous (background thread).
    """
    try:
        # Konversi frame/gambar (numpy array) menjadi bytes untuk dikirim via HTTP
        success, buffer = cv2.imencode('.jpg', frame)
        if not success:
            logging.error("Gagal mengonversi frame ke JPEG.")
            return

        image_bytes = buffer.tobytes()
        # Payload form-data
        data = {
            "yolo_class_id": class_id,
            "camera_id": CAMERA_ID
        }
        
        # File gambar
        files = {
            "image": ("violation.jpg", image_bytes, "image/jpeg")
        }
        
        # Kirim request POST ke backend
        response = requests.post(API_ENDPOINT, data=data, files=files, timeout=5)
        
        # Cek respon backend
        if response.status_code in [200, 201]:
            class_name_raw = CLASS_NAMES.get(class_id, f"Class {class_id}")
            class_name_translated = TRANSLATIONS.get(class_id, class_name_raw)
            logging.info(f"[API SUCCESS] Pelanggaran {class_name_translated} ({class_name_raw}) terkirim.")
        else:
            logging.error(f"[API ERROR] Backend merespon dengan status {response.status_code}: {response.text}")
            
    except requests.exceptions.RequestException as e:
        # Menangani koneksi terputus, timeout, atau backend mati (tidak akan crash)
        logging.error(f"[API CONNECTION ERROR] Gagal menghubungi backend di {API_ENDPOINT}. Error: {e}")
    except Exception as e:
        logging.error(f"[UNKNOWN ERROR] Terjadi kesalahan saat mengirim data: {e}")

def generate_frames():
    """
    Fungsi generator untuk membaca frame dari kamera, menjalankan YOLO, dan me-return sebagai stream MJPEG.
    """
    global cap
        
    logging.info("Memulai deteksi MJPEG Stream...")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            logging.error("Gagal membaca frame dari kamera. Menutup stream...")
            break
            
        # Jalankan inferensi YOLO
        # verbose=False agar terminal tidak terlalu penuh dengan log YOLO tiap frame
        results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        # Memproses hasil deteksi
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                
                # Filter: Jika bukan kelas pelanggaran, abaikan sepenuhnya
                if class_id not in VIOLATION_CLASS_IDS:
                    continue
                
                # Cek apakah kelas terdeteksi ada di dalam kamus kelas model
                if class_id in CLASS_NAMES:
                    current_time = time.time()
                    
                    # Logika Cooldown
                    if class_id not in last_alert_time:
                        last_alert_time[class_id] = 0.0
                        
                    time_since_last = current_time - last_alert_time[class_id]
                    if time_since_last >= COOLDOWN_SECONDS:
                        class_name_raw = CLASS_NAMES[class_id]
                        class_name_translated = TRANSLATIONS.get(class_id, class_name_raw)
                        
                        logging.info(f"[ALERT] Pelanggaran Terdeteksi: {class_name_translated} | Confidence: {confidence:.2f}")
                        
                        # Update waktu deteksi TERLEBIH DAHULU agar tidak spam jika proses API lambat
                        last_alert_time[class_id] = current_time
                        
                        # Menggambar bounding box khusus untuk gambar yang akan dikirim sebagai bukti
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        labeled_frame = frame.copy()
                        cv2.rectangle(labeled_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(labeled_frame, f"{class_name_translated} {confidence:.2f}", (x1, max(y1 - 10, 10)), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                        
                        # Kirim ke backend API menggunakan background thread agar video stream tidak freeze
                        threading.Thread(target=send_alert_background, args=(class_id, labeled_frame)).start()
        
        # Plot hasil inferensi di frame untuk ditampilkan di frontend
        annotated_frame = results[0].plot()
        
        # Encode frame OpenCV menjadi JPEG
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        
        # Yield dalam format multipart HTTP MJPEG
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    # Jalankan server Flask di port 5000
    logging.info("Memulai server Flask di http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, threaded=True)
