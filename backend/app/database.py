import sqlite3
from pathlib import Path
from contextlib import contextmanager

DB_PATH = Path("skilllens.db")

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initialize database tables"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Job Descriptions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS job_descriptions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                raw_text TEXT NOT NULL,
                experience_weight REAL DEFAULT 0.3,
                certification_weight REAL DEFAULT 0.1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Skills table (for job descriptions)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jd_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                jd_id TEXT NOT NULL,
                skill_name TEXT NOT NULL,
                weight REAL DEFAULT 1.0,
                FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
            )
        """)
        
        # Resumes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                jd_id TEXT NOT NULL,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                raw_text TEXT,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
            )
        """)
        
        # Candidates table (analysis results)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS candidates (
                id TEXT PRIMARY KEY,
                jd_id TEXT NOT NULL,
                resume_id TEXT NOT NULL,
                anonymized_id TEXT NOT NULL,
                overall_score REAL NOT NULL,
                skill_score REAL NOT NULL,
                experience_score REAL NOT NULL,
                certification_score REAL NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE,
                FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
            )
        """)
        
        # Candidate skills table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS candidate_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id TEXT NOT NULL,
                skill_name TEXT NOT NULL,
                similarity REAL NOT NULL,
                matched BOOLEAN NOT NULL,
                matched_with TEXT,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
            )
        """)
        
        # Missing skills table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS missing_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id TEXT NOT NULL,
                skill_name TEXT NOT NULL,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
            )
        """)
        
        # Explanations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS explanations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id TEXT NOT NULL,
                explanation_text TEXT NOT NULL,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
            )
        """)
        
        conn.commit()

