@echo off
title Anveshan Frontend Portal (Port 3000)
echo ========================================================
echo Starting ANVESHAN Next.js University Portal...
echo Pandit Deendayal Energy University (PDEU)
echo ========================================================
cd /d "%~dp0frontend"
if exist .next (
    echo Refreshing Next.js cache...
    rd /s /q .next 2>nul
)
npm run dev
pause
