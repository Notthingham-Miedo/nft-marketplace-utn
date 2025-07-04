import axios from 'axios';

const pinataAPI = axios.create({
  baseURL: 'https://api.pinata.cloud',
  headers: {
    'pinata_api_key': process.env.REACT_APP_PINATA_API_KEY!,
    'pinata_secret_api_key': process.env.REACT_APP_PINATA_SECRET_KEY!,
  },
});

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export const uploadImageToPinata = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await pinataAPI.post('/pinning/pinFileToIPFS', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading image to Pinata:', error);
    throw new Error('Failed to upload image to IPFS');
  }
};

export const uploadJSONToPinata = async (jsonData: NFTMetadata): Promise<string> => {
  try {
    const response = await pinataAPI.post('/pinning/pinJSONToIPFS', jsonData);
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to Pinata:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

export const fetchMetadataFromIPFS = async (ipfsHash: string): Promise<NFTMetadata> => {
  try {
    const url = getIPFSUrl(ipfsHash);
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
};

export const getIPFSUrl = (hash: string): string => {
  // Si ya es una URL completa, devolverla tal como está
  if (hash.startsWith('http')) {
    return hash;
  }
  
  // Si es un data URL (base64), devolverla tal como está
  if (hash.startsWith('data:')) {
    return hash;
  }
  
  // Limpiar y extraer el hash real de IPFS
  let cleanHash = hash;
  if (hash.includes('ipfs://')) {
    // Extraer solo el hash, removiendo cualquier duplicación o prefijos
    const hashMatch = hash.match(/([a-zA-Z0-9]{46,})/);
    if (hashMatch) {
      cleanHash = hashMatch[0];
    } else {
      // Fallback: remover prefijo ipfs://
      cleanHash = hash.replace('ipfs://', '');
    }
  }
  
  // Devolver URL de gateway de Pinata
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};
