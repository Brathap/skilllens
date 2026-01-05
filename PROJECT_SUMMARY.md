# SkillLens AI - Project Summary

## ✅ Completed Implementation

### Backend (FastAPI)
- ✅ **FastAPI REST API** with clean architecture
- ✅ **SQLite Database** with proper schema
- ✅ **ML Service** using SentenceTransformers (all-MiniLM-L6-v2)
- ✅ **PDF Parsing** with PyPDF2
- ✅ **Skill Extraction** from text
- ✅ **Semantic Matching** using cosine similarity
- ✅ **Scoring System** with weighted factors (skills, experience, certifications)
- ✅ **Explainable Results** with detailed skill matches
- ✅ **CORS Enabled** for frontend communication

### API Endpoints
- ✅ `POST /jd/upload` - Upload job description
- ✅ `GET /jd/{jd_id}` - Get job description
- ✅ `POST /resumes/upload?jd_id={jd_id}` - Upload resumes (bulk)
- ✅ `GET /resumes/{jd_id}` - Get resumes for a JD
- ✅ `POST /analyze/{jd_id}` - Analyze resumes against JD
- ✅ `GET /candidates?jd_id={jd_id}` - Get candidates
- ✅ `GET /candidates/{candidate_id}` - Get specific candidate

### Frontend Integration
- ✅ **API Client** (`src/lib/api.ts`) for backend communication
- ✅ **Job Description Page** - Uploads JD to backend
- ✅ **Resume Upload Page** - Uploads resumes to backend
- ✅ **Processing Page** - Calls analysis endpoint
- ✅ **Results Page** - Displays ranked candidates
- ✅ **Candidate Detail Page** - Shows explainable breakdown

### ML & AI Features
- ✅ **Semantic Embeddings** - Uses all-MiniLM-L6-v2 model
- ✅ **Cosine Similarity** - For skill matching
- ✅ **Weighted Scoring** - Configurable weights for skills/experience/certifications
- ✅ **Bias-Free** - No demographic information used
- ✅ **Explainable** - Shows why candidates match

## Project Structure

```
skilllens/
├── backend/
│   ├── app/
│   │   ├── routers/          # API endpoints
│   │   │   ├── jd.py         # Job description routes
│   │   │   ├── resumes.py   # Resume upload routes
│   │   │   ├── analyze.py    # Analysis routes
│   │   │   └── candidates.py # Candidate routes
│   │   ├── database.py        # SQLite setup
│   │   ├── models.py          # Pydantic models
│   │   ├── ml_service.py      # SentenceTransformers service
│   │   ├── parsing_service.py # PDF/text parsing
│   │   └── scoring_service.py # Score calculation
│   ├── main.py                # FastAPI app
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend documentation
│
└── skill-insight-ai-main/     # React frontend
    ├── src/
    │   ├── lib/
    │   │   └── api.ts         # API client
    │   ├── pages/             # React pages
    │   └── stores/            # Zustand state
    └── package.json
```

## Key Features Implemented

### 1. Landing Page ✅
- Animated hero section
- "Start Demo" and "How It Works" CTAs
- Flow visualization

### 2. Dashboard ✅
- Stats cards (resumes, JDs, top score)
- "New Analysis" button
- Recent job descriptions

### 3. Job Description Upload ✅
- Text paste or upload
- AI skill extraction
- Editable skills with weights
- Weight sliders (experience, certifications)

### 4. Resume Upload ✅
- Drag-and-drop interface
- Bulk PDF/TXT upload
- Progress bars per file
- Success animations

### 5. AI Processing ✅
- Step-by-step pipeline visualization
- Real-time progress updates
- Backend API integration

### 6. Ranked Results ✅
- Sortable table
- Filters (score, status, skills)
- Status badges
- Row animations

### 7. Candidate Explainability ✅
- Expandable candidate cards
- Skill-wise similarity breakdown
- Missing skills list
- AI explanations
- Fairness notes

## Technology Stack

**Backend:**
- FastAPI 0.104.1
- SentenceTransformers 2.2.2
- PyPDF2 3.0.1
- SQLite (via sqlite3)
- Uvicorn

**Frontend:**
- React 18.3.1
- TypeScript
- Vite
- Framer Motion
- Tailwind CSS
- Zustand

## How It Works

1. **Job Description Upload**
   - User pastes/uploads JD text
   - Backend extracts skills using pattern matching
   - Skills stored in database with weights

2. **Resume Upload**
   - User uploads PDF/TXT files
   - Backend parses PDFs and extracts text
   - Text stored in database

3. **Analysis**
   - Backend loads JD skills
   - Generates embeddings for JD skills using SentenceTransformers
   - For each resume:
     - Extracts skills from text
     - Generates embeddings for resume skills
     - Computes cosine similarity between JD and resume skills
     - Calculates scores (skill match, experience, certifications)
     - Generates explanations
   - Returns ranked candidates

4. **Results Display**
   - Frontend displays ranked candidates
   - Shows match scores, status, and key skills
   - Click candidate for detailed breakdown

## ML Model Details

- **Model**: `all-MiniLM-L6-v2` from SentenceTransformers
- **Embedding Dimension**: 384
- **Similarity Threshold**: 0.5 (for skill matching)
- **Scoring Weights**:
  - Skill Match: 1 - experience_weight - certification_weight
  - Experience: 0.3 (default)
  - Certifications: 0.1 (default)

## Database Schema

- `job_descriptions` - JD metadata
- `jd_skills` - Skills for each JD
- `resumes` - Resume files and text
- `candidates` - Analysis results
- `candidate_skills` - Skill matches per candidate
- `missing_skills` - Missing required skills
- `explanations` - AI explanations

## Next Steps (Optional Enhancements)

- [ ] Add authentication/authorization
- [ ] Support more file formats (DOCX, etc.)
- [ ] Add resume parsing improvements (better skill extraction)
- [ ] Implement caching for embeddings
- [ ] Add batch processing for large resume sets
- [ ] Export results to PDF/CSV
- [ ] Add email notifications
- [ ] Implement user accounts and history
- [ ] Add more ML models for comparison
- [ ] Improve skill extraction with NLP

## Testing

To test the application:

1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd skill-insight-ai-main && npm run dev`
3. Navigate to `http://localhost:5173`
4. Follow the flow: JD → Resumes → Processing → Results

## Notes

- First run will download the ML model (~80MB)
- PDF parsing requires PyPDF2
- Database is created automatically
- CORS is configured for localhost development
- All processing happens server-side for security and performance

## License

This project is built for hackathon demonstration purposes.

