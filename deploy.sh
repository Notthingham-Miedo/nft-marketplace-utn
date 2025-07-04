#!/bin/bash

# Script para deploy automático en Hardhat
echo "🚀 Iniciando deploy automático del NFT Marketplace..."

# Verificar que estamos en el directorio correcto
if [ ! -f "hardhat.config.js" ]; then
    echo "❌ No se encontró hardhat.config.js. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

# Verificar si hay un nodo de Hardhat ejecutándose
if ! curl -s http://127.0.0.1:8545 > /dev/null; then
    echo "❌ No hay un nodo de Hardhat ejecutándose."
    echo "💡 Por favor ejecuta 'npx hardhat node' en otra terminal primero."
    exit 1
fi

echo "✅ Nodo de Hardhat detectado"

# Deploy de contratos
echo "📦 Deployando contratos..."
npx hardhat run scripts/deploy-complete.js --network localhost

if [ $? -eq 0 ]; then
    echo "✅ Contratos deployados exitosamente"
else
    echo "❌ Error en el deploy de contratos"
    exit 1
fi

# Leer direcciones del archivo JSON
if [ -f "contract-addresses.json" ]; then
    echo "📋 Leyendo direcciones de contratos..."
    
    # Extraer direcciones usando node (más confiable que jq)
    NFT_ADDRESS=$(node -p "JSON.parse(require('fs').readFileSync('contract-addresses.json', 'utf8')).DiploNFT")
    TOKEN_ADDRESS=$(node -p "JSON.parse(require('fs').readFileSync('contract-addresses.json', 'utf8')).DiploToken")
    MARKETPLACE_ADDRESS=$(node -p "JSON.parse(require('fs').readFileSync('contract-addresses.json', 'utf8')).DiploMarketplace")
    
    echo "🎨 NFT Contract: $NFT_ADDRESS"
    echo "🪙 Token Contract: $TOKEN_ADDRESS"
    echo "🛒 Marketplace Contract: $MARKETPLACE_ADDRESS"
    
    # Actualizar .env del frontend si existe
    if [ -f "frontend/.env" ]; then
        echo "⚙️ Actualizando frontend/.env..."
        
        # Crear backup
        cp frontend/.env frontend/.env.backup
        
        # Actualizar direcciones
        sed -i "s/REACT_APP_NFT_CONTRACT_ADDRESS=.*/REACT_APP_NFT_CONTRACT_ADDRESS=$NFT_ADDRESS/" frontend/.env
        sed -i "s/REACT_APP_TOKEN_CONTRACT_ADDRESS=.*/REACT_APP_TOKEN_CONTRACT_ADDRESS=$TOKEN_ADDRESS/" frontend/.env
        sed -i "s/REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=.*/REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=$MARKETPLACE_ADDRESS/" frontend/.env
        
        echo "✅ Frontend configurado automáticamente"
    else
        echo "⚠️ No se encontró frontend/.env"
        echo "💡 Copia frontend/.env.example a frontend/.env y actualiza las direcciones manualmente"
    fi
    
    # Mintear tokens de prueba
    echo "🪙 Minteando tokens DIP de prueba..."
    
    # Crear script temporal para mintear tokens
    cat > temp_mint.js << EOF
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.attach("$TOKEN_ADDRESS");
  
  // Mintear 1000 tokens al deployer
  await token.mint(deployer.address, ethers.parseEther("1000"));
  
  const balance = await token.balanceOf(deployer.address);
  console.log("🎉 Tokens DIP minteados:", ethers.formatEther(balance));
}

main().catch(console.error);
EOF
    
    # Ejecutar script de minteo
    npx hardhat run temp_mint.js --network localhost
    
    # Limpiar archivo temporal
    rm temp_mint.js
    
    echo ""
    echo "🎉 ¡Deploy completo y exitoso!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Configura Metamask con la red Hardhat (ID: 31337, RPC: http://127.0.0.1:8545)"
    echo "2. Importa esta cuenta de prueba en Metamask:"
    echo "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    echo "3. Ve a frontend/ y ejecuta 'npm start'"
    echo "4. ¡Disfruta tu marketplace NFT!"
    echo ""
    echo "📄 Direcciones guardadas en: contract-addresses.json"
    
else
    echo "❌ No se encontró contract-addresses.json"
    exit 1
fi
