import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from sqlalchemy import text

def main():
    db = SessionLocal()
    try:
        print("Menjalankan ALTER TABLE camera...")
        db.execute(text("ALTER TABLE camera ADD COLUMN url VARCHAR(255) DEFAULT NULL;"))
        db.commit()
        print("Kolom url berhasil ditambahkan ke tabel camera.")
    except Exception as e:
        print(f"Error (mungkin kolom sudah ada): {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
