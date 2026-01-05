import firebase_admin
from firebase_admin import credentials, firestore
import os

# Global DB Client
db = None

def init_db():
    """Initializes Firebase Connection"""
    global db
    
    # Avoid re-initializing if already running
    if not firebase_admin._apps:
        try:
            # Ensure 'serviceAccountKey.json' is in your ROOT folder
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
            print("🔥 Firebase Connected Successfully!")
        except Exception as e:
            print(f"❌ Firebase Connection Failed: {e}")
            # Fallback for development if key is missing
            return None

    db = firestore.client()
    return db

def get_db():
    """Returns the Firestore client for routers to use"""
    if db is None:
        return init_db()
    return db
