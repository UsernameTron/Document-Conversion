@echo off
title Document Conversion App Launcher

:: Set paths
set PROJECT_DIR=%~dp0
set LOG_FILE=%PROJECT_DIR%logs\app.log

:: Create logs directory if it doesn't exist
if not exist "%PROJECT_DIR%logs" mkdir "%PROJECT_DIR%logs"

:: Display colorful message
echo [92m======================================================[0m
echo [92m  Document Conversion & Use-Case Selector Launcher   [0m
echo [92m======================================================[0m

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [91mError: Node.js is not installed. Please install Node.js to run this application.[0m
    pause
    exit /b 1
)

:: Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [91mError: npm is not installed. Please install npm to run this application.[0m
    pause
    exit /b 1
)

:: Navigate to project directory
cd /d "%PROJECT_DIR%"

:: Check if node_modules exists
if not exist "%PROJECT_DIR%node_modules" (
    echo [93mInstalling dependencies...[0m
    call npm install
)

:: Start services
echo [93mStarting services...[0m

:: Start backend in a new window
start "Document Conversion Backend" cmd /c "npm run server 2>&1 | tee -a %LOG_FILE% & pause"

:: Wait for the server to start
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "Document Conversion Frontend" cmd /c "npm run dev 2>&1 | tee -a %LOG_FILE% & pause"

:: Wait for the frontend to start
timeout /t 2 /nobreak >nul

:: Open the application in the default browser
echo [93mOpening application in browser...[0m
start http://localhost:3000

echo [92mDocument Conversion Application is running![0m
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3333
echo [93mThe application is running in separate windows. Close those windows to stop the application.[0m

pause