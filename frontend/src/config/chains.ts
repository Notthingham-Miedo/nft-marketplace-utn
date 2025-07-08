import { Chain } from 'wagmi';

// Configuración personalizada de hardhat sin ENS
export const hardhatLocal: Chain = {
  id: 31337,
  name: 'Hardhat Local',
  network: 'hardhat',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Hardhat', url: 'http://127.0.0.1:8545' },
  },
  // Específicamente NO incluir contratos ENS para evitar errores
  contracts: {
    // Excluir explícitamente contratos ENS
    // ensRegistry: undefined,
    // ensUniversalResolver: undefined,
    // multicall3: undefined,
  },
  testnet: true,
};
