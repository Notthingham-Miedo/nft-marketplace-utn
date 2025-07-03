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

  const { data: totalSupply } = useReadContract({
    address: diploNFT.address,
    abi: diploNFT.abi,
    functionName: "totalSupply",
  });

  useEffect(() => {
    const loadNFTs = async () => {
      if (!totalSupply) return;

      setLoading(true);
      const nftList = [];

      try {
        for (let i = 0; i < Number(totalSupply); i++) {
          // Obtener token ID por índice
          const tokenId = await readContract(config, {
            address: diploNFT.address,
            abi: diploNFT.abi,
            functionName: "tokenByIndex",
            args: [i],
          });

          // Obtener URI del token
          const tokenURI = await readContract(config, {
            address: diploNFT.address,
            abi: diploNFT.abi,
            functionName: "tokenURI",
            args: [tokenId],
          });

          // Obtener owner
          const owner = await readContract(config, {
            address: diploNFT.address,
            abi: diploNFT.abi,
            functionName: "ownerOf",
            args: [tokenId],
          });

          // Obtener metadata desde IPFS
          const response = await fetch(tokenURI);
          const metadata = await response.json();

          nftList.push({
            tokenId: Number(tokenId),
            owner,
            metadata,
            tokenURI,
          });
        }

        setNfts(nftList);
      } catch (error) {
        console.error("Error loading NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [totalSupply, diploNFT]);

  if (loading) {
    return <div className="loading">Cargando NFTs...</div>;
  }

  return (
    <div className="nft-list">
      <h2>NFTs en el Marketplace</h2>
      {nfts.length === 0 ? (
        <p>No hay NFTs disponibles</p>
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
