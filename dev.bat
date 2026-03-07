@echo off
REM Script para executar em modo de desenvolvimento com Netlify Functions (Windows)

REM Instalar dependências se necessário
if not exist "node_modules\" (
  echo Instalando dependencias...
  call npm install
)

REM Instalar Netlify CLI se necessário
where netlify >nul 2>nul
if errorlevel 1 (
  echo Instalando Netlify CLI...
  call npm install -g netlify-cli
)

REM Executar servidor de desenvolvimento com Netlify Functions
echo Iniciando servidor de desenvolvimento...
call netlify dev

