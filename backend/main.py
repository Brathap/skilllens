from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import uvicorn
from pathlib import Path

from app.database import init_db
from app.routers import jd, resumes, analyze, candidates

# Initialize FastAPI app
app = FastAPI(
    title="SkillLens AI API",
    description="AI-powered resume screening backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include routers
app.include_router(jd.router, prefix="/jd", tags=["Job Description"])
app.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analysis"])
app.include_router(candidates.router, prefix="/candidates", tags=["Candidates"])

@app.get("/")
async def root():
    return {"message": "SkillLens AI API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

