import React, { Fragment, useState } from 'react';
import { NFTData } from '../hooks/useNFTList';
import { getIPFSUrl } from '../services/pinata';
import { formatUnits, parseUnits } from 'viem';
import { useBuyNFT } from '../hooks/useBuyNFT';
import { useCancelListing } from '../hooks/useCancelListing';
import { useAccount, useContractWrite } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { marketplaceAbi, nftAbi } from '../constants/abis';
import { toast } from 'react-toastify';

interface NFTCardProps {
  nft: NFTData;
  onRefresh?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, onRefresh }) => {
  const { address } = useAccount();
  const { buyNFT, isPending } = useBuyNFT();
  const { cancelListing, isPending: isCanceling } = useCancelListing();
  const [imageError, setImageError] = useState(false);
  const [showListForm, setShowListForm] = useState(false);
  const [listPrice, setListPrice] = useState('');

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

  const handleBuy = async () => {
    if (nft.price && nft.listingId !== undefined) {
      await buyNFT(nft.listingId, nft.price);
      onRefresh?.();
    }
  };

  const handleCancelListing = async () => {
    if (nft.listingId !== undefined) {
      await cancelListing(nft.listingId);
      onRefresh?.();
    }
  };

  const handleListNFT = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      toast.error('Por favor ingresa un precio válido');
      return;
    }

    try {
      toast.info('Aprobando NFT para el marketplace...');
      
      // 1. Aprobar el marketplace para transferir el NFT
      await approveAsync({
        args: [CONTRACT_ADDRESSES.MARKETPLACE, BigInt(nft.tokenId)],
      });

      toast.info('Listando NFT para venta...');
      
      // 2. Listar el NFT
      const priceInWei = parseUnits(listPrice, 18);
      await listAsync({
        args: [CONTRACT_ADDRESSES.NFT, BigInt(nft.tokenId), priceInWei],
      });

      toast.success('NFT listado exitosamente!');
      setShowListForm(false);
      setListPrice('');
      onRefresh?.();
      
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Error al listar el NFT');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    // Si hay error de imagen o no hay imagen, usar placeholder
    if (imageError || !nft.metadata?.image) {
      return `https://picsum.photos/300/300?random=${nft.tokenId}`;
    }
    
    // Log para debug
    console.log(`Getting image src for NFT ${nft.tokenId}:`, nft.metadata.image);
    
    // Si la imagen ya es una URL completa (http/https), usarla directamente
    if (nft.metadata.image.startsWith('http')) {
      return nft.metadata.image;
    }
    
    // Si es un data URL (base64), usarla directamente
    if (nft.metadata.image.startsWith('data:')) {
      return nft.metadata.image;
    }
    
    // Si es un hash de IPFS, convertirlo a URL completa
    const ipfsUrl = getIPFSUrl(nft.metadata.image);
    console.log(`Converted to IPFS URL for NFT ${nft.tokenId}:`, ipfsUrl);
    return ipfsUrl;
  };

  const isOwner = address?.toLowerCase() === nft.owner.toLowerCase();
  const canBuy = nft.isListed && !isOwner && address && nft.listingId !== undefined;

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
              <div className="flex flex-col space-y-2">
                <span className="px-3 py-1 rounded text-sm font-medium bg-yellow-100 text-yellow-800 text-center">
                  En venta por {formatUnits(nft.price || BigInt(0), 18)} DIP
                </span>
                <button
                  onClick={handleCancelListing}
                  disabled={isCanceling}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    isCanceling
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isCanceling ? 'Cancelando...' : 'Retirar de venta'}
                </button>
              </div>
            ) : isOwner ? (
              <div className="flex flex-col space-y-2">
                {!showListForm ? (
                  <button
                    onClick={() => setShowListForm(true)}
                    className="px-3 py-1 rounded text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                  >
                    Listar para venta
                  </button>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="number"
                      value={listPrice}
                      onChange={(e) => setListPrice(e.target.value)}
                      placeholder="Precio en DIP"
                      className="px-2 py-1 border rounded text-sm"
                      min="0"
                      step="0.01"
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={handleListNFT}
                        className="px-2 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => {
                          setShowListForm(false);
                          setListPrice('');
                        }}
                        className="px-2 py-1 rounded text-xs font-medium bg-gray-500 text-white hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
