@echo off
echo ========================================
echo    ConsentHub Development Mode
echo ========================================
echo.
echo Starting all services with hot-reload for development...
echo.

REM Check dependencies
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo [1/7] Installing dependencies...
call npm install
cd backend
call npm install swagger-jsdoc swagger-ui-express express-rate-limit concurrently
cd ..

echo.
echo [2/7] Starting API Gateway...
start "API Gateway" cmd /k "cd /d %~dp0backend\backend\api-gateway && npm start"
timeout /t 2 /nobreak >nul

echo.
echo [3/7] Starting Customer Service...
start "Customer Service" cmd /k "cd /d %~dp0backend\backend\customer-service && npm start"
timeout /t 2 /nobreak >nul

echo.
echo [4/7] Starting CSR Service...
start "CSR Service" cmd /k "cd /d %~dp0backend\backend\csr-service && npm start"
timeout /t 2 /nobreak >nul

echo.
echo [5/7] Starting Privacy Notice Service...
start "Privacy Notice Service" cmd /k "cd /d %~dp0backend\backend\privacy-notice-service && npm install swagger-jsdoc swagger-ui-express && npm start"
timeout /t 2 /nobreak >nul

echo.
echo [6/7] Starting Auth Service...
start "Auth Service" cmd /k "cd /d %~dp0backend\backend\auth-service && npm install express-rate-limit && npm start"
timeout /t 2 /nobreak >nul

echo.
echo [7/7] Starting Frontend with Hot Reload...
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo    Development Environment Ready!
echo ========================================
echo.
echo DEVELOPMENT ACCESS:
echo   Frontend: http://localhost:5173 (Hot Reload Enabled)
echo.
echo ALL ROLE TESTING:
echo   Customer: customer@sltmobitel.lk / customer123
echo   CSR:      csr@sltmobitel.lk / csr123  
echo   Admin:    admin@sltmobitel.lk / admin123
echo.
echo API ENDPOINTS:
echo   Customer API:     http://localhost:3011/api-docs
echo   CSR API:          http://localhost:3012/api-docs
echo   Privacy API:      http://localhost:3003/api-docs
echo   Auth API:         http://localhost:3007/api-docs
echo   Main Gateway:     http://localhost:3000/api-docs
echo.
echo HEALTH CHECKS:
echo   curl http://localhost:3011/health
echo   curl http://localhost:3000/health
echo.
echo Press any key to open the application...
pause >nul

start http://localhost:5173

echo.
echo Development environment is running!
echo File changes will auto-reload the frontend.
echo Close terminal windows to stop services.
pause
