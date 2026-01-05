@echo off
REM Quick start script for backend (Windows)

echo Starting SkillLens AI Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Run the server
echo Starting FastAPI server...
python main.py

