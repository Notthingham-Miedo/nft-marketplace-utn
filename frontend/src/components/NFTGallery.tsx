import React from 'react';
import { useNFTList } from '../hooks/useNFTList';
import { NFTCard } from './NFTCard';

export const NFTGallery: React.FC = () => {
  const { nfts, loading } = useNFTList();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Cargando NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay NFTs disponibles
        </h3>
        <p className="text-gray-600">
          Sé el primero en crear un NFT en el marketplace.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Marketplace NFT ({nfts.length} NFTs)
        </h2>
        <p className="text-gray-600">
          Explora y compra NFTs únicos creados por la comunidad
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <NFTCard 
            key={nft.tokenId} 
            nft={nft} 
            onRefresh={() => window.location.reload()} // En una app real usarías un estado manager
          />
        ))}
      </div>
    </div>
  );
};
