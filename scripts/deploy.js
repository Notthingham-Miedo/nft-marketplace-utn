const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy del token DiploToken...");
  
  // Obtener el deployer (primera cuenta)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying con la cuenta:", deployer.address);
  
  // Verificar balance del deployer
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance del deployer:", ethers.formatEther(balance), "ETH");
  
  // Obtener el contrato factory
  const DiploToken = await ethers.getContractFactory("DiploToken");
  
  // Deploy del contrato con el deployer como owner inicial
  console.log("⏳ Desplegando DiploToken...");
  const diploToken = await DiploToken.deploy(deployer.address);
  
  // Esperar confirmación
  await diploToken.waitForDeployment();
  
  const tokenAddress = await diploToken.getAddress();
  console.log("✅ DiploToken desplegado en:", tokenAddress);
  
  // Verificar información del token
  const name = await diploToken.name();
  const symbol = await diploToken.symbol();
  const decimals = await diploToken.decimals();
  const totalSupply = await diploToken.totalSupply();
  const ownerBalance = await diploToken.balanceOf(deployer.address);
  
  console.log("\n📊 Información del Token:");
  console.log("   Nombre:", name);
  console.log("   Símbolo:", symbol);
  console.log("   Decimales:", decimals);
  console.log("   Supply Total:", ethers.formatEther(totalSupply), symbol);
  console.log("   Balance del Owner:", ethers.formatEther(ownerBalance), symbol);
  
  // Guardar la dirección del contrato
  console.log("\n💾 Guarda esta información:");
  console.log("   DiploToken Address:", tokenAddress);
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("   Chain ID:", (await ethers.provider.getNetwork()).chainId);
  
  return {
    diploToken,
    address: tokenAddress,
    deployer: deployer.address
  };
}

// Ejecutar el script solo si se llama directamente
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error en el deploy:", error);
      process.exit(1);
    });
}

module.exports = main;