"""
ML Service for SkillLens AI
Uses SentenceTransformers with all-MiniLM-L6-v2 model
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class MLService:
    """Service for ML operations using SentenceTransformers"""
    
    _instance = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None:
            logger.info("Loading SentenceTransformer model: all-MiniLM-L6-v2")
            self._model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Model loaded successfully")
    
    @property
    def model(self):
        """Get the loaded model"""
        if self._model is None:
            self.__init__()
        return self._model
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for a single text"""
        return self.model.encode(text, normalize_embeddings=True)
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for multiple texts (batch)"""
        return self.model.encode(texts, normalize_embeddings=True)
    
    def cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))
    
    def find_best_match(
        self, 
        skill_embedding: np.ndarray, 
        candidate_embeddings: List[Tuple[str, np.ndarray]]
    ) -> Tuple[Optional[str], float]:
        """Find the best matching skill from candidate embeddings"""
        if not candidate_embeddings:
            return None, 0.0
        
        best_similarity = -1.0
        best_skill = None
        
        for skill_name, embedding in candidate_embeddings:
            similarity = self.cosine_similarity(skill_embedding, embedding)
            if similarity > best_similarity:
                best_similarity = similarity
                best_skill = skill_name
        
        return best_skill, best_similarity
    
    def compute_skill_similarity(
        self,
        jd_skills: List[Tuple[str, np.ndarray]],
        resume_skills: List[str]
    ) -> List[Dict]:
        """Compute similarity between JD skills and resume skills"""
        if not resume_skills:
            return []
        
        # Generate embeddings for all resume skills at once
        resume_embeddings = self.generate_embeddings(resume_skills)
        
        results = []
        matched_jd_skills = set()
        
        for i, resume_skill in enumerate(resume_skills):
            resume_embedding = resume_embeddings[i]
            best_skill, similarity = self.find_best_match(resume_embedding, jd_skills)
            
            if best_skill and similarity > 0.5:  # Threshold for matching
                matched_jd_skills.add(best_skill)
                results.append({
                    'name': resume_skill,
                    'similarity': float(similarity),
                    'matched': True,
                    'matched_with': best_skill
                })
            else:
                results.append({
                    'name': resume_skill,
                    'similarity': float(similarity) if similarity > 0 else 0.0,
                    'matched': False,
                    'matched_with': None
                })
        
        return results, matched_jd_skills

# Global instance
ml_service = MLService()

