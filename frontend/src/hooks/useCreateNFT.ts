import { useContractWrite, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { nftAbi } from '../constants/abis';
import { uploadImageToPinata, uploadJSONToPinata, NFTMetadata } from '../services/pinata';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { parseEther } from 'viem';

export interface CreateNFTData {
  name: string;
  description: string;
  image: File;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  price: string; // En tokens DIP
}

export const useCreateNFT = () => {
  const { address } = useAccount();
  const [isCreating, setIsCreating] = useState(false);

  // Hook para mint NFT
  const { writeAsync: mintAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.NFT,
    abi: nftAbi,
    functionName: 'mintNFT',
  });

  const createAndListNFT = async (nftData: CreateNFTData) => {
    if (!address) {
      toast.error('Conecta tu wallet primero');
      return;
    }

    setIsCreating(true);

    try {
      toast.info('Subiendo imagen a IPFS...');
      
      // 1. Subir imagen a Pinata
      const imageHash = await uploadImageToPinata(nftData.image);
      const imageUrl = `ipfs://${imageHash}`;

      // 2. Crear metadata JSON
      const metadata: NFTMetadata = {
        name: nftData.name,
        description: nftData.description,
        image: imageUrl,
        attributes: nftData.attributes,
      };

      toast.info('Subiendo metadata a IPFS...');
      
      // 3. Subir metadata a Pinata
      const metadataHash = await uploadJSONToPinata(metadata);

      toast.info('Creando NFT...');

      // 4. Mint NFT
      await mintAsync({
        args: [address, metadataHash],
      });

      toast.success('NFT creado exitosamente!');
      setIsCreating(false);
      
      // Nota: El listado se haría en un paso separado después de obtener el tokenId
      // desde el evento o consultando el último token minteado
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Error al crear el NFT');
      setIsCreating(false);
      throw error;
    }
  };

  return {
    createAndListNFT,
    isPending: isCreating,
  };
};
