@echo off
setlocal

:: Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ------------------------------------------------
echo MAMBUSAO MDRRMO PCR SYSTEM - SETUP
echo ------------------------------------------------
echo Installing project dependencies...

call npm install

if %errorlevel% equ 0 (
    echo.
    echo Setup successful! You can now run the system using run.bat
) else (
    echo.
    echo Setup failed. Please check the error messages above.
)

pause
