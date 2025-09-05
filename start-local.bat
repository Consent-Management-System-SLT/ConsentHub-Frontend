@echo off
echo Starting ConsentHub Local Development Environment
echo ================================================

echo.
echo Starting Backend Server...
echo.
start "ConsentHub Backend" cmd /k "cd /d "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project" && node comprehensive-backend.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Development Server...
echo.
start "ConsentHub Frontend" cmd /k "cd /d "c:\Users\Ojitha Rajapaksha\Downloads\Consent Management System\project" && npm run dev"

echo.
echo ================================================
echo ConsentHub is starting up!
echo.
echo Backend will be available at: http://localhost:3001
echo Frontend will be available at: http://localhost:5173
echo.
echo Press any key to continue...
pause > nul
