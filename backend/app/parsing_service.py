"""
Parsing service for extracting text from PDFs and extracting skills
"""
import re
from typing import List, Set
import logging

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logging.warning("PyPDF2 not available. PDF parsing will be limited.")

logger = logging.getLogger(__name__)

# Common skills database
COMMON_SKILLS = [
    # Programming Languages
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 
    'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'haskell', 'clojure',
    # Frontend
    'react', 'angular', 'vue', 'svelte', 'html', 'css', 'sass', 'scss', 'less', 
    'tailwind', 'bootstrap', 'next.js', 'nuxt', 'gatsby', 'remix',
    # Backend
    'node.js', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
    'rails', 'asp.net', 'graphql', 'rest api', 'rest', 'microservices',
    # Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 
    'dynamodb', 'firebase', 'supabase', 'cassandra', 'neo4j', 'oracle',
    # Cloud & DevOps
    'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 
    'k8s', 'terraform', 'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'cicd',
    # Data & ML
    'machine learning', 'ml', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 
    'sklearn', 'pandas', 'numpy', 'data analysis', 'data science', 'nlp', 
    'natural language processing', 'computer vision', 'llm', 'transformers', 
    'neural networks', 'opencv', 'matplotlib', 'seaborn',
    # Tools & Others
    'git', 'jira', 'confluence', 'figma', 'agile', 'scrum', 'linux', 'bash', 'shell',
    'kubernetes', 'helm', 'ansible', 'prometheus', 'grafana',
]

EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)',
    r'experience:\s*(\d+)\+?\s*years?',
    r'(\d+)\+?\s*years?\s*in',
    r'(senior|lead|principal|staff|architect|senior|sr\.)',
    r'(junior|jr\.|entry|intern|graduate)',
    r'(mid|intermediate|mid-level)',
]

CERTIFICATION_PATTERNS = [
    r'certified|certification|certificate',
    r'aws\s+(certified|solutions architect|developer|sysops)',
    r'google\s+(certified|cloud|professional)',
    r'pmp|scrum master|csm|psm|safe',
    r'microsoft\s+(certified|azure)',
]

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    if not PDF_AVAILABLE:
        raise ImportError("PyPDF2 is required for PDF parsing. Install it with: pip install PyPDF2")
    
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise

def extract_skills_from_text(text: str) -> List[str]:
    """Extract skills from text using pattern matching"""
    normalized_text = text.lower()
    found_skills: Set[str] = set()
    
    # Check against common skills
    for skill in COMMON_SKILLS:
        # Create regex pattern that matches word boundaries
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, normalized_text, re.IGNORECASE):
            found_skills.add(skill)
    
    # Extract capitalized terms that might be technologies
    capitalized_pattern = r'\b([A-Z][a-zA-Z]+(?:\.[a-zA-Z]+)?(?:\s+[A-Z][a-zA-Z]+)*)\b'
    matches = re.findall(capitalized_pattern, text)
    
    for match in matches:
        normalized = match.lower()
        # Filter out common words and validate length
        if (normalized not in ['the', 'and', 'for', 'with', 'from', 'this', 'that'] and
            2 <= len(normalized) <= 30):
            found_skills.add(normalized)
    
    return sorted(list(found_skills))

def extract_experience_level(text: str) -> float:
    """Extract experience level from text (returns 0.0 to 1.0)"""
    normalized_text = text.lower()
    
    # Try to find years of experience
    for pattern in EXPERIENCE_PATTERNS:
        matches = re.finditer(pattern, normalized_text, re.IGNORECASE)
        for match in matches:
            # Try to extract number
            numbers = re.findall(r'\d+', match.group(0))
            if numbers:
                years = int(numbers[0])
                if 0 < years <= 50:
                    return min(years / 10.0, 1.0)  # Normalize: 10+ years = 1.0
    
    # Check for seniority keywords
    if re.search(r'\b(senior|lead|principal|staff|architect|sr\.)\b', normalized_text):
        return 0.8
    if re.search(r'\b(mid|intermediate|mid-level)\b', normalized_text):
        return 0.5
    if re.search(r'\b(junior|jr\.|entry|intern|graduate)\b', normalized_text):
        return 0.3
    
    return 0.5  # Default to mid-level

def extract_certifications(text: str) -> List[str]:
    """Extract certifications from text"""
    certifications: Set[str] = set()
    normalized_text = text.lower()
    
    for pattern in CERTIFICATION_PATTERNS:
        matches = re.finditer(pattern, normalized_text, re.IGNORECASE)
        for match in matches:
            cert_text = match.group(0).strip()
            if len(cert_text) > 3:  # Filter out very short matches
                certifications.add(cert_text)
    
    return sorted(list(certifications))

def generate_anonymized_id(index: int) -> str:
    """Generate anonymized candidate ID"""
    return f"CAND-{str(index + 1).zfill(4)}"

