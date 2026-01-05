"""
Resume upload router
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import List
import uuid
import os
from pathlib import Path
from datetime import datetime

from app.database import get_db
from app.models import ResumeUploadResponse
from app.parsing_service import extract_text_from_pdf

router = APIRouter()

# Create uploads directory
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_resumes(
    jd_id: str = Query(..., description="Job description ID"),
    files: List[UploadFile] = File(...)
):
    """
    Upload multiple resumes for a job description
    
    Returns list of uploaded resume IDs
    """
    
    # Verify JD exists
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM job_descriptions WHERE id = ?", (jd_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Job description not found")
    
    uploaded_resumes = []
    
    for file in files:
        # Validate file type
        if not (file.filename.endswith('.pdf') or file.filename.endswith('.txt')):
            continue  # Skip invalid files
        
        resume_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        file_path = UPLOAD_DIR / f"{resume_id}{file_extension}"
        
        # Save file
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Extract text
        raw_text = ""
        try:
            if file_extension == '.pdf':
                raw_text = extract_text_from_pdf(str(file_path))
            else:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    raw_text = f.read()
        except Exception as e:
            # If parsing fails, continue with empty text
            raw_text = ""
        
        # Save to database
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO resumes (id, jd_id, file_name, file_path, raw_text)
                VALUES (?, ?, ?, ?, ?)
            """, (
                resume_id,
                jd_id,
                file.filename,
                str(file_path),
                raw_text
            ))
            conn.commit()
        
        uploaded_resumes.append({
            "id": resume_id,
            "file_name": file.filename,
            "jd_id": jd_id,
            "uploaded_at": datetime.now().isoformat()
        })
    
    return {
        "uploaded": len(uploaded_resumes),
        "resumes": uploaded_resumes
    }

@router.get("/{jd_id}")
async def get_resumes(jd_id: str):
    """Get all resumes for a job description"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, file_name, uploaded_at
            FROM resumes
            WHERE jd_id = ?
            ORDER BY uploaded_at DESC
        """, (jd_id,))
        
        rows = cursor.fetchall()
        return [
            {
                "id": row['id'],
                "file_name": row['file_name'],
                "uploaded_at": row['uploaded_at']
            }
            for row in rows
        ]

