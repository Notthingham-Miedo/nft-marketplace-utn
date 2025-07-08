const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Creando NFT de prueba con imagen real de Pinata...");

  // Cargar direcciones de contratos
  const contractAddresses = require("../contract-addresses.json");
  
  if (!contractAddresses || !contractAddresses.DiploNFT) {
    console.error("❌ No se encontraron direcciones de contratos. Deploy primero.");
    return;
  }

  // Conectar al contrato
  const DiploNFT = await ethers.getContractFactory("DiploNFT");
  const diploNFT = DiploNFT.attach(contractAddresses.DiploNFT);

  // Obtener el signer (owner)
  const [owner] = await ethers.getSigners();
  console.log("📋 Minting desde:", owner.address);

  // Crear metadata de prueba con imagen real de Pinata
  const testMetadata = {
    name: "NFT Test con Imagen Real",
    description: "Este NFT tiene una imagen real almacenada en IPFS via Pinata",
    image: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG", // Hash de imagen real
    attributes: [
      {
        trait_type: "Source",
        value: "Pinata IPFS"
      },
      {
        trait_type: "Type",
        value: "Test Real Image"
      }
    ]
  };

  // Crear metadata JSON como string
  const metadataString = JSON.stringify(testMetadata);
  console.log("📋 Metadata a subir:", metadataString);

  // Para este test, crearemos un data URL con la metadata
  const metadataDataUrl = `data:application/json;base64,${Buffer.from(metadataString).toString('base64')}`;

  try {
    console.log("⏳ Minteando NFT...");
    const tx = await diploNFT.mintNFT(owner.address, metadataDataUrl);
    await tx.wait();
    
    console.log("✅ NFT minteado exitosamente!");
    console.log("📄 Hash de transacción:", tx.hash);

    // Verificar que el NFT fue minteado
    const totalSupply = await diploNFT.totalSupply();
    console.log("📊 Total supply después del mint:", totalSupply.toString());

    // Obtener información del NFT recién creado
    const tokenId = totalSupply;
    const tokenURI = await diploNFT.tokenURI(tokenId);
    
    console.log("\\n📋 Información del NFT:");
    console.log("   Token ID:", tokenId.toString());
    console.log("   URI:", tokenURI);
    
    // Intentar decodificar la metadata
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      const decodedMetadata = JSON.parse(Buffer.from(base64Data, 'base64').toString());
      console.log("   Metadata decodificada:", decodedMetadata);
      console.log("   Imagen esperada:", decodedMetadata.image);
    }
    
    console.log("\\n🎉 NFT de prueba listo!");
    console.log("🔄 Recarga el frontend para ver el NFT con imagen real");
    console.log("🖼️ La imagen debería cargar desde: https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG");
    
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
