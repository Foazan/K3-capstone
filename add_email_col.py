import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from sqlalchemy import text

def main():
    db = SessionLocal()
    try:
        # Menambahkan kolom email
        print("Menjalankan ALTER TABLE...")
        db.execute(text("ALTER TABLE user ADD COLUMN email VARCHAR(255) DEFAULT NULL;"))
        db.commit()
        print("Kolom email berhasil ditambahkan ke tabel user.")
    except Exception as e:
        print(f"Error (mungkin kolom sudah ada): {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
