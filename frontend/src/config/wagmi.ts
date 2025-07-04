import { getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, polygonMumbai, hardhat } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [hardhat, polygonMumbai, polygon, mainnet],
  [publicProvider()]
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

// Direcciones de contratos
export const CONTRACT_ADDRESSES = {
  NFT: process.env.REACT_APP_NFT_CONTRACT_ADDRESS as `0x${string}`,
  TOKEN: process.env.REACT_APP_TOKEN_CONTRACT_ADDRESS as `0x${string}`,
  MARKETPLACE: process.env.REACT_APP_MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
};

// Chain IDs
export const SUPPORTED_CHAINS = {
  HARDHAT: 31337,
  POLYGON_MUMBAI: 80001,
  POLYGON: 137,
  MAINNET: 1,
};
