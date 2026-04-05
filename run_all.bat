@echo off
echo ===================================================
echo     Starting Pest Detection Support System
echo ===================================================

echo.
echo [1/2] Starting Python FastAPI Backend...
start "Backend (FastAPI)" cmd /k "(if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (echo No virtualenv found in .venv, using global python)) & python -m backend.main"

echo.
echo [2/2] Starting React Vite Frontend...
cd field-guardian-ai-main
start "Frontend (Vite)" cmd /k "npm run dev"

echo.
echo ===================================================
echo   Both services are starting in separate windows!
echo   - Backend will run on http://localhost:8000
echo   - Frontend will be accessible via Vite
echo ===================================================
pause
