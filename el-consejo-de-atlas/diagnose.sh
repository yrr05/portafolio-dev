#!/bin/bash
cd /home/ivan/atlas-app
echo "=== Verificando package.json ==="
cat package.json | grep -A 5 '"scripts"'
echo ""
echo "=== Ejecutando npm run dev ==="
npm run dev 2>&1 &
sleep 3
