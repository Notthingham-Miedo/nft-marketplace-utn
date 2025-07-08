const { ethers } = require("hardhat");

async function main() {
  console.log("🪙 Minteando tokens DIP para testing...");

  // Verificar que existe el archivo de direcciones
  const fs = require("fs");
  if (!fs.existsSync("contract-addresses.json")) {
    console.error("❌ Archivo contract-addresses.json no encontrado");
    console.log("💡 Ejecuta primero: npm run deploy:complete");
    process.exit(1);
  }

  const contractAddresses = JSON.parse(fs.readFileSync("contract-addresses.json", "utf8"));
  
  // Obtener contratos
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = await DiploToken.attach(contractAddresses.DiploToken);

  // Obtener cuentas
  const [deployer, user1, user2, user3, user4] = await ethers.getSigners();
  
  console.log("📋 Cuentas para minteo:");
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   User1: ${user1.address}`);
  console.log(`   User2: ${user2.address}`);
  console.log(`   User3: ${user3.address}`);
  console.log(`   User4: ${user4.address}`);

  // Cantidad a mintear por cuenta (1000 DIP)
  const mintAmount = ethers.parseEther("1000");

  try {
    // Mintear para todas las cuentas
    console.log("\n💰 Minteando 1000 DIP por cuenta...");
    
    await token.mint(deployer.address, mintAmount);
    console.log(`✅ Deployer: +1000 DIP`);
    
    await token.mint(user1.address, mintAmount);
    console.log(`✅ User1: +1000 DIP`);
    
    await token.mint(user2.address, mintAmount);
    console.log(`✅ User2: +1000 DIP`);
    
    await token.mint(user3.address, mintAmount);
    console.log(`✅ User3: +1000 DIP`);
    
    await token.mint(user4.address, mintAmount);
    console.log(`✅ User4: +1000 DIP`);

    // Verificar balances
    console.log("\n📊 Balances finales:");
    const deployerBalance = await token.balanceOf(deployer.address);
    const user1Balance = await token.balanceOf(user1.address);
    const user2Balance = await token.balanceOf(user2.address);
    const user3Balance = await token.balanceOf(user3.address);
    const user4Balance = await token.balanceOf(user4.address);
    
    console.log(`   Deployer: ${ethers.formatEther(deployerBalance)} DIP`);
    console.log(`   User1: ${ethers.formatEther(user1Balance)} DIP`);
    console.log(`   User2: ${ethers.formatEther(user2Balance)} DIP`);
    console.log(`   User3: ${ethers.formatEther(user3Balance)} DIP`);
    console.log(`   User4: ${ethers.formatEther(user4Balance)} DIP`);

    // Mostrar información útil para Metamask
    console.log("\n🦊 Para importar cuentas en Metamask:");
    console.log("════════════════════════════════════════");
    console.log(`Account #0 (Deployer): 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
    console.log(`Account #1 (User1): 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`);
    console.log(`Account #2 (User2): 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`);
    console.log(`Account #3 (User3): 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`);
    console.log(`Account #4 (User4): 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`);

    console.log("\n🎯 Tokens listos para testing del marketplace!");
    
  } catch (error) {
    console.error("❌ Error minteando tokens:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
