# Guía Completa de Deploy y Testing Local - Diplo Marketplace

## 🎯 Objetivo
Realizar el deploy completo del ecosistema Diplo Marketplace en una red local de Hardhat y probar todas las funcionalidades desde el frontend.

## 📋 Checklist de requisitos

### ✅ Verificar que tienes instalado:
- Node.js v16 o superior
- NPM
- Git
- Metamask instalado en el navegador

### ✅ Verificar estructura del proyecto:
```
bruno-marketplace/
├── contracts/           # Smart contracts
├── scripts/            # Scripts de deploy
├── frontend/          # Aplicación React
├── .env              # Variables de entorno
├── hardhat.config.js # Configuración de Hardhat
└── package.json      # Dependencias del proyecto
```

## 🚀 Paso 1: Configuración del entorno

### 1.1. Instalar dependencias del proyecto principal
```bash
cd bruno-marketplace
npm install
```

### 1.2. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```bash
# Variables existentes (mantener si ya existen)
PRIVATE_KEY=tu_private_key_para_testnet
PINATA_API_KEY=tu_pinata_api_key
PINATA_SECRET_KEY=tu_pinata_secret_key

# Variables adicionales para frontend
VITE_PINATA_API_KEY=tu_pinata_api_key
VITE_PINATA_SECRET_KEY=tu_pinata_secret_key
VITE_PINATA_JWT=tu_pinata_jwt_token
```

**⚠️ IMPORTANTE:** Para testing local, las variables de Pinata son necesarias solo para la funcionalidad de subir imágenes. Puedes usar estas de prueba temporalmente:
```bash
VITE_PINATA_API_KEY=test_key
VITE_PINATA_SECRET_KEY=test_secret
VITE_PINATA_JWT=test_jwt
```

### 1.3. Compilar contratos
```bash
npm run compile
```

**Salida esperada:**
```
Compiled 8 Solidity files successfully
```

## 🧪 Paso 2: Testing de contratos

### 2.1. Ejecutar tests unitarios
```bash
npm test
```

**Verificar que todos los tests pasen:**
- ✅ DiploToken tests
- ✅ Marketplace tests

### 2.2. Test específico del marketplace
```bash
npm run test:marketplace
```

## 🌐 Paso 3: Deploy en red local

### 3.1. Iniciar nodo local de Hardhat
```bash
npm run node
```

**Salida esperada:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**🔥 Dejar esta terminal corriendo durante todo el proceso**

### 3.2. Deploy completo del ecosistema
En una **nueva terminal**:

```bash
npm run deploy:complete
```

**Salida esperada:**
```
🚀 Deployando ecosistema completo...
📋 Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
💰 Balance: 10000.0

1️⃣ Deployando DiploToken...
✅ DiploToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

2️⃣ Deployando DiploNFT...
✅ DiploNFT deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

3️⃣ Deployando DiploMarketplace...
✅ DiploMarketplace deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

📋 RESUMEN DE DEPLOY:
═══════════════════════════════════════════
🪙 DiploToken: 0x5FbDB2315678afecb367f032d93F642f64180aa3
🖼️ DiploNFT: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
🏪 DiploMarketplace: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
═══════════════════════════════════════════
```

### 3.3. Actualizar direcciones en el frontend
Copiar las direcciones del deploy y actualizar el archivo:
`frontend/src/utils/contracts.js`

```javascript
export const CONTRACT_ADDRESSES = {
  hardhat: {
    DiploToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",      // ⬅️ Actualizar
    DiploNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",        // ⬅️ Actualizar  
    DiploMarketplace: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"  // ⬅️ Actualizar
  },
  polygonAmoy: {
    DiploToken: "",
    DiploNFT: "",
    DiploMarketplace: ""
  }
};
```

## 🦊 Paso 4: Configuración de Metamask

### 4.1. Agregar red local a Metamask
1. Abrir Metamask
2. Ir a **Configuración** → **Redes** → **Agregar red**
3. Configurar:
   - **Nombre:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Símbolo:** ETH

### 4.2. Importar cuenta de testing
1. En Metamask: **Importar cuenta**
2. Usar la private key de Account #0:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. Verificar balance: 10000 ETH

### 4.3. Mintear tokens DIP para testing
```bash
npx hardhat console --network localhost
```

En la consola de Hardhat:
```javascript
// Obtener contratos
const DiploToken = await ethers.getContractFactory("DiploToken");
const token = await DiploToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Obtener accounts
const [deployer, user1, user2] = await ethers.getSigners();

// Mintear tokens para testing (1000 DIP por cuenta)
await token.mint(deployer.address, ethers.parseEther("1000"));
await token.mint(user1.address, ethers.parseEther("1000"));
await token.mint(user2.address, ethers.parseEther("1000"));

// Verificar balances
console.log("Deployer balance:", ethers.formatEther(await token.balanceOf(deployer.address)));
console.log("User1 balance:", ethers.formatEther(await token.balanceOf(user1.address)));
console.log("User2 balance:", ethers.formatEther(await token.balanceOf(user2.address)));

// Salir de la consola
.exit
```

## 🎨 Paso 5: Configuración del Frontend

### 5.1. Instalar dependencias del frontend
```bash
cd frontend
npm install
```

### 5.2. Configurar variables de entorno del frontend
Crear archivo `frontend/.env`:

```bash
VITE_PINATA_API_KEY=tu_pinata_api_key
VITE_PINATA_SECRET_KEY=tu_pinata_secret_key
VITE_PINATA_JWT=tu_pinata_jwt_token
```

### 5.3. Iniciar aplicación frontend
```bash
npm run dev
```

**Salida esperada:**
```
  VITE v7.0.0  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🧪 Paso 6: Testing del flujo completo

### 6.1. Conectar wallet
1. Ir a `http://localhost:5173/`
2. Hacer clic en **Connect Wallet**
3. Seleccionar Metamask
4. Verificar que está conectado en la red Hardhat Local
5. Verificar que aparece el botón de desconexión

### 6.2. Verificar balance de tokens DIP
En la consola del navegador (F12), ejecutar:
```javascript
// Verificar que la conexión funciona
console.log("Wallet conectada:", window.ethereum.selectedAddress);
```

### 6.3. Crear y mintear un NFT

**⚠️ NOTA:** Para esta prueba, puedes usar cualquier imagen o crear un archivo de prueba simple.

1. **Seleccionar imagen:** Cualquier archivo .jpg, .png, .gif
2. **Completar formulario:**
   - **Nombre:** "Mi Primer NFT"
   - **Descripción:** "NFT de prueba para el marketplace"
   - **Precio:** 10 (DIP tokens)
3. **Hacer clic en "Crear NFT"**

**Flujo esperado:**
1. ⏳ "Subiendo a IPFS..." (puede fallar si no tienes credenciales válidas de Pinata)
2. ⏳ "Minteando..." (Metamask solicita confirmación)
3. ✅ Transacción confirmada
4. 🔄 El NFT aparece en la lista

### 6.4. Listar NFT en el marketplace
1. **Buscar tu NFT en la lista**
2. **Como propietario, verás:** "Listar en Marketplace"
3. **Ingresar precio:** 50 (DIP tokens)
4. **Hacer clic en "Listar NFT"**

**Flujo esperado:**
1. ⏳ "Aprobando..." (Metamask: Aprobar marketplace para transferir NFT)
2. ⏳ "Listando..." (Metamask: Confirmar listing)
3. ✅ NFT listado para venta

### 6.5. Comprar NFT (con otra cuenta)
1. **En Metamask:** Cambiar a User1 (importar con private key de Account #1)
2. **Refrescar la página**
3. **Conectar nueva wallet**
4. **Encontrar el NFT en venta**
5. **Hacer clic en "Comprar NFT"**

**Flujo esperado:**
1. ⏳ "Aprobando tokens..." (Metamask: Aprobar gasto de DIP tokens)
2. ⏳ "Comprando..." (Metamask: Confirmar compra)
3. ✅ NFT transferido al nuevo propietario

## ✅ Paso 7: Verificación final

### 7.1. Verificar transferencia de NFT
```bash
npx hardhat console --network localhost
```

```javascript
// Obtener contratos
const DiploNFT = await ethers.getContractFactory("DiploNFT");
const nft = await DiploNFT.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

// Verificar owner del NFT (debería ser User1)
const owner = await nft.ownerOf(0); // Token ID 0
console.log("NFT owner:", owner);

// Obtener accounts para comparar
const [deployer, user1] = await ethers.getSigners();
console.log("User1 address:", user1.address);
console.log("Is User1 the owner?", owner === user1.address);
```

### 7.2. Verificar balances de tokens
```javascript
// Obtener contrato DiploToken
const DiploToken = await ethers.getContractFactory("DiploToken");
const token = await DiploToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Verificar balances después de la transacción
const deployerBalance = await token.balanceOf(deployer.address);
const user1Balance = await token.balanceOf(user1.address);

console.log("Deployer balance:", ethers.formatEther(deployerBalance), "DIP");
console.log("User1 balance:", ethers.formatEther(user1Balance), "DIP");

.exit
```

### 7.3. Verificar eventos en el marketplace
```javascript
npx hardhat console --network localhost
```

```javascript
// Obtener contrato marketplace
const DiploMarketplace = await ethers.getContractFactory("DiploMarketplace");
const marketplace = await DiploMarketplace.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

// Obtener eventos de NFT listado
const listEvents = await marketplace.queryFilter("NFTListed");
console.log("NFTs listados:", listEvents.length);

// Obtener eventos de NFT comprado
const buyEvents = await marketplace.queryFilter("NFTPurchased");
console.log("NFTs comprados:", buyEvents.length);

// Mostrar detalles del último evento de compra
if (buyEvents.length > 0) {
    const lastBuy = buyEvents[buyEvents.length - 1];
    console.log("Última compra:", {
        buyer: lastBuy.args.buyer,
        nft: lastBuy.args.nft,
        tokenId: lastBuy.args.tokenId.toString(),
        price: ethers.formatEther(lastBuy.args.price)
    });
}

.exit
```

## 🎉 ¡Éxito! Funcionalidades verificadas

### ✅ Checklist de funcionalidades completadas:

- **🪙 Token ERC20 (DiploToken)**
  - ✅ Deploy exitoso
  - ✅ Mint para cuentas de testing
  - ✅ Transfer entre cuentas
  - ✅ Approve para marketplace

- **🖼️ NFT ERC721 (DiploNFT)**
  - ✅ Deploy exitoso
  - ✅ Mint con metadata IPFS
  - ✅ Transfer entre cuentas
  - ✅ Approve para marketplace

- **🏪 Marketplace**
  - ✅ Deploy exitoso
  - ✅ Listar NFT con precio en DIP
  - ✅ Comprar NFT con tokens DIP
  - ✅ Eventos de trazabilidad
  - ✅ Transfer automático de activos

- **🎨 Frontend Web3**
  - ✅ Conexión con RainbowKit
  - ✅ Hooks de Wagmi v2
  - ✅ Interfaz para mintear NFTs
  - ✅ Interfaz para listar NFTs
  - ✅ Interfaz para comprar NFTs
  - ✅ Integración con Pinata IPFS

## 🐛 Troubleshooting

### Error: "Contract not deployed"
- Verificar que el nodo de Hardhat esté corriendo
- Verificar que las direcciones en `contracts.js` coincidan con el deploy

### Error: "Insufficient funds"
- Verificar que la cuenta tenga ETH para gas
- Mintear más tokens DIP si es necesario

### Error: "Network mismatch"
- Verificar que Metamask esté en la red Hardhat Local (Chain ID: 31337)

### Error de Pinata
- Para testing local, puedes saltear la subida de imágenes
- O configurar credenciales válidas de Pinata

### Error: "Transaction reverted"
- Verificar approvals antes de transferencias
- Verificar que el NFT esté listado antes de comprar
- Verificar balances suficientes

## 📝 Próximos pasos

Una vez verificado el funcionamiento local:

1. **Configurar credenciales de Pinata reales**
2. **Preparar deploy en testnet Amoy** (Flujo 5)
3. **Agregar funcionalidades adicionales**:
   - Retiro de ganancias
   - Cancelar listings
   - Historial de transacciones
   - Filtros y búsqueda

---

**🏆 ¡Felicitaciones!** Has completado exitosamente el deploy y testing del Diplo Marketplace en tu entorno local.
