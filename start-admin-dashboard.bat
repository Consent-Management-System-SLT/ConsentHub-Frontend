@echo off
echo ========================================
echo    ConsentHub Admin Dashboard Startup
echo ========================================
echo.
echo Starting services for Admin Dashboard...
echo.

REM Check dependencies
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
cd backend
call npm install swagger-jsdoc swagger-ui-express express-rate-limit
cd ..

echo.
echo [2/5] Starting API Gateway...
start "API Gateway" cmd /k "cd /d %~dp0backend\backend\api-gateway && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/5] Starting Privacy Notice Service...
start "Privacy Notice Service" cmd /k "cd /d %~dp0backend\backend\privacy-notice-service && npm install swagger-jsdoc swagger-ui-express && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [4/5] Starting Auth Service...
start "Auth Service" cmd /k "cd /d %~dp0backend\backend\auth-service && npm install express-rate-limit && npm start"
timeout /t 3 /nobreak >nul

echo.
echo [5/5] Starting Frontend...
start "Frontend" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    Admin Dashboard Ready!
echo ========================================
echo.
echo ACCESS URL: http://localhost:5173
echo.
echo DEMO LOGIN:
echo   Email:    admin@sltmobitel.lk
echo   Password: admin123
echo.
echo FEATURES AVAILABLE:
echo   - User Management
echo   - Privacy Notice Management
echo   - System Analytics
echo   - Compliance Reporting
echo   - Audit Log Monitoring
echo   - Bulk Operations
echo   - System Configuration
echo.
echo API DOCUMENTATION:
echo   Main API: http://localhost:3000/api-docs
echo   Privacy Notice API: http://localhost:3003/api-docs
echo   Auth API: http://localhost:3007/api-docs
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5173

echo.
echo Admin Dashboard is running!
pause
