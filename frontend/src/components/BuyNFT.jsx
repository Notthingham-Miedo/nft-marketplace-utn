import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useContracts } from "../hooks/useContracts";

function BuyNFT({ nft }) {
  const { address } = useAccount();
  const { diploMarketplace, diploToken, addresses } = useContracts();
  const [listing, setListing] = useState(null);
  const [userBalance, setUserBalance] = useState("0");

  // Leer información del listing
  const { data: listingData } = useReadContract({
    address: diploMarketplace.address,
    abi: diploMarketplace.abi,
    functionName: "listings",
    args: [addresses.DiploNFT, nft.tokenId],
  });

  // Leer balance del usuario
  const { data: balance } = useReadContract({
    address: diploToken.address,
    abi: diploToken.abi,
    functionName: "balanceOf",
    args: [address],
  });

  // Aprobar tokens
  const { data: approveData, writeContract: approveTokens } = useWriteContract();

  // Comprar NFT
  const { data: buyData, writeContract: buyNFT } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveData,
    onSuccess: () => {
      // Después de la aprobación, comprar el NFT
      buyNFT({
        address: diploMarketplace.address,
        abi: diploMarketplace.abi,
        functionName: "buyNFT",
        args: [addresses.DiploNFT, nft.tokenId, addresses.DiploToken],
      });
    },
  });

  const { isLoading: isBuying } = useWaitForTransactionReceipt({
    hash: buyData,
  });

  useEffect(() => {
    if (listingData) {
      const [seller, price, active] = listingData;
      setListing({
        seller,
        price: Number(price),
        active,
      });
    }
  }, [listingData]);

  useEffect(() => {
    if (balance) {
      setUserBalance(Number(balance));
    }
  }, [balance]);

  const handleBuyNFT = async () => {
    if (!listing || !listing.active) {
      alert("Este NFT no está en venta");
      return;
    }

    if (userBalance < listing.price) {
      alert("No tienes suficientes DIP tokens");
      return;
    }

    try {
      // Primero aprobar los tokens
      approveTokens({
        address: diploToken.address,
        abi: diploToken.abi,
        functionName: "approve",
        args: [addresses.DiploMarketplace, listing.price],
      });
    } catch (error) {
      console.error("Error buying NFT:", error);
      alert("Error comprando NFT");
    }
  };

  if (!listing || !listing.active) {
    return (
      <div className="buy-section">
        <p>Este NFT no está en venta</p>
      </div>
    );
  }

  const hasEnoughTokens = userBalance >= listing.price;

  return (
    <div className="buy-section">
      <div className="price-info">
        <h4>Precio: {listing.price} DIP</h4>
        <p>Tu balance: {userBalance} DIP</p>
      </div>

      {!hasEnoughTokens && (
        <p className="insufficient-balance">No tienes suficientes tokens</p>
      )}

      <button
        onClick={handleBuyNFT}
        disabled={!hasEnoughTokens || isApproving || isBuying}
        className={`buy-button ${!hasEnoughTokens ? "disabled" : ""}`}
      >
        {isApproving
          ? "Aprobando tokens..."
          : isBuying
          ? "Comprando..."
          : "Comprar NFT"}
      </button>
    </div>
  );
}

export default BuyNFT;
