@echo off
REM Setup script for Green && Blue Blog (Windows)
REM Makes initial setup easier on Windows

echo.
echo 🚀 Green ^&^& Blue Blog - Setup Script (Windows)
echo ====================================
echo.

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found. Please install Docker Desktop first.
    exit /b 1
)

echo ✅ Docker found

REM Check Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose not found. Please check Docker Desktop installation.
    exit /b 1
)

echo ✅ Docker Compose found
echo.

REM Create .env if not exists
if not exist "backend\.env" (
    echo 📝 Creating backend\.env from .env.example...
    copy backend\.env.example backend\.env
    echo ✅ Created backend\.env (update values if needed)
) else (
    echo ✅ backend\.env already exists
)

echo.
echo 🐳 Building Docker images...
docker-compose up -d --build

echo.
echo ⏳ Waiting for services to be ready...
timeout /t 5 /nobreak

echo.
echo ✅ Setup complete!
echo.
echo 🌍 Access your blog:
echo    Frontend:  http://localhost
echo    Backend:   http://localhost:4000
echo    Adminer:   http://localhost:8080
echo    Admin:     http://localhost/admin.html
echo.
echo 👤 Default credentials:
echo    Email:    admin@example.com
echo    Password: Admin@123
echo.
echo 📖 View logs:
echo    docker-compose logs -f
echo.
echo 🛑 To stop:
echo    docker-compose down
echo.
pause
