from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Job Description Models
class SkillInput(BaseModel):
    name: str
    weight: float = 1.0

class JobDescriptionCreate(BaseModel):
    title: str
    raw_text: str
    skills: List[SkillInput]
    experience_weight: float = 0.3
    certification_weight: float = 0.1

class JobDescriptionResponse(BaseModel):
    id: str
    title: str
    raw_text: str
    skills: List[SkillInput]
    experience_weight: float
    certification_weight: float
    created_at: datetime

# Resume Models
class ResumeUploadResponse(BaseModel):
    id: str
    file_name: str
    jd_id: str
    uploaded_at: datetime

# Analysis Models
class ResumeSkillMatch(BaseModel):
    name: str
    similarity: float
    matched: bool
    matched_with: Optional[str] = None

class CandidateResponse(BaseModel):
    id: str
    anonymized_id: str
    file_name: str
    skills: List[ResumeSkillMatch]
    overall_score: float
    skill_score: float
    experience_score: float
    certification_score: float
    status: str
    missing_skills: List[str]
    explanations: List[str]

class AnalysisResponse(BaseModel):
    jd_id: str
    candidates: List[CandidateResponse]
    total_processed: int

