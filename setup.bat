@echo off
REM Setup script for Stock Management System (Windows)

echo.
echo 📦 Stock Management System - Setup
echo ===================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%

REM Install dependencies
echo.
echo 📥 Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed

REM Check if .env file exists
if not exist .env (
    echo.
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

echo.
echo ===================================
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Update .env with your MySQL credentials (if different)
echo 2. Run database initialization: mysql -u root -p^<database\init.sql
echo    (When prompted, enter password: root)
echo 3. Start the server: npm run dev
echo.
echo Access the application at: http://localhost:3000
echo.
pause
