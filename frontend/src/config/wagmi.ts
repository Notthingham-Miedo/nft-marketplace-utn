import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { hardhatLocal } from './chains';

// Configuración de chains sin ENS para desarrollo
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hardhatLocal, polygonMumbai, polygon, mainnet],
  [publicProvider()],
  {
    // Deshabilitar ENS para evitar errores en desarrollo
    pollingInterval: 4000,
  }
);

const { wallets } = getDefaultWallets({
  appName: 'NFT Marketplace',
  projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || 'default-project-id',
  chains,
});

const connectors = connectorsForWallets(wallets);

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { chains };

// Direcciones de contratos - con fallback hardcodeado
const FALLBACK_ADDRESSES = {
  NFT: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512' as `0x${string}`,
  TOKEN: '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`,
  MARKETPLACE: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as `0x${string}`,
};

export const CONTRACT_ADDRESSES = {
  NFT: (process.env.REACT_APP_NFT_CONTRACT_ADDRESS || FALLBACK_ADDRESSES.NFT) as `0x${string}`,
  TOKEN: (process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS || FALLBACK_ADDRESSES.TOKEN) as `0x${string}`,
  MARKETPLACE: (process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS || FALLBACK_ADDRESSES.MARKETPLACE) as `0x${string}`,
};

console.log('Contract addresses loaded:', CONTRACT_ADDRESSES);
console.log('Environment variables:', {
  NFT: process.env.REACT_APP_NFT_CONTRACT_ADDRESS,
  TOKEN: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS,
  MARKETPLACE: process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS,
});

// Chain IDs
export const SUPPORTED_CHAINS = {
  HARDHAT: 31337,
  POLYGON_MUMBAI: 80001,
  POLYGON: 137,
  MAINNET: 1,
};
