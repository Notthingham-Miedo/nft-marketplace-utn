import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useContracts } from "../hooks/useContracts";
import BuyNFT from "./BuyNFT";

function NFTCard({ nft }) {
  const { address } = useAccount();
  const { diploMarketplace, diploNFT, addresses } = useContracts();
  const [price, setPrice] = useState("");
  const [isListing, setIsListing] = useState(false);

  const { data: listData, writeContract: listNFT } = useWriteContract();

  const { data: approveData, writeContract: approveNFT } = useWriteContract();

  const { isLoading: isListingTransaction } = useWaitForTransactionReceipt({
    hash: listData,
  });

  const { isLoading: isApprovingTransaction } = useWaitForTransactionReceipt({
    hash: approveData,
    onSuccess: () => {
      // Después de la aprobación, listar el NFT
      listNFT({
        address: diploMarketplace.address,
        abi: diploMarketplace.abi,
        functionName: "listNFT",
        args: [addresses.DiploNFT, nft.tokenId, price],
      });
    },
  });

  const handleListNFT = async (e) => {
    e.preventDefault();

    if (!price) {
      alert("Por favor ingresa un precio");
      return;
    }

    try {
      setIsListing(true);

      // Primero aprobar el marketplace para transferir el NFT
      approveNFT({
        address: diploNFT.address,
        abi: diploNFT.abi,
        functionName: "approve",
        args: [addresses.DiploMarketplace, nft.tokenId],
      });
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Error listando NFT");
      setIsListing(false);
    }
  };

  const isOwner = address && nft.owner.toLowerCase() === address.toLowerCase();

  return (
    <div className="nft-card">
      <img
        src={nft.metadata.image}
        alt={nft.metadata.name}
        className="nft-image"
      />
      <div className="nft-info">
        <h3>{nft.metadata.name}</h3>
        <p>{nft.metadata.description}</p>
        <p className="nft-owner">
          Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
        </p>

        {isOwner ? (
          <div className="owner-actions">
            <h4>Listar en Marketplace</h4>
            <form onSubmit={handleListNFT} className="list-form">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio en DIP tokens"
                required
              />
              <button
                type="submit"
                disabled={
                  isApprovingTransaction || isListingTransaction || isListing
                }
                className="list-button"
              >
                {isApprovingTransaction
                  ? "Aprobando..."
                  : isListingTransaction
                  ? "Listando..."
                  : "Listar NFT"}
              </button>
            </form>
          </div>
        ) : (
          <BuyNFT nft={nft} />
        )}
      </div>
    </div>
  );
}

export default NFTCard;
