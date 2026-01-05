# Quick Start Guide - SkillLens AI Backend

## ✅ Installation Complete!

All dependencies have been installed successfully. Here's how to run the server:

## Running the Server

### Option 1: Using Python directly
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

### Option 2: Using uvicorn directly
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Verify Installation

Test that FastAPI is working:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -c "import fastapi; print('FastAPI imported successfully!')"
```

## Access Points

Once the server is running:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Important Notes

1. **Virtual Environment**: Always activate the virtual environment before running:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

2. **First Run**: The ML model (all-MiniLM-L6-v2) will download automatically on first use (~80MB)

3. **Database**: SQLite database (`skilllens.db`) is created automatically in the backend directory

4. **Port**: Default port is 8000. Change it in `main.py` if needed

## Troubleshooting

If you get "No module named fastapi":
1. Make sure you're in the `backend` directory
2. Activate the virtual environment: `.\venv\Scripts\Activate.ps1`
3. Verify installation: `pip list | findstr fastapi`

## Next Steps

1. Start the backend server (see above)
2. Start the frontend:
   ```powershell
   cd skill-insight-ai-main
   npm install
   npm run dev
   ```
3. Open http://localhost:5173 in your browser

