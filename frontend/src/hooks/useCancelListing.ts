import { useContractWrite } from 'wagmi';
import { CONTRACT_ADDRESSES } from '../config/wagmi';
import { marketplaceAbi } from '../constants/abis';
import { toast } from 'react-toastify';
import { useState } from 'react';

export const useCancelListing = () => {
  const [isCanceling, setIsCanceling] = useState(false);

  // Hook para cancelar listing
  const { writeAsync: cancelListingAsync } = useContractWrite({
    address: CONTRACT_ADDRESSES.MARKETPLACE,
    abi: marketplaceAbi,
    functionName: 'cancelListing',
  });

  const cancelListing = async (listingId: number) => {
    if (!listingId) {
      toast.error('ID de listing inválido');
      return;
    }

    setIsCanceling(true);

    try {
      toast.info('Cancelando venta...');

      await cancelListingAsync({
        args: [BigInt(listingId)],
      });

      toast.success('NFT retirado de venta exitosamente!');
      setIsCanceling(false);
      
    } catch (error) {
      console.error('Error canceling listing:', error);
      toast.error('Error al cancelar la venta');
      setIsCanceling(false);
      throw error;
    }
  };

  return {
    cancelListing,
    isPending: isCanceling,
  };
};
