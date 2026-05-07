@echo off
setlocal

:: Check if node_modules exists
if not exist "node_modules" (
    echo Error: node_modules not found. Please run setup.bat first.
    pause
    exit /b 1
)

echo ------------------------------------------------
echo  MAMBUSAO MDRRMO PCR SYSTEM - STARTING
echo  Close the browser tab to shut down.
echo ------------------------------------------------

:: Run the development server (exits when browser tab is closed)
call npm run dev

:: Auto-close the terminal when the server exits
exit
