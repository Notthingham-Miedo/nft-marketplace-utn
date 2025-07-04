import React, { useState, Fragment } from 'react';
import { useAccount, useContractRead, useNetwork, useSwitchNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CONTRACT_ADDRESSES, SUPPORTED_CHAINS } from '../config/wagmi';
import { erc20Abi } from '../constants/abis';
import { formatUnits } from 'viem';
import { CreateNFTForm } from './CreateNFTForm';
import { NFTGallery } from './NFTGallery';

export const Marketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'create'>('gallery');
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  // Obtener balance de tokens DIP
  const { data: balance } = useContractRead({
    address: CONTRACT_ADDRESSES.TOKEN,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });

  const isCorrectNetwork = chain?.id === SUPPORTED_CHAINS.HARDHAT || chain?.id === SUPPORTED_CHAINS.POLYGON_MUMBAI;

  const handleSwitchNetwork = () => {
    switchNetwork?.(SUPPORTED_CHAINS.POLYGON_MUMBAI);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NFT Marketplace</h1>
              <p className="text-gray-600">Compra y vende NFTs con tokens DIP</p>
            </div>

            <div className="flex items-center space-x-4">
              <Fragment>
                {/* Balance de tokens */}
                {isConnected && balance !== undefined && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Balance DIP</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatUnits(balance, 18)} DIP
                    </p>
                  </div>
                )}

                {/* Botón de conexión */}
                <ConnectButton />
              </Fragment>
            </div>
          </div>
        </div>
      </header>

      {/* Advertencia de red incorrecta */}
      {isConnected && !isCorrectNetwork && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Estás conectado a una red incorrecta. Por favor cambia a Polygon Amoy o Hardhat.
                </p>
              </div>
            </div>
            <button
              onClick={handleSwitchNetwork}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium"
            >
              Cambiar Red
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Conecta tu wallet para comenzar
            </h2>
            <p className="text-gray-600 mb-8">
              Necesitas conectar tu wallet para explorar y crear NFTs
            </p>
            <ConnectButton />
          </div>
        ) : !isCorrectNetwork ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Red incorrecta
            </h2>
            <p className="text-gray-600 mb-8">
              Por favor cambia a Polygon Amoy o Hardhat para usar el marketplace
            </p>
          </div>
        ) : (
          <div>
            {/* Tabs de navegación */}
            <div className="mb-8">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'gallery'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Explorar NFTs
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Crear NFT
                </button>
              </nav>
            </div>

            {/* Contenido de los tabs */}
            {activeTab === 'gallery' ? (
              <NFTGallery />
            ) : (
              <CreateNFTForm onSuccess={() => setActiveTab('gallery')} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
