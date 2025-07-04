// Importar ABIs reales de los contratos compilados
import DiploTokenABI from '../abis/DiploToken.json';
import DiploNFTABI from '../abis/DiploNFT.json';
import DiploMarketplaceABI from '../abis/DiploMarketplace.json';

// Direcciones de los contratos (actualizar después del deploy)
export const CONTRACT_ADDRESSES = {
  hardhat: {
    DiploToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    DiploNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    DiploMarketplace: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  polygonAmoy: {
    DiploToken: "", // Actualizar después del deploy en testnet
    DiploNFT: "",
    DiploMarketplace: "",
  },
};

// Exportar ABIs completos
export const DIPLO_TOKEN_ABI = DiploTokenABI.abi;
export const DIPLO_NFT_ABI = DiploNFTABI.abi;
export const DIPLO_MARKETPLACE_ABI = DiploMarketplaceABI.abi;
