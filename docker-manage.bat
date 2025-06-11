@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo     TraintiQ Docker Management
echo ==========================================
echo.

if "%1"=="" goto :help

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed or not in PATH
    exit /b 1
)

if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="logs" goto :logs
if "%1"=="status" goto :status
if "%1"=="clean" goto :clean
if "%1"=="rebuild" goto :rebuild
if "%1"=="shell" goto :shell
goto :help

:start
echo 🚀 Starting TraintiQ services...
docker-compose --env-file docker.env up -d
goto :status

:stop
echo 🛑 Stopping TraintiQ services...
docker-compose down
echo ✅ All services stopped
goto :end

:restart
echo 🔄 Restarting TraintiQ services...
docker-compose restart
goto :status

:logs
if "%2"=="" (
    echo 📋 Showing logs for all services...
    docker-compose logs -f
) else (
    echo 📋 Showing logs for %2...
    docker-compose logs -f %2
)
goto :end

:status
echo 🔍 Service Status:
docker-compose ps
echo.
echo 🌐 Service URLs:
echo   Frontend:    http://localhost:80
echo   Backend:     http://localhost:5000
echo   Grafana:     http://localhost:3000
echo   Prometheus:  http://localhost:9090
echo   Load Bal:    http://localhost:8080
goto :end

:clean
echo 🧹 Cleaning up Docker resources...
echo WARNING: This will remove all containers, networks, and volumes!
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    echo ✅ Cleanup completed
) else (
    echo ❌ Cleanup cancelled
)
goto :end

:rebuild
echo 🔨 Rebuilding TraintiQ services...
docker-compose down
docker-compose build --no-cache
docker-compose --env-file docker.env up -d
goto :status

:shell
if "%2"=="" (
    echo Available services: backend, frontend, mysql, redis
    set /p service="Enter service name: "
) else (
    set service=%2
)
echo 🐚 Opening shell for !service!...
docker-compose exec !service! /bin/bash
goto :end

:help
echo Usage: docker-manage.bat [command] [options]
echo.
echo Commands:
echo   start           - Start all services
echo   stop            - Stop all services
echo   restart         - Restart all services
echo   logs [service]  - Show logs (all or specific service)
echo   status          - Show service status and URLs
echo   clean           - Clean up all Docker resources
echo   rebuild         - Rebuild and restart all services
echo   shell [service] - Open shell in service container
echo.
echo Examples:
echo   docker-manage.bat start
echo   docker-manage.bat logs backend
echo   docker-manage.bat shell mysql
echo.

:end
echo.
pause 