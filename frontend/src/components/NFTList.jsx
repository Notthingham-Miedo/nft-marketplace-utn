import { useState, useEffect } from "react";
import { useReadContract, useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import { useContracts } from "../hooks/useContracts";
import NFTCard from "./NFTCard";

function NFTList() {
  const config = useConfig();
  const { diploNFT } = useContracts();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: totalSupply, isError: totalSupplyError, isLoading: totalSupplyLoading } = useReadContract({
    address: diploNFT.address,
    abi: diploNFT.abi,
    functionName: "totalSupply",
  });

  console.log("NFTList Debug:", {
    totalSupply: totalSupply?.toString(),
    totalSupplyError,
    totalSupplyLoading,
    contractAddress: diploNFT.address
  });

  useEffect(() => {
    const loadNFTs = async () => {
      console.log("loadNFTs called with totalSupply:", totalSupply?.toString());
      
      if (totalSupplyLoading) {
        console.log("Total supply still loading...");
        return;
      }
      
      if (totalSupplyError) {
        console.error("Error getting total supply:", totalSupplyError);
        setError("Error connecting to contract");
        setLoading(false);
        return;
      }
      
      if (!totalSupply || totalSupply === 0n) {
        console.log("No NFTs available (total supply is 0)");
        setNfts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const nftList = [];

      try {
        const totalSupplyNumber = Number(totalSupply);
        console.log(`Loading ${totalSupplyNumber} NFTs...`);

        for (let i = 0; i < totalSupplyNumber; i++) {
          console.log(`Loading NFT ${i + 1}/${totalSupplyNumber}...`);
          
          // Obtener token ID por índice
          const tokenId = await readContract(config, {
            address: diploNFT.address,
            abi: diploNFT.abi,
            functionName: "tokenByIndex",
            args: [i],
          });
          console.log(`Token ID for index ${i}:`, tokenId?.toString());

          // Obtener URI del token
          const tokenURI = await readContract(config, {
            address: diploNFT.address,
            abi: diploNFT.abi,
            functionName: "tokenURI",
            args: [tokenId],
          });
          console.log(`Token URI for token ${tokenId}:`, tokenURI);

          // Obtener owner
          const owner = await readContract(config, {
            address: diploNFT.address,
            abi: diploNFT.abi,
            functionName: "ownerOf",
            args: [tokenId],
          });
          console.log(`Owner for token ${tokenId}:`, owner);

          // Obtener metadata desde IPFS
          let metadata = {};
          if (tokenURI) {
            try {
              console.log(`Fetching metadata from: ${tokenURI}`);
              const response = await fetch(tokenURI);
              if (response.ok) {
                metadata = await response.json();
                console.log(`Metadata for token ${tokenId}:`, metadata);
              } else {
                console.warn(`Failed to fetch metadata (${response.status}), using placeholder`);
                metadata = {
                  name: `NFT #${tokenId}`,
                  description: "Metadata not available",
                  image: `https://picsum.photos/400/400?random=${tokenId}`
                };
              }
            } catch (metadataError) {
              console.warn(`Error fetching metadata for token ${tokenId}:`, metadataError);
              metadata = {
                name: `NFT #${tokenId}`,
                description: "Metadata not available",
                image: `https://picsum.photos/400/400?random=${tokenId}`
              };
            }
          }

          nftList.push({
            tokenId: Number(tokenId),
            owner,
            metadata,
            tokenURI,
          });
        }

        console.log("Loaded NFTs:", nftList);
        setNfts(nftList);
      } catch (error) {
        console.error("Error loading NFTs:", error);
        setError(`Error loading NFTs: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [totalSupply, totalSupplyLoading, totalSupplyError, diploNFT, config]);

  if (loading) {
    return <div className="loading">Cargando NFTs...</div>;
  }

  if (error) {
    return (
      <div className="nft-list">
        <h2>NFTs en el Marketplace</h2>
        <div className="error">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nft-list">
      <h2>NFTs en el Marketplace</h2>
      <p className="nft-count">Total de NFTs: {nfts.length}</p>
      {nfts.length === 0 ? (
        <div className="no-nfts">
          <p>📭 No hay NFTs disponibles</p>
          <p className="hint">💡 Crea tu primer NFT usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <NFTCard key={nft.tokenId} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NFTList;
