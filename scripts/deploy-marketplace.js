const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deployando Marketplace...");

  // Obtener direcciones de contratos previos
  const deployedContracts = require("../contract-addresses.json");

  if (!deployedContracts.DiploToken) {
    console.error("❌ DiploToken no encontrado. Deploy primero el token.");
    process.exit(1);
  }

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployer:", deployer.address);

  // Deploy del Marketplace
  const DiploMarketplace = await ethers.getContractFactory("DiploMarketplace");
  const marketplace = await DiploMarketplace.deploy(
    deployedContracts.DiploToken,
    deployer.address
  );

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("✅ DiploMarketplace deployed to:", marketplaceAddress);

  // Actualizar archivo de direcciones
  deployedContracts.DiploMarketplace = marketplaceAddress;

  const fs = require("fs");
  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(deployedContracts, null, 2)
  );

  console.log("📄 Direcciones actualizadas en contract-addresses.json");

  // Verificar configuración
  console.log("\n📊 Verificando configuración...");
  const tokenAddress = await marketplace.diploToken();
  console.log("🪙 Token DIP configurado:", tokenAddress);
  console.log("👑 Owner del marketplace:", await marketplace.owner());

  console.log("\n🎉 Deploy del Marketplace completado!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en deploy:", error);
    process.exit(1);
  });
