@echo off
title Field Guardian AI - Production Runner
color 0A
echo =====================================================================
echo  🌿 FIELD GUARDIAN AI: SMART CROP MONITOR (PRODUCTION RUNNER)
echo =====================================================================
echo.

:: Check if the frontend build exists, if not, build it first
if not exist "field-guardian-ai-main\dist" (
    echo [INFO] Production build not found. Running compilation first...
    cd field-guardian-ai-main
    call npm run build
    cd ..
)

echo.
echo [1/2] Launching Python FastAPI Edge Backend...
echo.
start "Field Guardian Backend" cmd /k "(if exist .venv\Scripts\activate.bat (call .venv\Scripts\activate.bat) else (echo No virtualenv found in .venv, using global python)) & python -m backend.main"

echo.
echo [2/2] Launching Local Production Frontend Server (Port 5173)...
echo.
start "Field Guardian Production Frontend" cmd /k "echo Hosting compiled dashboard at http://localhost:5173 & python -m http.server 5173 --directory field-guardian-ai-main\dist"

echo.
echo =====================================================================
echo   🚀 PRODUCTION DEPLOYMENT ACTIVE (LOCAL EDGE MODE)
echo.
echo   - Frontend: http://localhost:5173
echo   - Backend API: http://localhost:8000
echo   - Database: Connected to Supabase
echo.
echo   Please keep this terminal open while using the application.
echo =====================================================================
echo.
pause
