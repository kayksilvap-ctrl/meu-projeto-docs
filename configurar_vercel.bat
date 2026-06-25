@echo off
cd /d "c:\Users\Kayk\Downloads\Trabalho a(Extensionaista) (1)\meu-projeto-docs"

echo ============================================
echo  Configurando Variaveis de Ambiente no Vercel
echo ============================================
echo.

echo 1/2 - Configurando TURSO_DATABASE_URL...
echo libsql://anjo-guarda-db-kayksilvap-ctrl.turso.io | vercel env add TURSO_DATABASE_URL production --yes

echo 2/2 - Configurando TURSO_AUTH_TOKEN...
echo eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODIzOTM0MzYsImlkIjoiMDE5ZWZlZWQtMmYwMS03OGQyLTk5ZmItNDdiMmY1ZjY1NTM2IiwicmlkIjoiMzk5Nzg4YTAtM2I4Yy00NGMwLTkxMmMtMDRhOTJmZmQ4YWVhIn0.Y2tyZNEpTAv-AGX_zdgAUfDEP5fXGIOanangrUGKix-M-Vow3BnEwiSjMSt9KIfAYEqZp40IuOVnPeni-J46AQ | vercel env add TURSO_AUTH_TOKEN production --yes

echo.
echo ============================================
echo  Configuracao concluida!
echo.
echo  Agora execute: vercel --prod
echo ============================================
pause