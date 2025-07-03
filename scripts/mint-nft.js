const { ethers } = require("hardhat");
const {
  uploadImageToIPFS,
  createAndUploadMetadata,
} = require("./uploadToIPFS");

async function main() {
  console.log("🚀 Iniciando proceso de minteo de NFT con Pinata...\n");

  // Cargar direcciones de contratos
  const contractAddresses = require("../contract-addresses.json");

  // Conectar al contrato
  const DiploNFT = await ethers.getContractFactory("DiploNFT");
  const diploNFT = DiploNFT.attach(contractAddresses.DiploNFT);

  // Obtener el signer (owner)
  const [owner] = await ethers.getSigners();

  console.log("1️⃣ Subiendo imagen a IPFS vía Pinata...");

  // Subir imagen (asegúrate de tener una imagen en ./assets/)
  const imagePath = "./assets/nft_test_1.jpg";
  const imageResult = await uploadImageToIPFS(imagePath);

  console.log("\n2️⃣ Creando y subiendo metadata...");

  // Crear metadata
  const metadataResult = await createAndUploadMetadata(
    imageResult.url,
    "Diplo NFT #1",
    "Primer NFT del marketplace Diplo - Edición limitada",
    [
      { trait_type: "Tipo", value: "Fundacional" },
      { trait_type: "Número", value: "001" },
      { trait_type: "Rareza", value: "Legendario" },
      { trait_type: "Marketplace", value: "Diplo" },
    ]
  );

  console.log("\n3️⃣ Minteando NFT en blockchain...");

  // Mintear NFT con el CID de metadata
  const tx = await diploNFT.mintNFT(owner.address, metadataResult.cid);
  const receipt = await tx.wait();

  // Obtener el token ID del evento Transfer
  const transferEvent = receipt.logs.find((log) => {
    try {
      return diploNFT.interface.parseLog(log).name === "Transfer";
    } catch {
      return false;
    }
  });

  let tokenId;
  if (transferEvent) {
    const parsedEvent = diploNFT.interface.parseLog(transferEvent);
    tokenId = parsedEvent.args.tokenId;
  } else {
    // Fallback: obtener el total supply actual
    tokenId = await diploNFT.totalSupply();
  }

  console.log("\n🎉 === NFT MINTEADO EXITOSAMENTE ===");
  console.log(`🪙 Token ID: ${tokenId}`);
  console.log(`👤 Owner: ${owner.address}`);
  console.log(
    `📝 Metadata URI: https://gateway.pinata.cloud/ipfs/${metadataResult.cid}`
  );
  console.log(`📸 Imagen URL: ${imageResult.url}`);
  console.log(`🔗 Tx Hash: ${tx.hash}`);

  // Verificar el minteo
  console.log("\n4️⃣ Verificando minteo...");
  const tokenOwner = await diploNFT.ownerOf(tokenId);
  const tokenURI = await diploNFT.tokenURI(tokenId);
  const totalSupply = await diploNFT.totalSupply();

  console.log("\n✅ === VERIFICACIÓN EXITOSA ===");
  console.log(`👤 Token Owner: ${tokenOwner}`);
  console.log(`🌐 Token URI: ${tokenURI}`);
  console.log(`📊 Total Supply: ${totalSupply}`);

  // Guardar información del NFT
  const nftInfo = {
    tokenId: tokenId.toString(),
    owner: tokenOwner,
    contractAddress: contractAddresses.DiploNFT,
    tokenURI: tokenURI,
    imageCID: imageResult.cid,
    metadataCID: metadataResult.cid,
    txHash: tx.hash,
    timestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  fs.writeFileSync("./nft-mint-info.json", JSON.stringify(nftInfo, null, 2));

  console.log("\n💾 Información del NFT guardada en nft-mint-info.json");
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}
