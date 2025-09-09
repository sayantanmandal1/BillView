@echo off
echo Starting PDF Review Dashboard...
echo.
echo Starting API server...
start "API Server" cmd /k "cd apps\api && npm run dev"
timeout /t 3 /nobreak > nul
echo Starting Web server...
start "Web Server" cmd /k "cd apps\web && npm run dev"
echo.
echo Both servers are starting...
echo API: http://localhost:3001
echo Web: http://localhost:3000
echo.
pause