import { useContractWrite, useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { nftAbi, marketplaceAbi } from '../constants/abis';
import { uploadImageToPinata, uploadJSONToPinata, NFTMetadata } from '../services/pinata';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { parseUnits } from 'viem';

export interface CreateNFTData {
  name: string;
  description: string;
  image: File;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  price: string; // En tokens DIP
  shouldList?: boolean; // Si se debe listar automáticamente
}

export const useCreateNFT = () => {
  const { address } = useAccount();
  const [isCreating, setIsCreating] = useState(false);

  // Hook para mint NFT (usando la función pública 'mint')
  const { writeAsync: mintAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.NFT,
    abi: nftAbi,
    functionName: 'mint',
  });

  // Hook para aprobar NFT
  const { writeAsync: approveAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.NFT,
    abi: nftAbi,
    functionName: 'approve',
  });

  // Hook para listar NFT
  const { writeAsync: listAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: marketplaceAbi,
    functionName: 'listNFT',
  });

  // Hook para obtener totalSupply (para conocer el siguiente tokenId)
  const { data: totalSupply } = useContractRead({
    address: CONTRACT_ADDRESSES.NFT,
    abi: nftAbi,
    functionName: 'totalSupply',
    enabled: !!CONTRACT_ADDRESSES.NFT,
  });

  const createAndListNFT = async (nftData: CreateNFTData) => {
    if (!address) {
      toast.error('Conecta tu wallet primero');
      return;
    }

    if (nftData.shouldList && (!nftData.price || parseFloat(nftData.price) <= 0)) {
      toast.error('Precio inválido para listar el NFT');
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
      const metadataUrl = `ipfs://${metadataHash}`;

      toast.info('Creando NFT...');

      // 4. Obtener el próximo tokenId
      const nextTokenId = totalSupply ? Number(totalSupply) + 1 : 1;

      // 5. Mint NFT con URL completa de metadata
      await mintAsync({
        args: [metadataUrl],
      });

      toast.success('NFT creado exitosamente!');

      // 6. Si se debe listar, proceder con el listado
      if (nftData.shouldList && nftData.price) {
        toast.info('Aprobando NFT para el marketplace...');
        
        // Aprobar el marketplace para transferir el NFT
        await approveAsync({
          args: [CONTRACT_ADDRESSES.MARKETPLACE, BigInt(nextTokenId)],
        });

        toast.info('Listando NFT para venta...');
        
        // Listar el NFT
        const priceInWei = parseUnits(nftData.price, 18);
        await listAsync({
          args: [CONTRACT_ADDRESSES.NFT, BigInt(nextTokenId), priceInWei],
        });

        toast.success('NFT creado y listado exitosamente!');
      }

      setIsCreating(false);
      
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
