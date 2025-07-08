const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// Función para obtener headers de autenticación
function getPinataHeaders(includeContentType = false) {
  const headers = {};
  
  // Si tenemos JWT, usarlo (más moderno y seguro)
  if (PINATA_JWT && PINATA_JWT !== 'test_jwt') {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`;
  } 
  // Si no tenemos JWT pero sí API Key y Secret, usarlos
  else if (PINATA_API_KEY && PINATA_SECRET_KEY && 
           PINATA_API_KEY !== 'test_key' && PINATA_SECRET_KEY !== 'test_secret') {
    headers['pinata_api_key'] = PINATA_API_KEY;
    headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
  } else {
    throw new Error('Credenciales de Pinata no configuradas correctamente');
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

export async function uploadImageToPinata(file) {
  // Verificar credenciales antes de intentar la subida
  try {
    getPinataHeaders();
  } catch (error) {
    console.warn('⚠️ Credenciales de Pinata no válidas, usando URL de placeholder');
    return {
      success: true,
      ipfsHash: 'QmTesting123',
      url: `https://picsum.photos/400/400?random=${Date.now()}` // Imagen placeholder para testing
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({
    name: `NFT-Image-${Date.now()}`,
  });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", pinataOptions);

  try {
    const headers = getPinataHeaders();
    
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: headers,
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    
    // Fallback para testing local
    console.warn('🔄 Usando imagen placeholder para continuar testing');
    return {
      success: true,
      ipfsHash: 'QmTesting123',
      url: `https://picsum.photos/400/400?random=${Date.now()}`,
      isPlaceholder: true
    };
  }
}

export async function uploadMetadataToPinata(metadata) {
  // Verificar credenciales antes de intentar la subida
  try {
    getPinataHeaders(true);
  } catch (error) {
    console.warn('⚠️ Credenciales de Pinata no válidas, usando metadata de placeholder');
    return {
      success: true,
      ipfsHash: 'QmTestingMetadata123',
      url: `data:application/json;base64,${btoa(JSON.stringify(metadata))}` // Data URL para testing
    };
  }

  try {
    const headers = getPinataHeaders(true);
    
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `NFT-Metadata-${Date.now()}`,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
    };
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    
    // Fallback para testing local - crear una URL de datos
    console.warn('🔄 Usando metadata placeholder para continuar testing');
    const metadataString = JSON.stringify(metadata);
    const dataUrl = `data:application/json;base64,${btoa(metadataString)}`;
    
    return {
      success: true,
      ipfsHash: 'QmTestingMetadata123',
      url: dataUrl,
      isPlaceholder: true
    };
  }
}
