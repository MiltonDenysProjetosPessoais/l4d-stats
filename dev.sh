#!/bin/bash
# Script para executar em modo de desenvolvimento com Netlify Functions

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
  npm install
fi

# Instalar Netlify CLI se necessário
if ! command -v netlify &> /dev/null; then
  npm install -g netlify-cli
fi

# Executar servidor de desenvolvimento com Netlify Functions
netlify dev

