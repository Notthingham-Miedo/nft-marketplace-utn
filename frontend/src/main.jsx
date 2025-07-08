import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { createConfig, WagmiConfig } from "wagmi";
import { http } from "viem";
import {
  mainnet,
  polygon,
  hardhat,
  polygonAmoy,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const chains = [hardhat, polygonAmoy, polygon];

const { connectors } = getDefaultWallets({
  appName: "Diplo Marketplace",
  projectId: "YOUR_PROJECT_ID", // Obtener de WalletConnect
  chains,
});

const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [hardhat.id]: http(),
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>
);
