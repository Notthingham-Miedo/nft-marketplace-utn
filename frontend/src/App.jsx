import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import NFTList from "./components/NFTList";
import MintNFT from "./components/MintNFT";
import DebugPanel from "./components/DebugPanel";
import "./App.css";

function App() {
  const { isConnected } = useAccount();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Diplo Marketplace</h1>
        <ConnectButton />
      </header>

      <main className="App-main">
        {isConnected ? (
          <div>
            <MintNFT />
            <NFTList />
          </div>
        ) : (
          <div className="connect-wallet">
            <h2>Conecta tu wallet para comenzar</h2>
            <p>
              Necesitas conectar tu wallet para interactuar con el marketplace
            </p>
          </div>
        )}
      </main>

      <DebugPanel />
    </div>
  );
}

export default App;
