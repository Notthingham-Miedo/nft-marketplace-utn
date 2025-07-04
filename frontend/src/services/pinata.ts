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
  // Limpiar el hash si viene con ipfs://
  const cleanHash = hash.replace('ipfs://', '');
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
};
