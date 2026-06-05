import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for u in users:
            print(f"ID: {u.id}, Username: {u.username}, Role: {u.role}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
