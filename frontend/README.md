# NFT Marketplace Frontend

Frontend moderno para el marketplace NFT construido con React, TypeScript, RainbowKit, Wagmi y Pinata.

## 🚀 Tecnologías

- **React 18** con TypeScript
- **RainbowKit** - Conexión de wallets moderna
- **Wagmi + Viem** - Hooks React para Web3
- **TailwindCSS** - Styling utilitario
- **Pinata** - Almacenamiento IPFS
- **React Toastify** - Notificaciones

## 📦 Instalación

1. Instalar dependencias:
```bash
cd frontend
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Edita `.env` con tus claves:
```
REACT_APP_PINATA_API_KEY=tu_api_key_de_pinata
REACT_APP_PINATA_SECRET_KEY=tu_secret_key_de_pinata
REACT_APP_WALLET_CONNECT_PROJECT_ID=tu_project_id_de_walletconnect

# Estas se llenan después del deploy de contratos
REACT_APP_NFT_CONTRACT_ADDRESS=
REACT_APP_TOKEN_CONTRACT_ADDRESS=
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=
```

## 🔧 Configuración

### 1. Obtener claves de Pinata

1. Ve a [Pinata](https://pinata.cloud/)
2. Crea una cuenta gratuita
3. Ve a API Keys y genera nuevas claves
4. Copia API Key y Secret Key a tu `.env`

### 2. Configurar WalletConnect

1. Ve a [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Crea un proyecto
3. Copia el Project ID a tu `.env`

### 3. Actualizar direcciones de contratos

Después de deploar los contratos con Hardhat, actualiza las direcciones en `.env`:

```bash
# Ejemplo con direcciones locales de Hardhat
REACT_APP_NFT_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_TOKEN_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

## 🏃‍♂️ Ejecutar

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## 🌐 Uso

### Conectar Wallet
1. Haz clic en "Connect Wallet"
2. Selecciona tu wallet preferida (Metamask, WalletConnect, etc.)
3. Asegúrate de estar en la red correcta (Hardhat local o Polygon Amoy)

### Crear NFT
1. Ve a la tab "Crear NFT"
2. Sube una imagen (PNG, JPG, GIF)
3. Completa nombre, descripción y precio en tokens DIP
4. Opcionalmente agrega atributos
5. Haz clic en "Crear NFT"

### Comprar NFT
1. En la galería, encuentra un NFT listado para venta
2. Asegúrate de tener suficientes tokens DIP
3. Haz clic en "Comprar"
4. Confirma las transacciones (approve + buy)

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Marketplace.tsx  # Componente principal
│   ├── NFTCard.tsx     # Tarjeta individual de NFT
│   ├── NFTGallery.tsx  # Galería de NFTs
│   └── CreateNFTForm.tsx # Formulario de creación
├── hooks/              # Custom hooks
│   ├── useNFTList.ts   # Hook para listar NFTs
│   ├── useCreateNFT.ts # Hook para crear NFTs
│   └── useBuyNFT.ts    # Hook para comprar NFTs
├── services/           # Servicios externos
│   └── pinata.ts       # Integración con Pinata IPFS
├── config/             # Configuración
│   └── wagmi.ts        # Configuración de Wagmi/RainbowKit
├── constants/          # Constantes
│   └── abis.ts         # ABIs de los contratos
└── App.tsx             # Componente raíz
```

## 🔄 Flujo de trabajo

### 1. Desarrollo local
- Ejecuta Hardhat network: `npx hardhat node`
- Deploya contratos: `npx hardhat run scripts/deploy-complete.js --network localhost`
- Actualiza direcciones en `.env`
- Inicia el frontend: `npm start`

### 2. Testing en Amoy
- Configura testnet Amoy en Metamask
- Deploya en Amoy: `npx hardhat run scripts/deploy-complete.js --network amoy`
- Actualiza direcciones para Amoy
- Cambia red en la app

## 🐛 Solución de problemas

### Error: "Red incorrecta"
- Asegúrate de estar conectado a Hardhat (31337) o Polygon Amoy (80002)
- Usa el botón "Cambiar Red" en la aplicación

### Error: "Balance insuficiente"
- Necesitas tokens DIP para comprar NFTs
- En desarrollo, mintea tokens desde la consola de Hardhat

### Error: "Failed to upload to IPFS"
- Verifica tus claves de Pinata en `.env`
- Asegúrate de que el archivo no exceda los límites de Pinata

### Imágenes no cargan
- Verifica que las URLs de IPFS sean accesibles
- Pinata gateway puede tardar unos minutos en propagar

## 🔒 Seguridad

- Nunca compartas tus claves privadas
- Usa cuentas de prueba en testnet
- Las claves de Pinata son para desarrollo - no las uses en producción
- Siempre verifica las transacciones antes de firmar

## 📚 Recursos adicionales

- [Documentación de RainbowKit](https://rainbowkit.com/)
- [Documentación de Wagmi](https://wagmi.sh/)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
