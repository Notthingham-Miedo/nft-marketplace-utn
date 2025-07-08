const fs = require('fs');
const path = require('path');

async function updateFrontendAddresses() {
  console.log('📄 Actualizando direcciones en frontend...');
  
  // Leer direcciones del archivo generado por deploy
  const contractAddressesPath = path.join(__dirname, '..', 'contract-addresses.json');
  
  if (!fs.existsSync(contractAddressesPath)) {
    console.error('❌ Archivo contract-addresses.json no encontrado');
    console.log('💡 Ejecuta primero: npm run deploy:complete');
    return;
  }
  
  const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
  
  // Leer archivo actual de contratos del frontend
  const frontendContractsPath = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'contracts.js');
  
  if (!fs.existsSync(frontendContractsPath)) {
    console.error('❌ Archivo frontend/src/utils/contracts.js no encontrado');
    return;
  }
  
  let frontendContent = fs.readFileSync(frontendContractsPath, 'utf8');
  
  // Actualizar direcciones de hardhat
  const updatedContent = frontendContent.replace(
    /hardhat: {[\s\S]*?},/,
    `hardhat: {
    DiploToken: "${contractAddresses.DiploToken}",
    DiploNFT: "${contractAddresses.DiploNFT}",
    DiploMarketplace: "${contractAddresses.DiploMarketplace}",
  },`
  );
  
  // Escribir archivo actualizado
  fs.writeFileSync(frontendContractsPath, updatedContent);
  
  console.log('✅ Direcciones actualizadas en frontend');
  console.log('🔗 Contratos configurados:');
  console.log(`   DiploToken: ${contractAddresses.DiploToken}`);
  console.log(`   DiploNFT: ${contractAddresses.DiploNFT}`);
  console.log(`   DiploMarketplace: ${contractAddresses.DiploMarketplace}`);
}

updateFrontendAddresses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error actualizando direcciones:', error);
    process.exit(1);
  });
