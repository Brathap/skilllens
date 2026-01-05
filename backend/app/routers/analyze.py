"""
Analysis router - processes resumes against job descriptions
"""
from fastapi import APIRouter, HTTPException
from typing import List
import uuid

from app.database import get_db
from app.models import CandidateResponse, AnalysisResponse
from app.parsing_service import (
    extract_skills_from_text,
    extract_experience_level,
    extract_certifications,
    generate_anonymized_id
)
from app.scoring_service import calculate_scores
from app.ml_service import ml_service
import numpy as np

router = APIRouter()

@router.post("/{jd_id}")
async def analyze_resumes(jd_id: str):
    """
    Analyze all resumes for a job description
    
    This endpoint:
    1. Loads the job description and its skills
    2. Processes each resume
    3. Calculates scores using ML embeddings
    4. Returns ranked candidates
    """
    # Get job description
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Get JD
        cursor.execute("SELECT * FROM job_descriptions WHERE id = ?", (jd_id,))
        jd_row = cursor.fetchone()
        
        if not jd_row:
            raise HTTPException(status_code=404, detail="Job description not found")
        
        # Get JD skills
        cursor.execute("""
            SELECT skill_name, weight
            FROM jd_skills
            WHERE jd_id = ?
        """, (jd_id,))
        skill_rows = cursor.fetchall()
        
        if not skill_rows:
            raise HTTPException(status_code=400, detail="Job description has no skills")
        
        # Prepare JD skills with embeddings
        jd_skills = []
        skill_names = [row['skill_name'] for row in skill_rows]
        embeddings = ml_service.generate_embeddings(skill_names)
        
        for i, row in enumerate(skill_rows):
            jd_skills.append({
                'name': row['skill_name'],
                'weight': row['weight'],
                'embedding': embeddings[i]
            })
        
        # Get all resumes for this JD
        cursor.execute("""
            SELECT id, file_name, raw_text
            FROM resumes
            WHERE jd_id = ?
        """, (jd_id,))
        resume_rows = cursor.fetchall()
        
        if not resume_rows:
            raise HTTPException(status_code=404, detail="No resumes found for this job description")
    
    # Process each resume
    candidates_data = []
    
    for index, resume_row in enumerate(resume_rows):
        resume_id = resume_row['id']
        raw_text = resume_row['raw_text'] or ""
        
        # Extract information from resume
        resume_skills = extract_skills_from_text(raw_text)
        experience_score = extract_experience_level(raw_text)
        certifications = extract_certifications(raw_text)
        certification_count = len(certifications)
        
        # Calculate scores
        scores = calculate_scores(
            jd_skills=jd_skills,
            resume_skills=resume_skills,
            experience_score=experience_score,
            certification_count=certification_count,
            experience_weight=jd_row['experience_weight'],
            certification_weight=jd_row['certification_weight']
        )
        
        # Generate candidate ID
        candidate_id = str(uuid.uuid4())
        anonymized_id = generate_anonymized_id(index)
        
        # Save candidate to database
        with get_db() as conn:
            cursor = conn.cursor()
            
            # Insert candidate
            cursor.execute("""
                INSERT INTO candidates (
                    id, jd_id, resume_id, anonymized_id,
                    overall_score, skill_score, experience_score, certification_score, status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                candidate_id,
                jd_id,
                resume_id,
                anonymized_id,
                scores['overall_score'],
                scores['skill_score'],
                scores['experience_score'],
                scores['certification_score'],
                scores['status']
            ))
            
            # Insert candidate skills
            for skill_match in scores['skill_matches']:
                cursor.execute("""
                    INSERT INTO candidate_skills (
                        candidate_id, skill_name, similarity, matched, matched_with
                    )
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    candidate_id,
                    skill_match['name'],
                    skill_match['similarity'],
                    skill_match['matched'],
                    skill_match.get('matched_with')
                ))
            
            # Insert missing skills
            for missing_skill in scores['missing_skills']:
                cursor.execute("""
                    INSERT INTO missing_skills (candidate_id, skill_name)
                    VALUES (?, ?)
                """, (candidate_id, missing_skill))
            
            # Insert explanations
            for explanation in scores['explanations']:
                cursor.execute("""
                    INSERT INTO explanations (candidate_id, explanation_text)
                    VALUES (?, ?)
                """, (candidate_id, explanation))
            
            conn.commit()
        
        # Prepare response
        candidates_data.append({
            'id': candidate_id,
            'anonymized_id': anonymized_id,
            'file_name': resume_row['file_name'],
            'skills': scores['skill_matches'],
            'overall_score': scores['overall_score'],
            'skill_score': scores['skill_score'],
            'experience_score': scores['experience_score'],
            'certification_score': scores['certification_score'],
            'status': scores['status'],
            'missing_skills': scores['missing_skills'],
            'explanations': scores['explanations']
        })
    
    # Sort by overall score (descending)
    candidates_data.sort(key=lambda x: x['overall_score'], reverse=True)
    
    return AnalysisResponse(
        jd_id=jd_id,
        candidates=[
            CandidateResponse(**candidate)
            for candidate in candidates_data
        ],
        total_processed=len(candidates_data)
    )

