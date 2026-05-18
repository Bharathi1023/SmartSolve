@echo off
title SmartSolve Full-Stack Launcher
echo ====================================================================
echo   🚀 SMARTSOLVE - AI BOARD EXAM PREPARATION & DOUBT SOLVER 🚀
echo ====================================================================
echo.
echo [1/2] Spinning up Express Node.js Backend API on http://localhost:5000...
start cmd /k "title SmartSolve Backend Server && cd backend && npm run dev"

echo.
echo [2/2] Launching React Development Client on http://localhost:5173...
start cmd /k "title SmartSolve Frontend client && cd frontend && npm run dev"

echo.
echo Concurrency Startup initiated! 
echo Keep the new console windows open to keep the services running.
echo Open http://localhost:5173 inside your browser.
echo ====================================================================
pause
