@echo off
echo ========================================
echo TechCommunity Backend Deployment Script
echo ========================================
echo.

set COMPOSE_FILE=docker-compose.yml

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running
    exit /b 1
)
echo Docker is available.

echo.
echo [2/4] Building and starting services...
docker-compose -f %COMPOSE_FILE% up -d --build
if errorlevel 1 (
    echo ERROR: Failed to start services
    exit /b 1
)

echo.
echo [3/4] Waiting for services to be healthy...
timeout /t 30 /nobreak >nul

echo.
echo [4/4] Checking service status...
docker-compose -f %COMPOSE_FILE% ps

echo.
echo ========================================
echo Deployment completed!
echo ========================================
echo.
echo Services:
echo   - Frontend: http://localhost
echo   - Backend API: http://localhost:8080/api
echo   - MySQL: localhost:3306
echo   - Redis: localhost:6379
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
