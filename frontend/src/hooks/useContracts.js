import { useChainId } from "wagmi";
import {
  CONTRACT_ADDRESSES,
  DIPLO_TOKEN_ABI,
  DIPLO_NFT_ABI,
  DIPLO_MARKETPLACE_ABI,
} from "../utils/contracts";

export function useContracts() {
  const chainId = useChainId();

  const networkName = chainId === 31337 ? "hardhat" : "polygonAmoy";
  const addresses = CONTRACT_ADDRESSES[networkName];

  const diploToken = {
    address: addresses.DiploToken,
    abi: DIPLO_TOKEN_ABI,
  };

  const diploNFT = {
    address: addresses.DiploNFT,
    abi: DIPLO_NFT_ABI,
  };

  const diploMarketplace = {
    address: addresses.DiploMarketplace,
    abi: DIPLO_MARKETPLACE_ABI,
  };

  return {
    diploToken,
    diploNFT,
    diploMarketplace,
    addresses,
  };
}
