from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.database import get_db
import pdfplumber
import io
import requests
import re
import json
import datetime
from collections import Counter
from firebase_admin import firestore

router = APIRouter()

# --- CONFIGURATION ---
HF_TOKEN = "PASTE_YOUR_HUGGING_FACE_TOKEN_HERE" 
API_URL = "https://api-inference.huggingface.co/models/microsoft/Phi-3.5-mini-instruct"

# --- HELPER FUNCTIONS ---
def extract_text_and_name(file_bytes):
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages[:2]: text += page.extract_text() or ""
            
            # Smart Name Extraction
            lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 3]
            clean = [l for l in lines if "resume" not in l.lower() and "contact" not in l.lower()]
            name = clean[0] if clean else "Candidate"
            if "|" in name: name = name.split("|")[0].strip()
            return text, name
    except:
        return "", "Candidate"

def vector_analysis(text, jd, name):
    """Fallback Math Engine (TF-IDF Style)"""
    def tokenize(str_input):
        words = re.findall(r'\b[a-zA-Z+#]{2,}\b', str_input.lower())
        stop_words = {'and', 'the', 'for', 'with', 'you', 'are', 'this', 'that', 'from', 'have', 'will', 'skills', 'experience', 'description', 'work', 'team'}
        return [w for w in words if w not in stop_words]

    jd_tokens = tokenize(jd)
    resume_tokens = tokenize(text)
    jd_counts = Counter(jd_tokens)
    resume_counts = Counter(resume_tokens)
    
    matches = 0
    total_weight = 0
    missing_words = []
    
    for word, importance in jd_counts.items():
        if importance > 0: 
            total_weight += importance
            if word in resume_counts:
                matches += importance
            else:
                missing_words.append((word, importance))
    
    raw_score = (matches / total_weight) * 100 if total_weight > 0 else 0
    final_score = min(int(raw_score * 1.5), 98)
    
    missing_words.sort(key=lambda x: x[1], reverse=True)
    top_missing = [w[0].title() for w in missing_words[:3]]
    
    if final_score >= 70:
        summary = f"Strong Match. Covers {int(raw_score)}% of weighted JD terms."
        feedback = f"Selected. High overlap with JD. Minor gaps: {', '.join(top_missing)}." if top_missing else "Selected. Excellent match."
    else:
        summary = f"Weak Match. Resume misses high-frequency JD terms."
        feedback = f"Not selected. Missing keywords: {', '.join(top_missing)}."

    return {
        "name": name,
        "score": final_score,
        "summary": summary,
        "feedback": feedback,
        "status": "Shortlisted" if final_score >= 70 else "Rejected",
        "analyzed_at": datetime.datetime.now()
    }

def query_cloud_ai(text, jd):
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    prompt = f"<|user|>JD: {jd[:600]}\nRESUME: {text[:1000]}\nCompare and Output JSON: {{'name': 'Name', 'score': 0, 'summary': 'Summary', 'feedback': 'Feedback'}}<|end|><|assistant|>"
    try:
        response = requests.post(API_URL, headers=headers, json={"inputs": prompt}, timeout=15)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and 'generated_text' in result[0]:
                match = re.search(r'\{.*\}', result[0]['generated_text'], re.DOTALL)
                if match: return json.loads(match.group())
    except: return None
    return None

def save_to_firebase(data, jd_text):
    db = get_db() # Get the connection from Step 1
    if db:
        try:
            data['job_preview'] = jd_text[:50] + "..."
            db.collection('resumes').add(data)
            print(f"🔥 Saved {data['name']} to Firebase")
        except Exception as e:
            print(f"⚠️ Firebase Save Error: {e}")

# --- THE MAIN ENDPOINT ---
@router.post("/")
async def analyze_resumes(job_description: str = Form(...), files: list[UploadFile] = File(...)):
    results = []
    print(f"--- Processing {len(files)} files ---")
    
    for file in files:
        content = await file.read()
        text, name = extract_text_and_name(content)
        
        # 1. AI Analysis
        analysis = query_cloud_ai(text, job_description)
        
        # 2. Vector Fallback
        if not analysis:
            analysis = vector_analysis(text, job_description, name)
        
        if not analysis.get("name") or analysis.get("name") in ["Candidate", "Name"]:
            analysis["name"] = name if len(name) < 30 else file.filename
            
        # 3. Save to Firebase
        save_to_firebase(analysis, job_description)
        
        results.append(analysis)

    return sorted(results, key=lambda x: x.get('score', 0), reverse=True)
