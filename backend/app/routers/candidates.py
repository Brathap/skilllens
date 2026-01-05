"""
Candidates router
"""
from fastapi import APIRouter, HTTPException
from typing import List, Optional

from app.database import get_db
from app.models import CandidateResponse

router = APIRouter()

@router.get("/")
async def get_candidates(jd_id: Optional[str] = None):
    """
    Get all candidates, optionally filtered by job description ID
    """
    with get_db() as conn:
        cursor = conn.cursor()
        
        if jd_id:
            # Get candidates for specific JD
            cursor.execute("""
                SELECT c.*, r.file_name
                FROM candidates c
                JOIN resumes r ON c.resume_id = r.id
                WHERE c.jd_id = ?
                ORDER BY c.overall_score DESC
            """, (jd_id,))
        else:
            # Get all candidates
            cursor.execute("""
                SELECT c.*, r.file_name
                FROM candidates c
                JOIN resumes r ON c.resume_id = r.id
                ORDER BY c.overall_score DESC
            """)
        
        candidate_rows = cursor.fetchall()
        
        candidates = []
        for row in candidate_rows:
            candidate_id = row['id']
            
            # Get skills
            cursor.execute("""
                SELECT skill_name, similarity, matched, matched_with
                FROM candidate_skills
                WHERE candidate_id = ?
            """, (candidate_id,))
            skill_rows = cursor.fetchall()
            
            skills = [
                {
                    'name': s['skill_name'],
                    'similarity': s['similarity'],
                    'matched': bool(s['matched']),
                    'matched_with': s['matched_with']
                }
                for s in skill_rows
            ]
            
            # Get missing skills
            cursor.execute("""
                SELECT skill_name
                FROM missing_skills
                WHERE candidate_id = ?
            """, (candidate_id,))
            missing_skill_rows = cursor.fetchall()
            missing_skills = [m['skill_name'] for m in missing_skill_rows]
            
            # Get explanations
            cursor.execute("""
                SELECT explanation_text
                FROM explanations
                WHERE candidate_id = ?
            """, (candidate_id,))
            explanation_rows = cursor.fetchall()
            explanations = [e['explanation_text'] for e in explanation_rows]
            
            candidates.append(CandidateResponse(
                id=row['id'],
                anonymized_id=row['anonymized_id'],
                file_name=row['file_name'],
                skills=skills,
                overall_score=row['overall_score'],
                skill_score=row['skill_score'],
                experience_score=row['experience_score'],
                certification_score=row['certification_score'],
                status=row['status'],
                missing_skills=missing_skills,
                explanations=explanations
            ))
        
        return candidates

@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str):
    """Get a specific candidate by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get candidate
        cursor.execute("""
            SELECT c.*, r.file_name
            FROM candidates c
            JOIN resumes r ON c.resume_id = r.id
            WHERE c.id = ?
        """, (candidate_id,))
        
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Get skills
        cursor.execute("""
            SELECT skill_name, similarity, matched, matched_with
            FROM candidate_skills
            WHERE candidate_id = ?
        """, (candidate_id,))
        skill_rows = cursor.fetchall()
        
        skills = [
            {
                'name': s['skill_name'],
                'similarity': s['similarity'],
                'matched': bool(s['matched']),
                'matched_with': s['matched_with']
            }
            for s in skill_rows
        ]
        
        # Get missing skills
        cursor.execute("""
            SELECT skill_name
            FROM missing_skills
            WHERE candidate_id = ?
        """, (candidate_id,))
        missing_skill_rows = cursor.fetchall()
        missing_skills = [m['skill_name'] for m in missing_skill_rows]
        
        # Get explanations
        cursor.execute("""
            SELECT explanation_text
            FROM explanations
            WHERE candidate_id = ?
        """, (candidate_id,))
        explanation_rows = cursor.fetchall()
        explanations = [e['explanation_text'] for e in explanation_rows]
        
        return CandidateResponse(
            id=row['id'],
            anonymized_id=row['anonymized_id'],
            file_name=row['file_name'],
            skills=skills,
            overall_score=row['overall_score'],
            skill_score=row['skill_score'],
            experience_score=row['experience_score'],
            certification_score=row['certification_score'],
            status=row['status'],
            missing_skills=missing_skills,
            explanations=explanations
        )

