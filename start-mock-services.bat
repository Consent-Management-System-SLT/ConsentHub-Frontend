@echo off
echo Starting ConsentHub Mock Services...
echo.

echo Starting Consent Service (Port 3012)...
start "Consent Service" cmd /k "node mock-consent-service.js"

timeout /t 2 /nobreak >nul

echo Starting Preference Service (Port 3013)...
start "Preference Service" cmd /k "node mock-preference-service.js"

timeout /t 2 /nobreak >nul

echo Starting Privacy Notice Service (Port 3014)...
start "Privacy Notice Service" cmd /k "node mock-privacy-notice-service.js"

timeout /t 2 /nobreak >nul

echo Starting DSAR Service (Port 3015)...
start "DSAR Service" cmd /k "node mock-dsar-service.js"

timeout /t 2 /nobreak >nul

echo Starting Event Service (Port 3016)...
start "Event Service" cmd /k "node mock-event-service.js"

timeout /t 2 /nobreak >nul

echo.
echo ✓ All mock services have been started!
echo ✓ Consent Service: http://localhost:3012
echo ✓ Preference Service: http://localhost:3013
echo ✓ Privacy Notice Service: http://localhost:3014
echo ✓ DSAR Service: http://localhost:3015
echo ✓ Event Service: http://localhost:3016
echo.
echo Press any key to close this window...
pause >nul
