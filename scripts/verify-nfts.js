const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verificando NFTs existentes...");

  // Cargar direcciones de contratos
  const contractAddresses = require("../contract-addresses.json");
  
  if (!contractAddresses || !contractAddresses.DiploNFT) {
    console.error("❌ No se encontraron direcciones de contratos.");
    return;
  }

  // Conectar al contrato
  const DiploNFT = await ethers.getContractFactory("DiploNFT");
  const diploNFT = DiploNFT.attach(contractAddresses.DiploNFT);

  try {
    // Verificar total supply
    const totalSupply = await diploNFT.totalSupply();
    console.log(`📊 Total de NFTs: ${totalSupply}`);

    if (totalSupply === 0n) {
      console.log("❌ No hay NFTs para verificar");
      return;
    }

    // Verificar cada NFT
    for (let i = 1; i <= Number(totalSupply); i++) {
      console.log(`\n🔍 Verificando NFT #${i}:`);
      
      // Obtener owner
      const owner = await diploNFT.ownerOf(i);
      console.log(`   Owner: ${owner}`);
      
      // Obtener URI
      const tokenURI = await diploNFT.tokenURI(i);
      console.log(`   URI: ${tokenURI}`);
      
      // Intentar cargar metadata
      try {
        let metadataUrl = tokenURI;
        if (tokenURI.startsWith('ipfs://')) {
          metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        }
        
        console.log(`   Intentando cargar metadata desde: ${metadataUrl}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(metadataUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const metadata = await response.json();
          console.log(`   ✅ Metadata cargada:`);
          console.log(`      Nombre: ${metadata.name}`);
          console.log(`      Descripción: ${metadata.description}`);
          console.log(`      Imagen: ${metadata.image}`);
          
          // Verificar si la imagen es accesible
          if (metadata.image && metadata.image.startsWith('ipfs://')) {
            const imageUrl = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
            console.log(`      URL de imagen: ${imageUrl}`);
            
            try {
              const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
              if (imageResponse.ok) {
                console.log(`      ✅ Imagen accesible`);
              } else {
                console.log(`      ❌ Imagen no accesible (${imageResponse.status})`);
              }
            } catch (error) {
              console.log(`      ❌ Error verificando imagen: ${error.message}`);
            }
          } else {
            console.log(`      ℹ️  Imagen no es IPFS: ${metadata.image}`);
          }
        } else {
          console.log(`   ❌ Error cargando metadata: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    console.log("\n🎉 Verificación completada!");
    
  } catch (error) {
    console.error("❌ Error verificando NFTs:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
