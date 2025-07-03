const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deployando ecosistema completo...");

  const [deployer] = await ethers.getSigners();
  console.log("📋 Deployer:", deployer.address);
  console.log(
    "💰 Balance:",
    ethers.formatEther(await deployer.provider.getBalance(deployer.address))
  );

  // 1. Deploy DiploToken
  console.log("\n1️⃣ Deployando DiploToken...");
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const diploToken = await DiploToken.deploy(deployer.address);
  await diploToken.waitForDeployment();
  const tokenAddress = await diploToken.getAddress();
  console.log("✅ DiploToken deployed to:", tokenAddress);

  // 2. Deploy DiploNFT
  console.log("\n2️⃣ Deployando DiploNFT...");
  const DiploNFT = await ethers.getContractFactory("DiploNFT");
  const diploNFT = await DiploNFT.deploy();
  await diploNFT.waitForDeployment();
  const nftAddress = await diploNFT.getAddress();
  console.log("✅ DiploNFT deployed to:", nftAddress);

  // 3. Deploy DiploMarketplace
  console.log("\n3️⃣ Deployando DiploMarketplace...");
  const DiploMarketplace = await ethers.getContractFactory("DiploMarketplace");
  const marketplace = await DiploMarketplace.deploy(
    tokenAddress,
    deployer.address
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ DiploMarketplace deployed to:", marketplaceAddress);

  // 4. Guardar direcciones
  const contractAddresses = {
    DiploToken: tokenAddress,
    DiploNFT: nftAddress,
    DiploMarketplace: marketplaceAddress,
    network: await ethers.provider.getNetwork().then((n) => n.name),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(contractAddresses, null, 2)
  );

  console.log("\n📄 Direcciones guardadas en contract-addresses.json");

  // 5. Verificar configuración
  console.log("\n📊 Verificando configuración...");
  console.log(
    "🪙 Token supply:",
    ethers.formatEther(await diploToken.totalSupply())
  );
  console.log("🎨 NFT name:", await diploNFT.name());
  console.log("🛒 Marketplace token:", await marketplace.diploToken());

  console.log("\n🎉 Deploy completo exitoso!");
  console.log("🔗 Contratos listos para testing");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error en deploy:", error);
    process.exit(1);
  });
