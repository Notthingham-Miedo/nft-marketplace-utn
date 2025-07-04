#!/bin/bash

# Script de testing automático para Diplo Marketplace
# Ejecuta todo el flujo de deploy y configuración local

echo "🚀 Iniciando deploy y testing completo de Diplo Marketplace"
echo "════════════════════════════════════════════════════════════"

# Verificar que estamos en el directorio correcto
if [ ! -f "hardhat.config.js" ]; then
    echo "❌ Error: Ejecutar desde el directorio raíz del proyecto bruno-marketplace"
    exit 1
fi

# 1. Limpiar compilaciones anteriores
echo "🧹 Limpiando artefactos anteriores..."
rm -rf artifacts/ cache/ contract-addresses.json
npx hardhat clean

# 2. Compilar contratos
echo "⚙️ Compilando contratos..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ Error en compilación"
    exit 1
fi

# 3. Ejecutar tests
echo "🧪 Ejecutando tests..."
npm test
if [ $? -ne 0 ]; then
    echo "❌ Tests fallaron"
    exit 1
fi

# 4. Verificar que el nodo local esté corriendo
echo "🌐 Verificando conexión al nodo local..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://127.0.0.1:8545 > /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Nodo local no disponible en puerto 8545"
    echo "💡 Ejecutar en otra terminal: npm run node"
    exit 1
fi

# 5. Deploy completo
echo "🚀 Ejecutando deploy completo..."
npm run deploy:complete
if [ $? -ne 0 ]; then
    echo "❌ Error en deploy"
    exit 1
fi

# 6. Actualizar direcciones en frontend
echo "🔄 Actualizando direcciones en frontend..."
npm run update:addresses

# 7. Instalar dependencias del frontend si no existen
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd frontend
    npm install
    cd ..
fi

# 8. Mostrar resumen
echo ""
echo "✅ Deploy y configuración completados"
echo "════════════════════════════════════════════════════════════"

if [ -f "contract-addresses.json" ]; then
    echo "📋 Direcciones de contratos:"
    cat contract-addresses.json | grep -E "(DiploToken|DiploNFT|DiploMarketplace)" | sed 's/,$//'
fi

echo ""
echo "🔧 Configuración de Metamask:"
echo "   Red: Hardhat Local"
echo "   RPC URL: http://127.0.0.1:8545"
echo "   Chain ID: 31337"
echo "   Símbolo: ETH"
echo ""
echo "🔑 Cuenta de testing:"
echo "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Configurar Metamask con la red local"
echo "   2. Importar la cuenta de testing"
echo "   3. Mintear tokens DIP: npm run console"
echo "   4. Iniciar frontend: cd frontend && npm run dev"
echo ""
echo "🏆 ¡Todo listo para testing!"
