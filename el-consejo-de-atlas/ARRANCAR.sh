#!/bin/bash
# ─────────────────────────────────────────────────────────
# ATLAS — Script de arranque completo
# Arranca los 5 json-servers + Vite en paralelo
# Uso: bash ARRANCAR.sh
# ─────────────────────────────────────────────────────────
echo ""
echo "  ██████╗  ██████╗ ████████╗███████╗"
echo " ██╔══██╗ ██╔══██╗╚══██╔══╝██╔════╝"
echo " ███████║ ██║  ██║   ██║   ███████╗"
echo " ██╔══██║ ██║  ██║   ██║   ╚════██║"
echo " ██║  ██║ ██████╔╝   ██║   ███████║"
echo " ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝"
echo ""

# Instalar si faltan node_modules
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias..."
  npm install
fi

echo "Arrancando JSON Servers y Vite..."
echo ""
npm run start
