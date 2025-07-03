const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Inicializar Pinata
const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

async function uploadImageToIPFS(imagePath) {
  try {
    // Verificar conexión con Pinata
    await pinata.testAuthentication();
    console.log("✅ Conexión con Pinata exitosa");

    // Configurar opciones de subida
    const options = {
      pinataMetadata: {
        name: path.basename(imagePath),
        keyvalues: {
          type: "nft-image",
          project: "diplo-marketplace",
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    // Subir imagen a IPFS vía Pinata
    const result = await pinata.pinFromFS(imagePath, options);

    console.log(`Imagen subida a IPFS:`);
    console.log(`CID: ${result.IpfsHash}`);
    console.log(`URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

    return {
      cid: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    throw error;
  }
}

async function createAndUploadMetadata(
  imageUrl,
  name,
  description,
  attributes = []
) {
  try {
    // Crear metadata JSON
    const metadata = {
      name: name,
      description: description,
      image: imageUrl,
      attributes: attributes,
    };

    // Configurar opciones de subida para metadata
    const options = {
      pinataMetadata: {
        name: `${name}-metadata.json`,
        keyvalues: {
          type: "nft-metadata",
          project: "diplo-marketplace",
        },
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    // Subir metadata como JSON a IPFS
    const result = await pinata.pinJSONToIPFS(metadata, options);

    console.log(`Metadata subida a IPFS:`);
    console.log(`CID: ${result.IpfsHash}`);
    console.log(`URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);

    return {
      cid: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error subiendo metadata:", error);
    throw error;
  }
}

// Función para listar archivos en Pinata (útil para debug)
async function listPinataFiles() {
  try {
    const result = await pinata.pinList({
      status: "pinned",
      pageLimit: 10,
    });

    console.log("Archivos en Pinata:");
    result.rows.forEach((file) => {
      console.log(`- ${file.metadata.name}: ${file.ipfs_pin_hash}`);
    });

    return result.rows;
  } catch (error) {
    console.error("Error listando archivos:", error);
    throw error;
  }
}

// Función principal para uso directo
async function main() {
  try {
    console.log("🚀 Iniciando proceso de subida a IPFS con Pinata...\n");

    // Verificar autenticación
    await pinata.testAuthentication();
    console.log("✅ Autenticación con Pinata exitosa\n");

    // Ejemplo de uso
    const imagePath = "./assets/nft_test_1.jpg";

    // Verificar que el archivo existe
    if (!fs.existsSync(imagePath)) {
      throw new Error(`No se encontró la imagen en: ${imagePath}`);
    }

    // 1. Subir imagen
    console.log("📸 Subiendo imagen...");
    const imageResult = await uploadImageToIPFS(imagePath);

    // 2. Crear y subir metadata
    console.log("\n📝 Creando y subiendo metadata...");
    const metadataResult = await createAndUploadMetadata(
      imageResult.url,
      "Mi Primer NFT Diplo",
      "NFT de prueba para el marketplace Diplo",
      [
        { trait_type: "Color", value: "Azul" },
        { trait_type: "Rareza", value: "Común" },
        { trait_type: "Edición", value: "Primera" },
      ]
    );

    console.log("\n🎉 === RESUMEN EXITOSO ===");
    console.log(`📸 Imagen CID: ${imageResult.cid}`);
    console.log(`📝 Metadata CID: ${metadataResult.cid}`);
    console.log(`🔗 URI para NFT: ${metadataResult.cid}`);
    console.log(`🌐 Imagen URL: ${imageResult.url}`);
    console.log(`🌐 Metadata URL: ${metadataResult.url}`);

    // Guardar información en archivo local para referencia
    const uploadInfo = {
      timestamp: new Date().toISOString(),
      imageCID: imageResult.cid,
      metadataCID: metadataResult.cid,
      imageURL: imageResult.url,
      metadataURL: metadataResult.url,
    };

    fs.writeFileSync(
      "./ipfs-upload-info.json",
      JSON.stringify(uploadInfo, null, 2)
    );

    console.log("\n💾 Información guardada en ipfs-upload-info.json");
  } catch (error) {
    console.error("❌ Error en el proceso:", error.message);
    process.exit(1);
  }
}

module.exports = {
  uploadImageToIPFS,
  createAndUploadMetadata,
  listPinataFiles,
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}
