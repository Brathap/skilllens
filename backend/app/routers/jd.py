"""
Job Description router
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Optional
import uuid
from datetime import datetime

from app.database import get_db
from app.models import JobDescriptionCreate, JobDescriptionResponse, SkillInput
from app.parsing_service import extract_skills_from_text

router = APIRouter()

@router.post("/upload")
async def upload_job_description(jd: JobDescriptionCreate):
    """
    Upload a job description
    
    If skills are not provided, they will be extracted automatically.
    """
    jd_id = str(uuid.uuid4())
    
    # If no skills provided, extract them
    skills = jd.skills
    if not skills:
        extracted_skill_names = extract_skills_from_text(jd.raw_text)
        skills = [SkillInput(name=name, weight=1.0) for name in extracted_skill_names]
    
    # Save to database
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Insert job description
        cursor.execute("""
            INSERT INTO job_descriptions (id, title, raw_text, experience_weight, certification_weight)
            VALUES (?, ?, ?, ?, ?)
        """, (
            jd_id,
            jd.title,
            jd.raw_text,
            jd.experience_weight,
            jd.certification_weight
        ))
        
        # Insert skills
        for skill in skills:
            cursor.execute("""
                INSERT INTO jd_skills (jd_id, skill_name, weight)
                VALUES (?, ?, ?)
            """, (jd_id, skill.name, skill.weight))
        
        conn.commit()
    
    return {
        "id": jd_id,
        "title": jd.title,
        "skills": [{"name": s.name, "weight": s.weight} for s in skills],
        "message": "Job description uploaded successfully"
    }

@router.get("/{jd_id}")
async def get_job_description(jd_id: str):
    """Get a job description by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get JD
        cursor.execute("SELECT * FROM job_descriptions WHERE id = ?", (jd_id,))
        jd_row = cursor.fetchone()
        
        if not jd_row:
            raise HTTPException(status_code=404, detail="Job description not found")
        
        # Get skills
        cursor.execute("SELECT skill_name, weight FROM jd_skills WHERE jd_id = ?", (jd_id,))
        skill_rows = cursor.fetchall()
        
        skills = [
            SkillInput(name=row['skill_name'], weight=row['weight'])
            for row in skill_rows
        ]
        
        return JobDescriptionResponse(
            id=jd_row['id'],
            title=jd_row['title'],
            raw_text=jd_row['raw_text'],
            skills=skills,
            experience_weight=jd_row['experience_weight'],
            certification_weight=jd_row['certification_weight'],
            created_at=datetime.fromisoformat(jd_row['created_at'])
        )

@router.post("/upload-pdf")
async def upload_jd_pdf(file: UploadFile = File(...)):
    """Upload job description as PDF"""
    # For now, return error - PDF parsing for JD can be added later
    raise HTTPException(
        status_code=501,
        detail="PDF upload for job descriptions not yet implemented. Please paste text directly."
    )

