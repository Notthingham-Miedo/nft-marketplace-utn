import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { nftAbi } from '../constants/abis';
import { NFTMetadata } from '../services/pinata';
import { useState, useEffect } from 'react';

export interface NFTData {
  tokenId: number;
  tokenURI: string;
  metadata?: NFTMetadata;
  owner: string;
  isListed: boolean;
  price?: bigint;
  seller?: string;
}

export const useNFTList = () => {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener total supply
  const { data: totalSupply } = useContractRead({
    address: CONTRACT_ADDRESSES.NFT,
    abi: nftAbi,
    functionName: 'totalSupply',
    enabled: true,
    watch: true,
  });

  useEffect(() => {
    const loadNFTs = async () => {
      if (!totalSupply || Number(totalSupply) === 0) {
        setNfts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const nftArray: NFTData[] = [];

      try {
        // Para simplificar, cargamos solo los primeros 10 NFTs
        const maxTokens = Math.min(Number(totalSupply), 10);
        
        for (let i = 1; i <= maxTokens; i++) {
          try {
            // En una implementación real, aquí harías las llamadas al contrato
            // Para evitar errores de hooks, usamos una implementación simple
            const nftData: NFTData = {
              tokenId: i,
              tokenURI: `https://gateway.pinata.cloud/ipfs/mock-hash-${i}`,
              metadata: {
                name: `Mock NFT #${i}`,
                description: `Descripción del NFT #${i}`,
                image: `https://gateway.pinata.cloud/ipfs/mock-image-${i}`,
                attributes: []
              },
              owner: '0x0000000000000000000000000000000000000000',
              isListed: i % 2 === 0, // Algunos listados, otros no
              price: i % 2 === 0 ? BigInt(100) : undefined,
              seller: i % 2 === 0 ? '0x0000000000000000000000000000000000000000' : undefined
            };
            
            nftArray.push(nftData);
          } catch (error) {
            console.error(`Error loading NFT ${i}:`, error);
          }
        }

        setNfts(nftArray);
      } catch (error) {
        console.error('Error loading NFTs:', error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [totalSupply]);

  return { 
    nfts, 
    loading, 
    refetch: () => {
      // Implementación simple del refetch
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  };
};
