@echo off
REM Script para executar em modo de desenvolvimento (Windows)

REM Instalar dependências se necessário
if not exist "node_modules" (
  echo Instalando dependencias...
  call npm install
)

REM Executar servidor de desenvolvimento
call npm run dev
