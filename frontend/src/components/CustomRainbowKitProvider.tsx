import React, { ReactNode } from 'react';
import { RainbowKitProvider, Theme } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi';

interface CustomRainbowKitProviderProps {
  children: ReactNode;
  chains: Chain[];
  theme?: Theme;
}

export const CustomRainbowKitProvider: React.FC<CustomRainbowKitProviderProps> = ({
  children,
  chains,
  theme,
}) => {
  return (
    <RainbowKitProvider
      chains={chains}
      theme={theme}
      showRecentTransactions={true}
      modalSize="compact"
      // Configuración adicional para evitar errores de ENS
      appInfo={{
        appName: 'NFT Marketplace',
        learnMoreUrl: 'https://rainbowkit.com',
      }}
    >
      {children}
    </RainbowKitProvider>
  );
};
