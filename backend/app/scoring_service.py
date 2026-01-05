"""
Scoring service for calculating candidate scores
"""
from typing import List, Dict, Set
from app.ml_service import ml_service
import numpy as np

def calculate_scores(
    jd_skills: List[Dict],  # [{'name': str, 'weight': float, 'embedding': np.ndarray}]
    resume_skills: List[str],
    experience_score: float,
    certification_count: int,
    experience_weight: float,
    certification_weight: float
) -> Dict:
    """
    Calculate all scores for a candidate
    
    Returns:
        {
            'skill_score': float,
            'overall_score': float,
            'skill_matches': List[Dict],
            'missing_skills': List[str],
            'explanations': List[str]
        }
    """
    # Prepare JD skills with embeddings
    jd_skill_embeddings = [
        (skill['name'], skill['embedding'])
        for skill in jd_skills
    ]
    
    # Compute skill similarity
    skill_matches, matched_jd_skills = ml_service.compute_skill_similarity(
        jd_skill_embeddings,
        resume_skills
    )
    
    # Calculate skill score (weighted average of matched skills)
    total_weight = 0.0
    weighted_similarity = 0.0
    
    for match in skill_matches:
        if match['matched']:
            # Find the JD skill weight
            jd_skill = next(
                (s for s in jd_skills if s['name'] == match['matched_with']),
                None
            )
            weight = jd_skill['weight'] if jd_skill else 1.0
            weighted_similarity += match['similarity'] * weight
            total_weight += weight
    
    skill_score = weighted_similarity / total_weight if total_weight > 0 else 0.0
    
    # Normalize skill score (ensure it's between 0 and 1)
    skill_score = min(skill_score, 1.0)
    
    # Calculate certification score
    certification_score = min(certification_count * 0.25, 1.0)
    
    # Calculate overall score
    skill_weight = 1.0 - experience_weight - certification_weight
    overall_score = (
        skill_score * skill_weight +
        experience_score * experience_weight +
        certification_score * certification_weight
    )
    
    # Find missing skills
    all_jd_skills = {skill['name'] for skill in jd_skills}
    missing_skills = sorted(list(all_jd_skills - matched_jd_skills))
    
    # Generate explanations
    explanations = []
    for match in skill_matches:
        if match['matched']:
            explanations.append(
                f'"{match["name"]}" matched with "{match["matched_with"]}" requirement '
                f'({match["similarity"] * 100:.0f}% similarity)'
            )
    
    # Determine status
    if overall_score >= 0.7:
        status = 'strong'
    elif overall_score >= 0.4:
        status = 'medium'
    else:
        status = 'weak'
    
    return {
        'skill_score': float(skill_score),
        'overall_score': float(overall_score),
        'experience_score': float(experience_score),
        'certification_score': float(certification_score),
        'status': status,
        'skill_matches': skill_matches,
        'missing_skills': missing_skills,
        'explanations': explanations
    }

