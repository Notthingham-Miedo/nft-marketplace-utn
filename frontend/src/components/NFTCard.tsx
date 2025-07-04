import React, { Fragment, useState } from 'react';
import { NFTData } from '../hooks/useNFTList';
import { getIPFSUrl } from '../services/pinata';
import { formatUnits } from 'viem';
import { useBuyNFT } from '../hooks/useBuyNFT';
import { useAccount } from 'wagmi';

interface NFTCardProps {
  nft: NFTData;
  onRefresh?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, onRefresh }) => {
  const { address } = useAccount();
  const { buyNFT, isPending } = useBuyNFT();
  const [imageError, setImageError] = useState(false);

  const handleBuy = async () => {
    if (nft.price) {
      await buyNFT(nft.tokenId, nft.price);
      onRefresh?.();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    if (imageError || !nft.metadata?.image) {
      return `https://via.placeholder.com/300x300/6366f1/ffffff?text=NFT+%23${nft.tokenId}`;
    }
    return getIPFSUrl(nft.metadata.image);
  };

  const isOwner = address?.toLowerCase() === nft.owner.toLowerCase();
  const canBuy = nft.isListed && !isOwner && address;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Imagen del NFT */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        <img
          src={getImageSrc()}
          alt={nft.metadata?.name || `NFT #${nft.tokenId}`}
          className="h-48 w-full object-cover object-center group-hover:opacity-75"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Información del NFT */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">
          {nft.metadata?.name || `NFT #${nft.tokenId}`}
        </h3>
        
        <p className="mt-1 text-sm text-gray-500">
          {nft.metadata?.description || 'Sin descripción'}
        </p>

        {/* Atributos */}
        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Atributos:</p>
            <div className="flex flex-wrap gap-1">
              {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Estado y precio */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <Fragment>
              <p className="text-xs text-gray-500">
                Owner: {isOwner ? 'Tú' : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
              </p>
              {nft.isListed && nft.price !== undefined && (
                <p className="text-sm font-medium text-green-600">
                  {formatUnits(nft.price, 18)} DIP
                </p>
              )}
            </Fragment>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-2">
            {nft.isListed && !isOwner ? (
              <button
                onClick={handleBuy}
                disabled={isPending || !canBuy}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  canBuy && !isPending
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isPending ? 'Comprando...' : 'Comprar'}
              </button>
            ) : nft.isListed && isOwner ? (
              <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800">
                En venta
              </span>
            ) : isOwner ? (
              <span className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-600">
                Tuyo
              </span>
            ) : (
              <span className="px-3 py-1 rounded text-sm font-medium bg-gray-100 text-gray-600">
                No disponible
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
