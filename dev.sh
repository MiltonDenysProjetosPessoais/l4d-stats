#!/bin/bash
# Script para executar em modo de desenvolvimento

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  npm install
fi

# Executar servidor de desenvolvimento
npm run dev
