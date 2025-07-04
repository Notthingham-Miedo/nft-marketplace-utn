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
    
    // Detectar y corregir URLs malformadas del contrato
    if (tokenURI.includes('ipfs.io/ipfs/data:application/json')) {
      // URL malformada del contrato, extraer solo la parte data:
      const dataUrlMatch = tokenURI.match(/(data:application\/json[^"]*)/);
      if (dataUrlMatch) {
        metadataUrl = dataUrlMatch[1];
        console.log(`Fixed malformed contract URL from ${tokenURI} to ${metadataUrl}`);
      }
    } else if (tokenURI.includes('ipfs.io/ipfs/ipfs://')) {
      // Duplicación de prefijos IPFS
      const hashMatch = tokenURI.match(/([a-zA-Z0-9]{46,})/);
      if (hashMatch) {
        const hash = hashMatch[0];
        metadataUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
        console.log(`Fixed duplicated IPFS URL from ${tokenURI} to ${metadataUrl}`);
      }
    } else if (tokenURI.includes('ipfs://')) {
      // URL normal de IPFS
      const hashMatch = tokenURI.match(/([a-zA-Z0-9]{46,})/);
      if (hashMatch) {
        const hash = hashMatch[0];
        metadataUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
        console.log(`Converted IPFS URL from ${tokenURI} to ${metadataUrl}`);
      }
    } else if (tokenURI.startsWith('http')) {
      // Si ya es una URL HTTP, usarla directamente
      metadataUrl = tokenURI;
    } else if (tokenURI.startsWith('data:')) {
      // Si es un data URL, usarla directamente
      metadataUrl = tokenURI;
    } else {
      // Si es solo un hash, agregar el gateway
      metadataUrl = `https://gateway.pinata.cloud/ipfs/${tokenURI}`;
    }
    
    console.log(`Final metadata URL: ${metadataUrl}`);
    
    // Si es un data URL, decodificar directamente
    if (metadataUrl.startsWith('data:application/json;base64,')) {
      const base64Data = metadataUrl.replace('data:application/json;base64,', '');
      const metadata = JSON.parse(atob(base64Data));
      console.log(`Decoded data URL metadata for token ${tokenId}:`, metadata);
      return metadata;
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
      
      // No procesamos la URL de la imagen aquí - lo haremos en el componente
      // Esto permite que el componente maneje diferentes tipos de URLs correctamente
      
      console.log(`Processed metadata for token ${tokenId}:`, metadata);
      return metadata;
    }
    
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    console.error(`Error loading metadata for token ${tokenId}:`, error);
    // Retornar metadata por defecto solo si realmente falló la carga
    const fallbackMetadata = {
      name: `NFT #${tokenId}`,
      description: `NFT Token ID ${tokenId} - Metadata not available`,
      image: `https://picsum.photos/300/300?random=${tokenId}`,
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
  listingId?: number; // Agregamos listingId para el marketplace
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

  // Obtener listings activos
  const { data: activeListings, refetch: refetchActiveListings } = useContractRead({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: marketplaceAbi,
    functionName: 'getActiveListings',
    enabled: !!CONTRACT_ADDRESSES.MARKETPLACE,
    watch: true,
  });

  console.log('Total supply data:', totalSupply);
  console.log('Active listings data:', activeListings);

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
    }
    
    // Agregar calls para obtener detalles de listings activos
    if (activeListings && Array.isArray(activeListings)) {
      for (const listingId of activeListings) {
        calls.push({
          address: CONTRACT_ADDRESSES.MARKETPLACE,
          abi: marketplaceAbi,
          functionName: 'getListing',
          args: [listingId],
        });
      }
    }
    
    console.log(`Generated ${calls.length} contract calls:`, calls);
    return calls;
  }, [totalSupply, activeListings]);

  // Ejecutar todas las llamadas al contrato
  const { data: contractResults, isLoading: contractLoading, error: contractError } = useContractReads({
    contracts: contractCalls,
    enabled: contractCalls.length > 0,
    watch: true,
  });

  console.log('Contract reads result:', { contractResults, contractLoading, contractError });

  useEffect(() => {
    const processNFTData = async () => {
      console.log('Processing NFT data...', { totalSupply, contractLoading, contractResults, activeListings });
      
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
        
        // Procesar datos de NFTs básicos
        for (let i = 0; i < maxTokens; i++) {
          const tokenId = i + 1;
          const baseIndex = i * 2; // 2 llamadas por NFT (tokenURI y owner)
          
          const tokenURIResult = contractResults[baseIndex];
          const ownerResult = contractResults[baseIndex + 1];

          console.log(`Token ${tokenId}:`, {
            tokenURIResult,
            ownerResult
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

          const nftData: NFTData = {
            tokenId,
            tokenURI: tokenURI || `placeholder-${tokenId}`,
            metadata: metadata || {
              name: `NFT #${tokenId}`,
              description: `NFT Token ID ${tokenId}`,
              image: `https://picsum.photos/300/300?random=${tokenId}`,
              attributes: []
            },
            owner,
            isListed: false,
            price: undefined,
            seller: undefined,
            listingId: undefined
          };
          
          nftArray.push(nftData);
        }

        // Procesar listings activos
        if (activeListings && Array.isArray(activeListings) && activeListings.length > 0) {
          const listingStartIndex = maxTokens * 2; // Después de las llamadas de NFT
          
          for (let i = 0; i < activeListings.length; i++) {
            const listingId = activeListings[i];
            const listingResult = contractResults[listingStartIndex + i];
            
            if (listingResult?.status === 'success' && listingResult.result) {
              const [seller, , tokenId, price, active] = listingResult.result as [string, string, bigint, bigint, boolean];
              
              // Verificar que el listing esté activo
              if (active && price > BigInt(0)) {
                // Encontrar el NFT correspondiente y actualizar su información de listing
                const nftIndex = nftArray.findIndex(nft => nft.tokenId === Number(tokenId));
                if (nftIndex !== -1) {
                  nftArray[nftIndex].isListed = true;
                  nftArray[nftIndex].price = price;
                  nftArray[nftIndex].seller = seller;
                  nftArray[nftIndex].listingId = Number(listingId);
                  
                  console.log(`Updated NFT ${tokenId} with listing info:`, {
                    listingId: Number(listingId),
                    seller,
                    price: price.toString(),
                    active
                  });
                }
              }
            }
          }
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
  }, [totalSupply, contractResults, contractLoading, activeListings]);

  return { 
    nfts, 
    loading: loading || contractLoading, 
    refetch: async () => {
      setLoading(true);
      await refetchTotalSupply();
      await refetchActiveListings();
    }
  };
};
