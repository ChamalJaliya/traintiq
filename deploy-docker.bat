@echo off
echo ==========================================
echo    TraintiQ Docker Deployment Script
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not available
    echo Please ensure Docker Desktop is properly installed
    echo.
    pause
    exit /b 1
)

echo ✅ Docker is installed and running
echo.

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "ssl" mkdir ssl
echo.

REM Load environment variables
echo 🔧 Loading environment configuration...
if exist "docker.env" (
    echo Environment file found: docker.env
) else (
    echo WARNING: docker.env not found, creating with defaults...
    echo OPENAI_API_KEY=your_openai_api_key_here > docker.env
    echo MYSQL_ROOT_PASSWORD=root_password >> docker.env
    echo MYSQL_DATABASE=traintiq_db >> docker.env
    echo MYSQL_USER=traintiq_user >> docker.env
    echo MYSQL_PASSWORD=traintiq_password >> docker.env
)
echo.

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down --remove-orphans
echo.

REM Build and start services
echo 🚀 Building and starting TraintiQ services...
echo This may take a few minutes for the first time...
docker-compose --env-file docker.env up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...
docker-compose ps
echo.

REM Display service URLs
echo ==========================================
echo        🎉 TraintiQ Services Ready!
echo ==========================================
echo.
echo 📱 Frontend (Angular):     http://localhost:80
echo 🔧 Backend API (Flask):    http://localhost:5000
echo 🗄️  Database (MySQL):      localhost:3306
echo 📊 Monitoring (Grafana):   http://localhost:3000
echo 📈 Metrics (Prometheus):   http://localhost:9090
echo 🔄 Load Balancer:          http://localhost:8080
echo 🗂️  Cache (Redis):          localhost:6379
echo.
echo 🔐 Default Credentials:
echo    - Grafana: admin/admin
echo    - Database: traintiq_user/traintiq_password
echo.
echo 📋 Useful Commands:
echo    - View logs: docker-compose logs -f [service_name]
echo    - Stop all: docker-compose down
echo    - Restart: docker-compose restart [service_name]
echo    - Shell access: docker-compose exec [service_name] /bin/bash
echo.
echo ==========================================

REM Open browser to frontend
echo 🌐 Opening TraintiQ in your default browser...
start http://localhost:80

echo.
echo Press any key to view live logs (Ctrl+C to exit)...
pause >nul

REM Show live logs
docker-compose logs -f

pause 