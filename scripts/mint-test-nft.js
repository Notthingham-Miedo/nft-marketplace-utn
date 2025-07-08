const { ethers } = require("hardhat");

async function main() {
  console.log("🎨 Minteando NFT de prueba...");

  // Verificar que existe el archivo de direcciones
  const fs = require("fs");
  if (!fs.existsSync("contract-addresses.json")) {
    console.error("❌ Archivo contract-addresses.json no encontrado");
    console.log("💡 Ejecuta primero: npm run deploy:complete");
    process.exit(1);
  }

  const contractAddresses = JSON.parse(fs.readFileSync("contract-addresses.json", "utf8"));
  
  // Obtener contratos
  const DiploNFT = await ethers.getContractFactory("DiploNFT");
  const nft = await DiploNFT.attach(contractAddresses.DiploNFT);

  // Obtener cuenta deployer
  const [deployer] = await ethers.getSigners();
  
  console.log("📋 Minteando NFT para:", deployer.address);

  // Crear metadata de prueba
  const testMetadata = {
    name: "NFT de Prueba #1",
    description: "Este es un NFT de prueba para el marketplace Diplo",
    image: "https://picsum.photos/400/400?random=1",
    attributes: [
      {
        trait_type: "Tipo",
        value: "Testing"
      },
      {
        trait_type: "Rareza",
        value: "Común"
      }
    ]
  };

  // Para testing local, vamos a usar una URI de prueba
  const testURI = `data:application/json;base64,${Buffer.from(JSON.stringify(testMetadata)).toString('base64')}`;

  try {
    console.log("⏳ Minteando NFT...");
    const tx = await nft.mint(deployer.address, testURI);
    await tx.wait();
    
    console.log("✅ NFT minteado exitosamente!");
    console.log("📄 Hash de transacción:", tx.hash);

    // Verificar que el NFT fue minteado
    const totalSupply = await nft.totalSupply();
    console.log("📊 Total supply después del mint:", totalSupply.toString());

    // Obtener información del NFT
    const tokenId = totalSupply - 1n; // El último token minteado
    const owner = await nft.ownerOf(tokenId);
    const tokenURI = await nft.tokenURI(tokenId);
    
    console.log("\n📋 Información del NFT:");
    console.log("   Token ID:", tokenId.toString());
    console.log("   Owner:", owner);
    console.log("   URI:", tokenURI.substring(0, 100) + "...");
    
    console.log("\n🎉 NFT de prueba listo para ver en el frontend!");
    console.log("🔄 Recarga la página del frontend para ver el nuevo NFT");
    
  } catch (error) {
    console.error("❌ Error minteando NFT:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
