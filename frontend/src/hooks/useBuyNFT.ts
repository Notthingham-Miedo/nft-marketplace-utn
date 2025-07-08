import { useContractWrite, useContractRead, useAccount } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { erc20Abi, marketplaceAbi } from '../constants/abis';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const useBuyNFT = () => {
  const { address } = useAccount();
  const [isApproving, setIsApproving] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  // Obtener balance del usuario
  const { data: balance } = useContractRead({
    address: CONTRACT_ADDRESSES.TOKEN,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    enabled: !!address,
    watch: true,
  });

  // Obtener allowance
  const { data: allowance } = useContractRead({
    address: CONTRACT_ADDRESSES.TOKEN,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESSES.MARKETPLACE] : undefined,
    enabled: !!address,
    watch: true,
  });

  // Hook para aprobar tokens
  const { writeAsync: approveAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.TOKEN,
    abi: erc20Abi,
    functionName: 'approve',
  });

  // Hook para comprar NFT
  const { writeAsync: buyAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: marketplaceAbi,
    functionName: 'buyNFT',
  });

  const buyNFT = async (listingId: number, price: bigint) => {
    if (!address) {
      toast.error('Conecta tu wallet primero');
      return;
    }

    try {
      // 1. Verificar balance suficiente
      if (!balance || balance < price) {
        toast.error('Balance insuficiente de tokens DIP');
        return;
      }

      // 2. Aprobar tokens si es necesario
      if (!allowance || allowance < price) {
        setIsApproving(true);
        toast.info('Aprobando tokens DIP...');
        
        await approveAsync({
          args: [CONTRACT_ADDRESSES.MARKETPLACE, price],
        });
        
        toast.success('Tokens aprobados!');
        setIsApproving(false);
      }

      // 3. Ejecutar compra
      setIsBuying(true);
      toast.info('Comprando NFT...');

      await buyAsync({
        args: [BigInt(listingId)],
      });

      toast.success('¡NFT comprado exitosamente!');
      setIsBuying(false);
      
    } catch (error) {
      console.error('Error buying NFT:', error);
      toast.error('Error al comprar el NFT');
      setIsApproving(false);
      setIsBuying(false);
      throw error;
    }
  };

  return {
    buyNFT,
    isPending: isApproving || isBuying,
    balance,
    allowance,
  };
};
