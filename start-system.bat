@echo off
REM =================================================================
REM ConsentHub Privacy Management System - Complete System Startup
REM =================================================================
REM This batch file starts the complete ConsentHub system including:
REM - MongoDB database check
REM - Backend API server (comprehensive-backend.js)
REM - Frontend development server (Vite)
REM =================================================================

title ConsentHub System Startup

echo.
echo ========================================================
echo 🚀 ConsentHub Privacy Management System
echo    Complete System Startup
echo ========================================================
echo.

REM Check if Node.js is installed
echo 🔍 Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js not found!
    echo    Please install Node.js from: https://nodejs.org/
    echo    Required version: 18.0.0 or higher
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%

REM Check MongoDB connection
echo.
echo 🔍 Checking MongoDB connection...
mongosh --eval "db.runCommand({ ping: 1 })" --quiet >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  WARNING: MongoDB not detected!
    echo    Please ensure MongoDB is running:
    echo    - If using MongoDB Compass, open the application
    echo    - If using Community Server: mongod --dbpath C:\data\db
    echo    - Or install Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest
    echo.
    choice /c YN /m "Continue anyway? Some features may not work "
    if ERRORLEVEL 2 exit /b 1
    echo Continuing without MongoDB...
) else (
    echo ✅ MongoDB is running
)

REM Create environment file if it doesn't exist
echo.
echo 📝 Setting up environment configuration...
if not exist ".env" (
    echo Creating .env file with default settings...
    (
        echo # ConsentHub Environment Configuration
        echo MONGODB_URI=mongodb://localhost:27017/consenthub
        echo JWT_SECRET=consent-hub-jwt-secret-change-in-production
        echo NODE_ENV=development
        echo PORT=3001
        echo FRONTEND_URL=http://localhost:3000
        echo VITE_API_BASE_URL=http://localhost:3001/api/v1
        echo.
        echo # Optional Redis configuration
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # CORS Settings
        echo CORS_ORIGIN=http://localhost:3000,http://localhost:5173
    ) > .env
    echo ✅ Environment file created
) else (
    echo ✅ Environment file exists
)

REM Install dependencies if node_modules doesn't exist
echo.
echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo Installing main project dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Main dependencies installed
)

REM Check backend dependencies
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
) else (
    echo ✅ Backend dependencies installed
)

echo.
echo ========================================================
echo 🚀 Starting ConsentHub System Services
echo ========================================================
echo.
echo Services will start in the following order:
echo   1. Backend API Server (Port 3001)
echo   2. Frontend Development Server (Port 5173)
echo.
echo 📋 Access URLs:
echo   🌐 Frontend Application: http://localhost:5173
echo   🔧 Backend API: http://localhost:3001
echo   📚 API Documentation: http://localhost:3001/api-docs (if available)
echo.
echo 👥 Default Login Credentials:
echo   📧 Admin: admin@sltmobitel.lk / admin123
echo   📧 CSR: csr@sltmobitel.lk / csr123
echo   📧 Customer: customer@sltmobitel.lk / customer123
echo.
echo ⚠️  Press Ctrl+C to stop all services
echo ========================================================
echo.

REM Start backend server in a new window
echo 🔧 Starting Backend API Server...
start "ConsentHub Backend API" cmd /c "node comprehensive-backend.js & pause"

REM Wait a moment for backend to start
echo    Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend development server
echo 🌐 Starting Frontend Development Server...
echo    This will open your default browser automatically...
echo.

REM Run the frontend server (this will block until stopped)
npm run dev

REM If we get here, the frontend server was stopped
echo.
echo 🛑 Frontend server stopped.
echo    Backend server may still be running in the separate window.
echo    Close the backend window manually if needed.
echo.
pause
