@echo off
title Anveshan Backend Server (Port 8000)
echo ========================================================
echo Starting ANVESHAN FastAPI Backend...
echo PDEU Knowledge Base, Hybrid RAG, Knowledge Graph
echo ========================================================
cd /d "%~dp0backend"
python run.py
pause
