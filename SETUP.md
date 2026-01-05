# SkillLens AI - Setup Guide

Complete setup instructions for the full-stack AI-powered resume screening application.

## Project Structure

```
skilllens/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── routers/     # API endpoints
│   │   ├── database.py   # SQLite database setup
│   │   ├── ml_service.py # SentenceTransformers service
│   │   └── ...
│   ├── main.py          # FastAPI app entry point
│   └── requirements.txt
└── skill-insight-ai-main/  # React frontend
    ├── src/
    │   ├── pages/       # React pages
    │   ├── lib/         # API client
    │   └── ...
    └── package.json
```

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

**Note:** The first time you run the backend, SentenceTransformers will download the `all-MiniLM-L6-v2` model (~80MB). This happens automatically.

### 4. Run the backend server
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: `http://localhost:8000`
- **Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd skill-insight-ai-main
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API URL (Optional)
Create a `.env` file in `skill-insight-ai-main/`:
```
VITE_API_URL=http://localhost:8000
```

If not set, it defaults to `http://localhost:8000`.

### 4. Run the frontend
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns).

## Running the Complete Application

### Terminal 1 - Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python main.py
```

### Terminal 2 - Frontend
```bash
cd skill-insight-ai-main
npm install
npm run dev
```

## Usage Flow

1. **Landing Page** → Click "Start Demo"
2. **Job Description** → Paste or upload JD, extract skills
3. **Upload Resumes** → Drag & drop or select PDF/TXT files
4. **Processing** → AI analyzes resumes (automatic)
5. **Results** → View ranked candidates with scores
6. **Candidate Detail** → Click candidate to see detailed breakdown

## API Endpoints

### Job Descriptions
- `POST /jd/upload` - Upload job description
- `GET /jd/{jd_id}` - Get job description

### Resumes
- `POST /resumes/upload?jd_id={jd_id}` - Upload resumes
- `GET /resumes/{jd_id}` - Get resumes for a JD

### Analysis
- `POST /analyze/{jd_id}` - Analyze resumes against JD

### Candidates
- `GET /candidates?jd_id={jd_id}` - Get candidates
- `GET /candidates/{candidate_id}` - Get specific candidate

## Database

SQLite database (`skilllens.db`) is created automatically in the backend directory on first run.

## Troubleshooting

### Backend Issues

1. **Port already in use**: Change port in `main.py` or use `--port` flag
2. **Model download fails**: Check internet connection, model downloads on first use
3. **PDF parsing errors**: Ensure PyPDF2 is installed (`pip install PyPDF2`)

### Frontend Issues

1. **API connection errors**: 
   - Ensure backend is running on port 8000
   - Check CORS settings in `backend/main.py`
   - Verify `VITE_API_URL` in `.env` file

2. **Build errors**: 
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Common Issues

- **CORS errors**: Backend CORS is configured for `localhost:5173` and `localhost:3000`
- **File upload fails**: Check file size limits and file types (PDF/TXT only)
- **Skills not extracted**: Ensure job description text is meaningful and contains skill keywords

## Features

✅ **AI-Powered Matching**: Uses SentenceTransformers for semantic skill matching  
✅ **Bias-Free**: No name, gender, or demographic bias  
✅ **Explainable**: Shows why candidates match with similarity scores  
✅ **PDF Support**: Parses PDF and TXT resumes  
✅ **Real-time Processing**: Step-by-step progress visualization  
✅ **Ranked Results**: Candidates sorted by match score  

## Tech Stack

**Backend:**
- FastAPI
- SentenceTransformers (all-MiniLM-L6-v2)
- SQLite
- PyPDF2

**Frontend:**
- React + TypeScript
- Vite
- Framer Motion
- Tailwind CSS
- Zustand (state management)

## Development

To modify the ML model, edit `backend/app/ml_service.py`.  
To change scoring weights, modify `backend/app/scoring_service.py`.  
To update API endpoints, edit files in `backend/app/routers/`.

## Production Deployment

For production:
1. Set proper CORS origins
2. Use a production database (PostgreSQL recommended)
3. Add authentication/authorization
4. Use environment variables for secrets
5. Set up proper file storage (S3, etc.)
6. Add rate limiting
7. Enable HTTPS

## License

This project is for hackathon demonstration purposes.

