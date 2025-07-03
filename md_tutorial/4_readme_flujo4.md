# Flujo 4: Frontend Web3 - Interfaz de Usuario

**Objetivo:** Crear la interfaz para interactuar con los contratos usando tecnologías modernas.

## Tecnologías utilizadas

- **React**: Framework para la interfaz de usuario
- **RainbowKit**: Biblioteca moderna para conexión de wallets (reemplaza Web3Modal)
- **Wagmi**: Hooks de React para Ethereum (reemplaza Ethers.js)
- **Pinata**: Servicio IPFS para almacenamiento descentralizado
- **TanStack Query**: Para manejo de estado y cache

## Estructura del proyecto frontend

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── WalletConnection.jsx
│   │   ├── NFTList.jsx
│   │   ├── NFTCard.jsx
│   │   ├── MintNFT.jsx
│   │   └── BuyNFT.jsx
│   ├── hooks/
│   │   ├── useContracts.js
│   │   └── usePinata.js
│   ├── utils/
│   │   ├── contracts.js
│   │   └── pinata.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## 1. Configuración inicial del proyecto

### package.json

```json
{
  "name": "diplo-marketplace-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@rainbow-me/rainbowkit": "^1.3.1",
    "@tanstack/react-query": "^4.32.6",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "viem": "^1.10.9",
    "wagmi": "^1.4.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "vite": "^4.4.5"
  }
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
})
```

### Variables de entorno (.env)

```bash
# Variables ya existentes
PRIVATE_KEY=tu_private_key
PINATA_API_KEY=tu_pinata_api_key
PINATA_SECRET_KEY=tu_pinata_secret_key

# Variables para frontend
VITE_PINATA_API_KEY=tu_pinata_api_key
VITE_PINATA_SECRET_KEY=tu_pinata_secret_key
VITE_PINATA_JWT=tu_pinata_jwt_token
```

## 2. Configuración de RainbowKit y Wagmi

### main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { createConfig, WagmiConfig } from 'wagmi';
import { http } from 'viem';
import {
  mainnet,
  polygon,
  hardhat,
  polygonAmoy,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const chains = [hardhat, polygonAmoy, polygon];

const { connectors } = getDefaultWallets({
  appName: 'Diplo Marketplace',
  projectId: 'YOUR_PROJECT_ID', // Obtener de WalletConnect
  chains
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
```

### App.jsx

```jsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import NFTList from './components/NFTList';
import MintNFT from './components/MintNFT';
import './App.css';

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
            <p>Necesitas conectar tu wallet para interactuar con el marketplace</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

### App.css

```css
.App {
  text-align: center;
  padding: 20px;
}

.App-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ccc;
  margin-bottom: 40px;
}

.App-main {
  max-width: 1200px;
  margin: 0 auto;
}

.connect-wallet {
  padding: 60px 20px;
}

.connect-wallet h2 {
  margin-bottom: 10px;
  color: #333;
}

.connect-wallet p {
  color: #666;
}
```

## 3. Configuración de contratos

### utils/contracts.js

```javascript
// Direcciones de los contratos (actualizar después del deploy)
export const CONTRACT_ADDRESSES = {
  hardhat: {
    DiploToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    DiploNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    DiploMarketplace: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  },
  polygonAmoy: {
    DiploToken: "", // Actualizar después del deploy en testnet
    DiploNFT: "",
    DiploMarketplace: ""
  }
};

// ABIs de los contratos (simplificados para el ejemplo)
export const DIPLO_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)"
];

export const DIPLO_NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function mint(address to, string memory uri) returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)"
];

export const DIPLO_MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price)",
  "function buyNFT(address nftContract, uint256 tokenId, address tokenAddress)",
  "function listings(address, uint256) view returns (address seller, uint256 price, bool active)",
  "function withdrawEarnings()",
  "function earnings(address) view returns (uint256)",
  "event NFTListed(address indexed seller, address indexed nft, uint256 indexed tokenId, uint256 price)",
  "event NFTPurchased(address indexed buyer, address indexed nft, uint256 indexed tokenId, uint256 price)"
];
```

### hooks/useContracts.js

```javascript
import { useContract, useNetwork } from 'wagmi';
import { CONTRACT_ADDRESSES, DIPLO_TOKEN_ABI, DIPLO_NFT_ABI, DIPLO_MARKETPLACE_ABI } from '../utils/contracts';

export function useContracts() {
  const { chain } = useNetwork();
  
  const networkName = chain?.id === 31337 ? 'hardhat' : 'polygonAmoy';
  const addresses = CONTRACT_ADDRESSES[networkName];

  const diploToken = useContract({
    address: addresses.DiploToken,
    abi: DIPLO_TOKEN_ABI,
  });

  const diploNFT = useContract({
    address: addresses.DiploNFT,
    abi: DIPLO_NFT_ABI,
  });

  const diploMarketplace = useContract({
    address: addresses.DiploMarketplace,
    abi: DIPLO_MARKETPLACE_ABI,
  });

  return {
    diploToken,
    diploNFT,
    diploMarketplace,
    addresses
  };
}
```

## 4. Integración con Pinata

### utils/pinata.js

```javascript
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export async function uploadImageToPinata(file) {
  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: `NFT-Image-${Date.now()}`,
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    const data = await response.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function uploadMetadataToPinata(metadata) {
  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `NFT-Metadata-${Date.now()}`,
        },
      }),
    });

    const data = await response.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
    };
  } catch (error) {
    console.error('Error uploading metadata to Pinata:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### hooks/usePinata.js

```javascript
import { useState } from 'react';
import { uploadImageToPinata, uploadMetadataToPinata } from '../utils/pinata';

export function usePinata() {
  const [uploading, setUploading] = useState(false);

  const uploadNFTToPinata = async (file, name, description, attributes = []) => {
    setUploading(true);
    
    try {
      // 1. Subir imagen
      const imageResult = await uploadImageToPinata(file);
      if (!imageResult.success) {
        throw new Error('Error uploading image: ' + imageResult.error);
      }

      // 2. Crear metadata
      const metadata = {
        name,
        description,
        image: imageResult.url,
        attributes
      };

      // 3. Subir metadata
      const metadataResult = await uploadMetadataToPinata(metadata);
      if (!metadataResult.success) {
        throw new Error('Error uploading metadata: ' + metadataResult.error);
      }

      return {
        success: true,
        imageUrl: imageResult.url,
        metadataUrl: metadataResult.url,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadNFTToPinata,
    uploading
  };
}
```

## 5. Componente para mintear NFTs

### components/MintNFT.jsx

```jsx
import { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { useContracts } from '../hooks/useContracts';
import { usePinata } from '../hooks/usePinata';

function MintNFT() {
  const { address } = useAccount();
  const { diploNFT } = useContracts();
  const { uploadNFTToPinata, uploading } = usePinata();

  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const { data: mintData, write: mintNFT } = useContractWrite({
    address: diploNFT.address,
    abi: diploNFT.abi,
    functionName: 'mint',
  });

  const { isLoading: isMinting } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    
    if (!file || !name || !description) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      // Subir a Pinata
      const result = await uploadNFTToPinata(file, name, description);
      
      if (!result.success) {
        alert('Error subiendo a IPFS: ' + result.error);
        return;
      }

      // Mintear NFT
      mintNFT({
        args: [address, result.metadataUrl]
      });

    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error creando NFT');
    }
  };

  return (
    <div className="mint-nft">
      <h2>Crear nuevo NFT</h2>
      <form onSubmit={handleMint} className="mint-form">
        <div className="form-group">
          <label>Imagen:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Precio (DIP tokens):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio para listar en el marketplace"
          />
        </div>
        
        <button
          type="submit"
          disabled={uploading || isMinting}
          className="mint-button"
        >
          {uploading ? 'Subiendo a IPFS...' : 
           isMinting ? 'Minteando...' : 
           'Crear NFT'}
        </button>
      </form>
    </div>
  );
}

export default MintNFT;
```

## 6. Componente para mostrar NFTs

### components/NFTList.jsx

```jsx
import { useState, useEffect } from 'react';
import { useContractRead } from 'wagmi';
import { useContracts } from '../hooks/useContracts';
import NFTCard from './NFTCard';

function NFTList() {
  const { diploNFT } = useContracts();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: totalSupply } = useContractRead({
    address: diploNFT.address,
    abi: diploNFT.abi,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    const loadNFTs = async () => {
      if (!totalSupply) return;

      setLoading(true);
      const nftList = [];

      try {
        for (let i = 0; i < Number(totalSupply); i++) {
          // Obtener token ID por índice
          const tokenId = await diploNFT.read.tokenByIndex([i]);
          
          // Obtener URI del token
          const tokenURI = await diploNFT.read.tokenURI([tokenId]);
          
          // Obtener owner
          const owner = await diploNFT.read.ownerOf([tokenId]);
          
          // Obtener metadata desde IPFS
          const response = await fetch(tokenURI);
          const metadata = await response.json();
          
          nftList.push({
            tokenId: Number(tokenId),
            owner,
            metadata,
            tokenURI
          });
        }
        
        setNfts(nftList);
      } catch (error) {
        console.error('Error loading NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [totalSupply, diploNFT]);

  if (loading) {
    return <div className="loading">Cargando NFTs...</div>;
  }

  return (
    <div className="nft-list">
      <h2>NFTs en el Marketplace</h2>
      {nfts.length === 0 ? (
        <p>No hay NFTs disponibles</p>
      ) : (
        <div className="nft-grid">
          {nfts.map((nft) => (
            <NFTCard key={nft.tokenId} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NFTList;
```

### components/NFTCard.jsx

```jsx
import { useState } from 'react';
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi';
import { useContracts } from '../hooks/useContracts';
import BuyNFT from './BuyNFT';

function NFTCard({ nft }) {
  const { address } = useAccount();
  const { diploMarketplace, diploNFT, addresses } = useContracts();
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState(false);

  const { data: listData, write: listNFT } = useContractWrite({
    address: diploMarketplace.address,
    abi: diploMarketplace.abi,
    functionName: 'listNFT',
  });

  const { data: approveData, write: approveNFT } = useContractWrite({
    address: diploNFT.address,
    abi: diploNFT.abi,
    functionName: 'approve',
  });

  const { isLoading: isListingTransaction } = useWaitForTransaction({
    hash: listData?.hash,
  });

  const { isLoading: isApprovingTransaction } = useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess: () => {
      // Después de la aprobación, listar el NFT
      listNFT({
        args: [addresses.DiploNFT, nft.tokenId, price]
      });
    }
  });

  const handleListNFT = async (e) => {
    e.preventDefault();
    
    if (!price) {
      alert('Por favor ingresa un precio');
      return;
    }

    try {
      setIsListing(true);
      
      // Primero aprobar el marketplace para transferir el NFT
      approveNFT({
        args: [addresses.DiploMarketplace, nft.tokenId]
      });
      
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert('Error listando NFT');
      setIsListing(false);
    }
  };

  const isOwner = address && nft.owner.toLowerCase() === address.toLowerCase();

  return (
    <div className="nft-card">
      <img 
        src={nft.metadata.image} 
        alt={nft.metadata.name}
        className="nft-image"
      />
      <div className="nft-info">
        <h3>{nft.metadata.name}</h3>
        <p>{nft.metadata.description}</p>
        <p className="nft-owner">
          Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
        </p>
        
        {isOwner ? (
          <div className="owner-actions">
            <h4>Listar en Marketplace</h4>
            <form onSubmit={handleListNFT} className="list-form">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio en DIP tokens"
                required
              />
              <button
                type="submit"
                disabled={isApprovingTransaction || isListingTransaction || isListing}
                className="list-button"
              >
                {isApprovingTransaction ? 'Aprobando...' :
                 isListingTransaction ? 'Listando...' :
                 'Listar NFT'}
              </button>
            </form>
          </div>
        ) : (
          <BuyNFT nft={nft} />
        )}
      </div>
    </div>
  );
}

export default NFTCard;
```

## 7. Componente para comprar NFTs

### components/BuyNFT.jsx

```jsx
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';
import { useContracts } from '../hooks/useContracts';

function BuyNFT({ nft }) {
  const { address } = useAccount();
  const { diploMarketplace, diploToken, addresses } = useContracts();
  const [listing, setListing] = useState(null);
  const [userBalance, setUserBalance] = useState('0');

  // Leer información del listing
  const { data: listingData } = useContractRead({
    address: diploMarketplace.address,
    abi: diploMarketplace.abi,
    functionName: 'listings',
    args: [addresses.DiploNFT, nft.tokenId],
  });

  // Leer balance del usuario
  const { data: balance } = useContractRead({
    address: diploToken.address,
    abi: diploToken.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  // Aprobar tokens
  const { data: approveData, write: approveTokens } = useContractWrite({
    address: diploToken.address,
    abi: diploToken.abi,
    functionName: 'approve',
  });

  // Comprar NFT
  const { data: buyData, write: buyNFT } = useContractWrite({
    address: diploMarketplace.address,
    abi: diploMarketplace.abi,
    functionName: 'buyNFT',
  });

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess: () => {
      // Después de la aprobación, comprar el NFT
      buyNFT({
        args: [addresses.DiploNFT, nft.tokenId, addresses.DiploToken]
      });
    }
  });

  const { isLoading: isBuying } = useWaitForTransaction({
    hash: buyData?.hash,
  });

  useEffect(() => {
    if (listingData) {
      const [seller, price, active] = listingData;
      setListing({
        seller,
        price: Number(price),
        active
      });
    }
  }, [listingData]);

  useEffect(() => {
    if (balance) {
      setUserBalance(Number(balance));
    }
  }, [balance]);

  const handleBuyNFT = async () => {
    if (!listing || !listing.active) {
      alert('Este NFT no está en venta');
      return;
    }

    if (userBalance < listing.price) {
      alert('No tienes suficientes DIP tokens');
      return;
    }

    try {
      // Primero aprobar los tokens
      approveTokens({
        args: [addresses.DiploMarketplace, listing.price]
      });
    } catch (error) {
      console.error('Error buying NFT:', error);
      alert('Error comprando NFT');
    }
  };

  if (!listing || !listing.active) {
    return (
      <div className="buy-section">
        <p>Este NFT no está en venta</p>
      </div>
    );
  }

  const hasEnoughTokens = userBalance >= listing.price;

  return (
    <div className="buy-section">
      <div className="price-info">
        <h4>Precio: {listing.price} DIP</h4>
        <p>Tu balance: {userBalance} DIP</p>
      </div>
      
      {!hasEnoughTokens && (
        <p className="insufficient-balance">
          No tienes suficientes tokens
        </p>
      )}
      
      <button
        onClick={handleBuyNFT}
        disabled={!hasEnoughTokens || isApproving || isBuying}
        className={`buy-button ${!hasEnoughTokens ? 'disabled' : ''}`}
      >
        {isApproving ? 'Aprobando tokens...' :
         isBuying ? 'Comprando...' :
         'Comprar NFT'}
      </button>
    </div>
  );
}

export default BuyNFT;
```

## 8. Estilos CSS básicos

### index.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

/* Formularios */
.mint-nft, .nft-list {
  background: white;
  padding: 30px;
  margin: 20px 0;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.mint-form, .list-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e1e1;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Botones */
.mint-button, .list-button, .buy-button {
  width: 100%;
  padding: 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.mint-button:hover, .list-button:hover, .buy-button:hover {
  background: #0056b3;
}

.mint-button:disabled, .list-button:disabled, .buy-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.buy-button.disabled {
  background: #dc3545;
}

/* Grid de NFTs */
.nft-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.nft-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.nft-card:hover {
  transform: translateY(-5px);
}

.nft-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.nft-info {
  padding: 20px;
}

.nft-info h3 {
  margin-bottom: 10px;
  color: #333;
}

.nft-info p {
  color: #666;
  margin-bottom: 10px;
}

.nft-owner {
  font-size: 12px;
  color: #999;
  margin-bottom: 15px;
}

/* Secciones específicas */
.owner-actions {
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 15px;
}

.owner-actions h4 {
  margin-bottom: 10px;
  color: #555;
}

.buy-section {
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 15px;
}

.price-info h4 {
  color: #007bff;
  margin-bottom: 8px;
}

.price-info p {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
}

.insufficient-balance {
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 10px;
}

/* Estados de carga */
.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

/* Responsive */
@media (max-width: 768px) {
  .App-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .nft-grid {
    grid-template-columns: 1fr;
  }
  
  .mint-nft, .nft-list {
    padding: 20px;
    margin: 15px 0;
  }
}
```

## 9. Actividad de cierre: Flujo completo

### Pasos para probar el marketplace completo:

1. **Configurar el entorno:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Conectar wallet:**
   - Abrir la aplicación en el navegador
   - Conectar Metamask con la red local de Hardhat
   - Verificar que tienes DIP tokens de prueba

3. **Crear un NFT:**
   - Seleccionar una imagen
   - Completar nombre y descripción
   - Establecer un precio para el marketplace
   - Confirmar transacción de mint

4. **Listar NFT para venta:**
   - Una vez minteado, el NFT aparecerá en la lista
   - Como propietario, podrás establecer un precio
   - Aprobar el marketplace para transferir el NFT
   - Confirmar el listing

5. **Comprar NFT (con otra cuenta):**
   - Cambiar a otra cuenta en Metamask
   - Asegurar que tiene suficientes DIP tokens
   - Aprobar el gasto de tokens
   - Ejecutar la compra

### Validaciones importantes:

- ✅ Conexión exitosa de wallet
- ✅ Subida correcta a Pinata IPFS
- ✅ Mint de NFT con metadata
- ✅ Listing en marketplace
- ✅ Aprobación de tokens ERC20
- ✅ Transferencia exitosa de NFT
- ✅ Actualización de balances

### Posibles errores y soluciones:

1. **Error de red:** Verificar que Metamask esté en la red correcta
2. **Falta de tokens:** Mintear DIP tokens adicionales para pruebas
3. **Error de IPFS:** Verificar las credenciales de Pinata
4. **Transacción fallida:** Verificar que hay suficiente ETH para gas

### Próximos pasos:

Una vez completado este flujo, el marketplace estará listo para el **Flujo 5: Despliegue en Testnet Amoy**.

---

**Nota:** Este frontend es una implementación básica pero funcional. Para producción se recomienda agregar:
- Manejo de errores más robusto
- Loading states mejorados
- Validaciones adicionales
- Tests unitarios
- Optimizaciones de rendimiento
