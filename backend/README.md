# SkillLens AI Backend

FastAPI backend for AI-powered resume screening using semantic embeddings.

## Features

- **Job Description Management**: Upload and manage job descriptions with skill extraction
- **Resume Processing**: Upload and parse PDF/TXT resumes
- **AI-Powered Matching**: Uses SentenceTransformers (all-MiniLM-L6-v2) for semantic skill matching
- **Fair Scoring**: Bias-free candidate evaluation based on skills, experience, and certifications
- **SQLite Database**: Lightweight database for storing all data

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Job Descriptions
- `POST /jd/upload` - Upload a job description
- `GET /jd/{jd_id}` - Get a job description

### Resumes
- `POST /resumes/upload?jd_id={jd_id}` - Upload resumes (multipart/form-data)
- `GET /resumes/{jd_id}` - Get all resumes for a JD

### Analysis
- `POST /analyze/{jd_id}` - Analyze all resumes against a job description

### Candidates
- `GET /candidates?jd_id={jd_id}` - Get all candidates (optionally filtered by JD)
- `GET /candidates/{candidate_id}` - Get a specific candidate

## ML Model

The backend uses **SentenceTransformers** with the **all-MiniLM-L6-v2** model for:
- Generating semantic embeddings for skills
- Computing cosine similarity between JD requirements and candidate skills
- Matching skills based on meaning, not just keywords

## Database

SQLite database (`skilllens.db`) stores:
- Job descriptions and their skills
- Resumes and extracted text
- Candidate analysis results
- Skill matches and explanations

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── app/
│   ├── __init__.py
│   ├── database.py         # Database setup and connection
│   ├── models.py           # Pydantic models
│   ├── ml_service.py       # ML/embedding service
│   ├── parsing_service.py  # PDF parsing and text extraction
│   ├── scoring_service.py  # Score calculation logic
│   └── routers/
│       ├── jd.py           # Job description endpoints
│       ├── resumes.py      # Resume upload endpoints
│       ├── analyze.py      # Analysis endpoints
│       └── candidates.py   # Candidate endpoints
├── requirements.txt
└── README.md
```

## Notes

- The ML model is loaded on first use (lazy loading)
- PDF parsing requires PyPDF2
- Uploaded files are stored in `uploads/resumes/`
- Database is created automatically on first run

