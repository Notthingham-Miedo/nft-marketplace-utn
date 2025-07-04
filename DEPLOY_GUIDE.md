# 🚀 Guía Completa: Deploy de Contratos en Hardhat

Esta guía te llevará paso a paso para deploar los contratos del NFT Marketplace en Hardhat.

## 📋 Prerequisitos

1. **Node.js 16+** instalado
2. **Git** instalado
3. **Metamask** configurado

## 🛠️ Paso 1: Preparar el entorno

### 1.1 Navegar al directorio del proyecto
```bash
cd c:\Users\Compu\Documents\GitHub\nft-marketplace-utn
```

### 1.2 Instalar dependencias (si no están instaladas)
```bash
npm install
```

### 1.3 Verificar que Hardhat funciona
```bash
npx hardhat --version
```

## 🌐 Paso 2: Iniciar la red local de Hardhat

Abre una **nueva terminal** y mantén este comando ejecutándose:

```bash
npx hardhat node
```

**¡IMPORTANTE!** Deja esta terminal abierta durante todo el proceso. Verás algo así:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
...
```

## 🚀 Paso 3: Deploy de contratos

### 3.1 En una nueva terminal, ejecuta el deploy
```bash
npx hardhat run scripts/deploy-complete.js --network localhost
```

Verás una salida similar a:
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

📄 Direcciones guardadas en contract-addresses.json
🎉 Deploy completo exitoso!
```

### 3.2 Verificar que se creó el archivo de direcciones
```bash
cat contract-addresses.json
```

O en Windows:
```batch
type contract-addresses.json
```

## 🦊 Paso 4: Configurar Metamask

### 4.1 Agregar red Hardhat a Metamask

1. **Abrir Metamask**
2. **Hacer clic en el selector de red** (arriba a la izquierda)
3. **"Agregar red"** → **"Agregar una red manualmente"**
4. **Completar los datos:**
   - **Nombre de red:** `Hardhat Local`
   - **Nueva URL de RPC:** `http://127.0.0.1:8545`
   - **ID de cadena:** `31337`
   - **Símbolo de moneda:** `ETH`
   - **URL del explorador de bloques:** (dejar vacío)

### 4.2 Importar cuenta de prueba

1. **En Metamask, hacer clic en el icono de perfil**
2. **"Importar cuenta"**
3. **Copiar la Private Key del Account #0** de la terminal de Hardhat:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. **Pegar la clave y confirmar**

Ahora deberías ver **10,000 ETH** en tu wallet!

## 📱 Paso 5: Configurar el Frontend

### 5.1 Navegar al frontend
```bash
cd frontend
```

### 5.2 Copiar las direcciones de contratos

Desde el archivo `contract-addresses.json` que se generó, copia las direcciones a tu archivo `.env`:

```bash
# En frontend/.env
REACT_APP_NFT_CONTRACT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
REACT_APP_TOKEN_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

### 5.3 Instalar y ejecutar frontend
```bash
npm install
npm start
```

## 🧪 Paso 6: Testear el sistema

### 6.1 Obtener tokens DIP para testing

Abre una consola de Hardhat:
```bash
npx hardhat console --network localhost
```

En la consola, ejecuta:
```javascript
// Conectar al contrato de token
const DiploToken = await ethers.getContractFactory("DiploToken");
const token = await DiploToken.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Mintear tokens a tu dirección (reemplaza con tu dirección de Metamask)
await token.mint("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", ethers.parseEther("1000"));

// Verificar balance
const balance = await token.balanceOf("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
console.log("Balance DIP:", ethers.formatEther(balance));
```

### 6.2 Probar en el frontend

1. **Abrir** `http://localhost:3000`
2. **Conectar Metamask** (asegúrate de estar en la red Hardhat)
3. **Crear un NFT** en la tab "Crear NFT"
4. **Comprar NFTs** con tus tokens DIP

## 🔄 Comandos Útiles

### Reiniciar todo el sistema:
```bash
# Terminal 1: Reiniciar Hardhat
Ctrl+C  # Detener hardhat node
npx hardhat node  # Reiniciar

# Terminal 2: Re-deploy contratos
npx hardhat run scripts/deploy-complete.js --network localhost

# Terminal 3: Reiniciar frontend
cd frontend
npm start
```

### Ver logs de transacciones:
La terminal con `npx hardhat node` mostrará todas las transacciones en tiempo real.

### Limpiar cache de Hardhat:
```bash
npx hardhat clean
```

## 🚨 Solución de Problemas Comunes

### Error: "Error HH8: Error while reading from the socket"
- **Solución:** Reinicia el nodo de Hardhat

### Error: "Network localhost not defined"
- **Solución:** Verifica que estés en el directorio correcto y que `hardhat.config.js` exista

### Error: "Transaction reverted"
- **Solución:** Revisa que tengas suficiente ETH para gas y que los contratos estén desplegados

### Error: "ContractFunctionExecutionError: reverse" (ENS)
- **Problema:** RainbowKit intenta resolver nombres ENS que no existen en Hardhat
- **Solución:** Los errores están silenciados automáticamente en el frontend, no afectan la funcionalidad

### Metamask no se conecta
- **Solución:** 
  1. Cambiar a otra red y volver a Hardhat
  2. Resetear cuenta en Configuración → Avanzado → Resetear cuenta

### Frontend no encuentra contratos
- **Solución:** Verifica que las direcciones en `.env` coincidan con las de `contract-addresses.json`

## 🎉 ¡Listo!

Ahora tienes un marketplace NFT completamente funcional ejecutándose localmente. Puedes:

- ✅ Crear NFTs
- ✅ Subirlos a IPFS (Pinata)
- ✅ Listarlos para venta
- ✅ Comprarlos con tokens DIP
- ✅ Ver la galería completa

¡A disfrutar creando y comercializando NFTs! 🚀
