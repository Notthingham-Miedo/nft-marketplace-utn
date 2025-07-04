import { useContractRead, useContractReads } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { nftAbi, marketplaceAbi } from '../constants/abis';
import { NFTMetadata } from '../services/pinata';
import { useState, useEffect, useMemo } from 'react';

// Función auxiliar para cargar metadatos de IPFS
const loadMetadataFromIPFS = async (tokenURI: string, tokenId: number): Promise<NFTMetadata> => {
  console.log(`Loading metadata for token ${tokenId} from URI: ${tokenURI}`);
  
  try {
    let metadataUrl = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      metadataUrl = tokenURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
      console.log(`Converted IPFS URL: ${metadataUrl}`);
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    console.log(`Fetching metadata from: ${metadataUrl}`);
    const response = await fetch(metadataUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`Fetch response status: ${response.status}`);
    
    if (response.ok) {
      const metadata = await response.json();
      console.log(`Raw metadata for token ${tokenId}:`, metadata);
      
      // Procesar la URL de la imagen si usa IPFS
      if (metadata.image && metadata.image.startsWith('ipfs://')) {
        const originalImage = metadata.image;
        metadata.image = metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/');
        console.log(`Converted image URL from ${originalImage} to ${metadata.image}`);
      }
      
      console.log(`Processed metadata for token ${tokenId}:`, metadata);
      return metadata;
    }
    
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    console.error(`Error loading metadata for token ${tokenId}:`, error);
    // Retornar metadata por defecto
    const fallbackMetadata = {
      name: `NFT #${tokenId}`,
      description: `NFT Token ID ${tokenId}`,
      image: `https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT+%23${tokenId}`,
      attributes: []
    };
    console.log(`Using fallback metadata for token ${tokenId}:`, fallbackMetadata);
    return fallbackMetadata;
  }
};

// Constantes
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MAX_NFTS_TO_LOAD = 50; // Límite para evitar cargar demasiados NFTs

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

  console.log('Contract addresses:', CONTRACT_ADDRESSES);

  // Obtener total supply
  const { data: totalSupply, refetch: refetchTotalSupply } = useContractRead({
    address: CONTRACT_ADDRESSES.NFT,
    abi: nftAbi,
    functionName: 'totalSupply',
    enabled: !!CONTRACT_ADDRESSES.NFT,
    watch: true,
  });

  console.log('Total supply data:', totalSupply);

  // Generar contratos calls dinámicamente basado en totalSupply
  const contractCalls = useMemo(() => {
    if (!totalSupply || Number(totalSupply) === 0) return [];
    
    const calls = [];
    const maxTokens = Math.min(Number(totalSupply), MAX_NFTS_TO_LOAD);
    
    console.log(`Generating contract calls for ${maxTokens} tokens`);
    
    for (let i = 1; i <= maxTokens; i++) {
      // TokenURI call
      calls.push({
        address: CONTRACT_ADDRESSES.NFT,
        abi: nftAbi,
        functionName: 'tokenURI',
        args: [i],
      });
      
      // Owner call
      calls.push({
        address: CONTRACT_ADDRESSES.NFT,
        abi: nftAbi,
        functionName: 'ownerOf',
        args: [i],
      });
      
      // Listing info call
      calls.push({
        address: CONTRACT_ADDRESSES.MARKETPLACE,
        abi: marketplaceAbi,
        functionName: 'listings',
        args: [i],
      });
    }
    
    console.log(`Generated ${calls.length} contract calls:`, calls);
    return calls;
  }, [totalSupply]);

  // Ejecutar todas las llamadas al contrato
  const { data: contractResults, isLoading: contractLoading, error: contractError } = useContractReads({
    contracts: contractCalls,
    enabled: contractCalls.length > 0,
    watch: true,
  });

  console.log('Contract reads result:', { contractResults, contractLoading, contractError });

  useEffect(() => {
    const processNFTData = async () => {
      console.log('Processing NFT data...', { totalSupply, contractLoading, contractResults });
      
      if (!totalSupply || Number(totalSupply) === 0) {
        console.log('No totalSupply, setting empty NFTs');
        setNfts([]);
        setLoading(false);
        return;
      }

      if (contractLoading || !contractResults) {
        console.log('Contract loading or no results yet');
        setLoading(true);
        return;
      }

      setLoading(true);
      
      try {
        const maxTokens = Math.min(Number(totalSupply), MAX_NFTS_TO_LOAD);
        console.log(`Processing ${maxTokens} NFTs from totalSupply: ${totalSupply}`);
        const nftArray: NFTData[] = [];

        for (let i = 0; i < maxTokens; i++) {
          const tokenId = i + 1;
          const baseIndex = i * 3; // 3 llamadas por NFT
          
          const tokenURIResult = contractResults[baseIndex];
          const ownerResult = contractResults[baseIndex + 1];
          const listingResult = contractResults[baseIndex + 2];

          console.log(`Token ${tokenId}:`, {
            tokenURIResult,
            ownerResult,
            listingResult
          });

          let metadata: NFTMetadata | undefined;
          let tokenURI = '';

          // Procesar tokenURI
          if (tokenURIResult?.status === 'success' && tokenURIResult.result) {
            tokenURI = tokenURIResult.result as string;
            console.log(`Loading metadata for token ${tokenId} from: ${tokenURI}`);
            
            // Cargar metadata desde IPFS
            metadata = await loadMetadataFromIPFS(tokenURI, tokenId);
            console.log(`Metadata loaded for token ${tokenId}:`, metadata);
          } else {
            console.log(`No tokenURI for token ${tokenId}:`, tokenURIResult);
          }

          // Procesar owner
          const owner = ownerResult?.status === 'success' && ownerResult.result 
            ? ownerResult.result as string 
            : ZERO_ADDRESS;

          console.log(`Owner for token ${tokenId}: ${owner}`);

          // Procesar listing info
          let isListed = false;
          let price: bigint | undefined;
          let seller: string | undefined;

          if (listingResult?.status === 'success' && listingResult.result) {
            const [listingSeller, listingPrice] = listingResult.result as [string, bigint];
            
            // Verificar si está realmente listado (seller no es address(0) y precio > 0)
            isListed = listingSeller !== ZERO_ADDRESS && listingPrice > BigInt(0);
            
            if (isListed) {
              price = listingPrice;
              seller = listingSeller;
            }
            
            console.log(`Listing info for token ${tokenId}:`, { isListed, price, seller });
          }

          const nftData: NFTData = {
            tokenId,
            tokenURI: tokenURI || `placeholder-${tokenId}`,
            metadata: metadata || {
              name: `NFT #${tokenId}`,
              description: `NFT Token ID ${tokenId}`,
              image: `https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT+%23${tokenId}`,
              attributes: []
            },
            owner,
            isListed,
            price,
            seller
          };
          
          nftArray.push(nftData);
        }

        console.log('Final NFT array:', nftArray);
        setNfts(nftArray);
      } catch (error) {
        console.error('Error processing NFT data:', error);
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    processNFTData();
  }, [totalSupply, contractResults, contractLoading]);

  return { 
    nfts, 
    loading: loading || contractLoading, 
    refetch: async () => {
      setLoading(true);
      await refetchTotalSupply();
    }
  };
};
