import sys
import os

# Append current directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin_k4").first()
        if user:
            print(f"Current role of admin_k4: {user.role}")
            if user.role != "admin":
                user.role = "admin"
                db.commit()
                print("Successfully updated admin_k4 to 'admin' role!")
            else:
                print("admin_k4 is already an admin.")
        else:
            print("User admin_k4 not found in the database.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
