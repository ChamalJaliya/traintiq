@echo off
echo 🚀 Starting Enhanced TrainTiq System...
echo.

:: Backend Setup
echo 📦 Setting up Enhanced Backend...
cd /d "%~dp0"
call python -c "from app.models.enhanced_company_profile import Base; from app.core.database import engine; Base.metadata.create_all(bind=engine); print('✅ Enhanced profile database tables created!')" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Database setup failed, continuing anyway...
)

:: Start Backend
echo 🔧 Starting FastAPI Backend...
start "TrainTiq Backend" cmd /k "cd /d %~dp0 && python run.py"

:: Wait for backend to start
timeout /t 5 /nobreak > nul

:: Start Frontend
echo 🎨 Starting Angular Frontend...
cd /d "%~dp0\..\traintiq"
start "TrainTiq Frontend" cmd /k "ng serve --host 0.0.0.0 --port 4200"

echo.
echo ✅ Enhanced TrainTiq System Starting...
echo.
echo 📍 Backend API: http://localhost:8000
echo 📍 Frontend App: http://localhost:4200
echo 📍 Enhanced Profile Generator: http://localhost:4200/company/profile-generator
echo.
echo 🔧 Fix Applied:
echo   ✅ MatTable DataSource Error - Fixed imports
echo   ✅ EditProfile Type Error - Added type assertion
echo   ✅ Question Answering Module - Removed circular import
echo.
echo Press any key to close this window...
pause > nul 