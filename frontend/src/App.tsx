import React from 'react';
import { WagmiConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { config, chains } from './config/wagmi';
import { CustomRainbowKitProvider } from './components/CustomRainbowKitProvider';
import { Marketplace } from './components/Marketplace';

// Importar silenciador de errores ENS
import './utils/silenceENSErrors';

import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

// Configuración del QueryClient para manejar errores de ENS
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // No reintentar errores de ENS
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('ENS') || errorMessage.includes('reverse')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <CustomRainbowKitProvider chains={chains}>
          <div className="App">
            <Marketplace />
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </CustomRainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;
