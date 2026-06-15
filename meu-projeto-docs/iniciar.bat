@echo off
title Sistema Chamada - Anjo da Guarda
color 9

echo ============================================
echo  🛡️ SISTEMA DE CHAMADA - ANJO DA GUARDA
echo ============================================
echo.
echo Iniciando servidores...
echo.

:: Iniciar Backend (porta 3000)
echo [1/2] Iniciando Backend...
start "Backend - Anjo da Guarda" cmd /c "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak > nul

:: Iniciar Frontend (porta 5173)
echo [2/2] Iniciando Frontend...
start "Frontend - Anjo da Guarda" cmd /c "cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak > nul

echo.
echo ============================================
echo  ✅ SERVERS INICIADOS!
echo.
echo  📌 Backend:  http://localhost:3000
echo  📌 Frontend: http://localhost:5173
echo ============================================
echo.
echo  Pressione qualquer tecla para abrir o sistema
pause > nul

start http://localhost:5173

echo.
echo  Deixe esta janela aberta para manter os servidores rodando.
echo  Para parar, feche esta janela ou pressione Ctrl+C
pause > nul