import os
import cv2
import time
import requests
import threading
from ultralytics import YOLO
import logging
from flask import Flask, Response
from flask_cors import CORS
import urllib.request
import numpy as np

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ==========================================
# CONFIGURATION
# ==========================================
MODEL_PATH = "ai_worker/weights/best3.pt"
CAMERA_SOURCE = ""
API_ENDPOINT = "http://localhost:8090/api/violations/detect"
CAMERA_ID = 1
CONFIDENCE_THRESHOLD = 0.6
COOLDOWN_SECONDS = 30 # Waktu jeda (detik) per kelas pelanggaran

# ==========================================
# FLASK INIT
# ==========================================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Mengizinkan semua origin termasuk localhost:5173

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

from flask import Flask, Response, request

# ... imports ... (not replacing top imports to avoid messing up)
# Let's replace from line 48 downwards.

# Inisialisasi Kamera Global
stream = None
stream_lock = threading.Lock()

def connect_camera():
    global stream, CAMERA_SOURCE
    with stream_lock:
        if stream is not None:
            try:
                if hasattr(stream, 'release'):
                    stream.release()
                elif hasattr(stream, 'close'):
                    stream.close()
            except:
                pass
        
        if not CAMERA_SOURCE:
            logging.info("CAMERA_SOURCE kosong. Menunggu koneksi dari frontend...")
            stream = None
            return False

        logging.info(f"Mencoba menghubungkan ke {CAMERA_SOURCE}...")
        stream = None
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                if isinstance(CAMERA_SOURCE, int) or str(CAMERA_SOURCE).isdigit():
                    stream = cv2.VideoCapture(int(CAMERA_SOURCE), cv2.CAP_DSHOW)
                    if stream.isOpened():
                        logging.info(f"Berhasil terhubung ke kamera lokal: {CAMERA_SOURCE}")
                        return True
                else:
                    # Menggunakan urllib untuk membaca stream MJPEG
                    stream = urllib.request.urlopen(CAMERA_SOURCE, timeout=10)
                    logging.info(f"Berhasil terhubung ke stream HTTP: {CAMERA_SOURCE}")
                    return True
            except Exception as e:
                retry_count += 1
                logging.warning(f"Gagal membuka sumber kamera. Percobaan {retry_count} dari {max_retries}. Error: {e}")
                time.sleep(2)
        
        logging.error(f"Gagal membuka sumber kamera {CAMERA_SOURCE} secara total.")
        return False

# Panggil koneksi pertama kali
connect_camera()

# Dictionary mapping untuk menerjemahkan ID YOLO menjadi ID Database
DB_ID_MAPPING = {
    7: 0,  # 'No_Harness' -> Tidak Pakai Rompi
    8: 1,  # 'No_Helmet' -> Tidak Pakai Helm
    5: 2,  # 'No_Glove' -> Tidak Pakai Sarung Tangan
    12: 3  # 'no boots' -> Tidak Pakai Sepatu
}

# Dictionary terjemahan kelas untuk tampilan (berdasarkan ID kelas YOLO)
TRANSLATIONS = {
    7: "Tidak Pakai Rompi",
    8: "Tidak Pakai Helm",
    5: "Tidak Pakai Sarung Tangan",
    12: "Tidak Pakai Sepatu"
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
        
        # Terjemahkan ID YOLO menjadi ID Database menggunakan mapping
        mapped_class_id = DB_ID_MAPPING.get(class_id)
        if mapped_class_id is None:
            return

        # Payload form-data
        data = {
            "yolo_class_id": mapped_class_id,
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
    global stream
        
    logging.info("Memulai deteksi MJPEG Stream...")
    
    bytes_data = b''
    
    while True:
        with stream_lock:
            current_stream = stream
            
        if current_stream is None or not CAMERA_SOURCE:
            # Yield standby frame
            standby_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(standby_frame, "CAMERA STANDBY", (150, 240), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            ret, buffer = cv2.imencode('.jpg', standby_frame)
            if ret:
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            time.sleep(1)
            continue
            
        frame = None
        if isinstance(current_stream, cv2.VideoCapture):
            ret, frame = current_stream.read()
            if not ret:
                logging.error("Gagal membaca frame dari kamera lokal. Menutup stream...")
                time.sleep(1)
                connect_camera()
                continue
        else:
            try:
                bytes_data += current_stream.read(1024)
                a = bytes_data.find(b'\xff\xd8')
                b = bytes_data.find(b'\xff\xd9')
                if a != -1 and b != -1:
                    jpg = bytes_data[a:b+2]
                    bytes_data = bytes_data[b+2:]
                    frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
            except Exception as e:
                logging.error(f"Error membaca dari stream HTTP: {e}")
                bytes_data = b''
                time.sleep(1)
                connect_camera()
                continue
                
        if frame is None:
            continue
            
        # Jalankan inferensi YOLO
        # verbose=False agar terminal tidak terlalu penuh dengan log YOLO tiap frame
        results = model(frame, conf=CONFIDENCE_THRESHOLD, verbose=False)
        
        # Memproses hasil deteksi
        for result in results:
            boxes = result.boxes
            for box in boxes:
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                
                # Cek apakah ID kelas YOLO ada dalam DB_ID_MAPPING
                if class_id not in DB_ID_MAPPING:
                    continue
                
                # Cek apakah kelas terdeteksi ada di dalam kamus kelas model
                if class_id in CLASS_NAMES:
                    violation_id = DB_ID_MAPPING.get(class_id)
                    current_time = time.time()
                    
                    # Cek apakah violation_id sudah lewat masa cooldown
                    if violation_id not in last_alert_time or (current_time - last_alert_time[violation_id] > COOLDOWN_SECONDS):
                        class_name_raw = CLASS_NAMES[class_id]
                        class_name_translated = TRANSLATIONS.get(class_id, class_name_raw)
                        
                        logging.info(f"[ALERT] Pelanggaran Terdeteksi: {class_name_translated} | Confidence: {confidence:.2f}")
                        
                        # Update waktu deteksi TERLEBIH DAHULU agar tidak spam jika proses API lambat
                        last_alert_time[violation_id] = current_time
                        
                        # Menggambar bounding box khusus untuk gambar yang akan dikirim sebagai bukti
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        labeled_frame = frame.copy()
                        cv2.rectangle(labeled_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                        cv2.putText(labeled_frame, f"{class_name_translated} {confidence:.2f}", (x1, max(y1 - 10, 10)), 
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                        
                        # Kirim ke backend API menggunakan background thread agar video stream tidak freeze
                        threading.Thread(target=send_alert_background, args=(class_id, labeled_frame)).start()
                    else:
                        continue
        
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
               
@app.route('/status', methods=['GET'])
def get_status():
    return {"current_url": CAMERA_SOURCE}, 200

@app.route('/update_stream', methods=['POST'])
def update_stream():
    global CAMERA_SOURCE, CAMERA_ID, stream
    data = request.json
    new_url = data.get('url')
    new_id = data.get('camera_id')
    
    if new_url == "" or new_url is None:
        with stream_lock:
            if stream is not None:
                try:
                    if hasattr(stream, 'release'):
                        stream.release()
                    elif hasattr(stream, 'close'):
                        stream.close()
                except:
                    pass
            stream = None
            CAMERA_SOURCE = None
        logging.info("Kamera dinonaktifkan via API.")
        return {"status": "success", "message": "Kamera berhasil dimatikan"}, 200

    if new_url and new_url != CAMERA_SOURCE:
        CAMERA_SOURCE = new_url
        if new_id:
            CAMERA_ID = new_id
        # Start reconnect in background to avoid blocking API
        threading.Thread(target=connect_camera).start()
        return {"status": "success", "message": f"Menghubungkan ke {new_url}"}, 200
    
    return {"status": "ignored", "message": "URL sama atau kosong"}, 200

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    # Jalankan server Flask di port 5000
    logging.info("Memulai server Flask di http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, threaded=True)
