# Flujo 3: Smart Contract del Marketplace

## Objetivo
Crear la lógica de compra/venta que conecte los contratos ERC20 y ERC721 para permitir transacciones de NFTs usando tokens personalizados.

## Paso 1: Análisis de Arquitectura

### Componentes necesarios:
- **Contrato DiploToken (ERC20)**: ✅ Ya implementado - Token para pagos
- **Contrato DiploNFT (ERC721)**: ✅ Ya implementado - NFTs a comercializar  
- **Contrato Marketplace**: ⚠️ A implementar - Lógica de compra/venta

### Flujo de funcionamiento:
1. **Publicar NFT**: Usuario lista su NFT con precio en DIP tokens
2. **Aprobar transferencia**: Marketplace obtiene permiso para mover NFT
3. **Comprar NFT**: Comprador paga con DIP tokens y recibe NFT
4. **Transferencias automáticas**: Smart contract gestiona intercambio

## Paso 2: Implementación del Contrato Marketplace

### Crear el archivo `contracts/DiploMarketplace.sol`

#### Estructura del contrato:
- **Imports necesarios**: IERC721, IERC20, Ownable, ReentrancyGuard
- **Struct Listing**: Datos del NFT en venta (seller, nftContract, tokenId, price, active)
- **Variables de estado**: diploToken, listings mapping, earnings mapping, nextListingId
- **Eventos**: NFTListed, NFTPurchased, ListingCancelled, EarningsWithdrawn

#### Funciones principales a implementar:

**Constructor:**
- Recibir dirección del DiploToken
- Establecer initialOwner
- Inicializar nextListingId en 1

**listNFT():**
- Validar precio > 0
- Verificar propiedad del NFT
- Verificar aprobación del marketplace
- Crear nuevo listing
- Emitir evento NFTListed

**buyNFT():**
- Validar listing activo
- Verificar no sea el propio vendedor
- Verificar balance y allowance de DIP
- Transferir tokens DIP
- Transferir NFT
- Marcar listing como inactivo
- Emitir evento NFTPurchased

**cancelListing():**
- Validar listing activo
- Verificar propiedad del listing
- Marcar como inactivo
- Emitir evento

**getListing() y getActiveListings():**
- Funciones de consulta para el frontend

## Paso 3: Validaciones y Seguridad

### Validaciones implementadas:
- ✅ **Precio válido**: `require(price > 0)`
- ✅ **Propiedad del NFT**: `require(ownerOf == msg.sender)`
- ✅ **Permisos explícitos**: Verificar `approve` o `setApprovalForAll`
- ✅ **Balance suficiente**: Verificar tokens DIP disponibles
- ✅ **Allowance correcto**: Verificar autorización de gasto
- ✅ **Prevención de reentrancia**: `nonReentrant` modifier

### Seguridad adicional:
- ✅ **Ownable**: Control de acceso administrativo
- ✅ **ReentrancyGuard**: Prevención de ataques de reentrancia
- ✅ **Eventos completos**: Trazabilidad total de transacciones
- ✅ **Validaciones exhaustivas**: Verificaciones antes de ejecutar

## Paso 4: Scripts de Deploy

### Crear `scripts/deploy-marketplace.js`

**Funcionalidad:**
- Verificar que DiploToken ya esté deployado
- Obtener dirección del deployer
- Deploy del DiploMarketplace con dirección del token
- Actualizar `contract-addresses.json` con nueva dirección
- Verificar configuración del marketplace

### Crear `scripts/deploy-complete.js`

**Funcionalidad:**
- Deploy completo del ecosistema en orden correcto
- Guardar todas las direcciones en archivo JSON
- Verificar configuración de todos los contratos
- Mostrar información de deploy para debugging

### Estructura del archivo de direcciones:
```json
{
  "DiploToken": "0x...",
  "DiploNFT": "0x...",
  "DiploMarketplace": "0x...",
  "network": "localhost",
  "deployer": "0x...",
  "deployedAt": "2025-07-03T..."
}
```

## Paso 5: Tests del Marketplace

### Crear `test/Marketplace.test.js`

#### Estructura de tests:
- **Setup**: Deploy de contratos, mint inicial de tokens y NFTs
- **Listing Tests**: Verificar listado de NFTs, validaciones de permisos
- **Buying Tests**: Verificar compra exitosa, validaciones de balance y allowance
- **Events Tests**: Verificar emisión correcta de eventos
- **Edge Cases**: Casos límite y validaciones de seguridad

#### Casos de prueba importantes:
- ✅ Listar NFT con precio válido
- ✅ Fallar si no es owner del NFT
- ✅ Fallar si no tiene aprobación
- ✅ Comprar NFT exitosamente
- ✅ Fallar sin balance suficiente
- ✅ Fallar sin allowance
- ✅ Cancelar listing correctamente
- ✅ Emisión de eventos correcta

## Paso 6: Actualizar Scripts de Package.json

### Agregar nuevos scripts para marketplace:

```json
"scripts": {
  "test:marketplace": "npx hardhat test test/Marketplace.test.js",
  "deploy:marketplace": "npx hardhat run scripts/deploy-marketplace.js --network localhost",
  "deploy:complete": "npx hardhat run scripts/deploy-complete.js --network localhost"
}
```

## Paso 7: Comandos de Ejecución

### Desarrollo paso a paso:

**1. Compilar contratos:**
```bash
npm run compile
```

**2. Ejecutar tests específicos:**
```bash
npm run test:marketplace
```

**3. Iniciar red local:**
```bash
npm run node
```

**4. Deploy completo:**
```bash
npm run deploy:complete
```

**5. Verificar en consola:**
```bash
npm run console
```

## Actividad de Cierre: Deploy y Testeo Local

### 1. **Compilar todos los contratos**:
```bash
npm run compile
```

### 2. **Ejecutar tests del marketplace**:
```bash
npm run test:marketplace
```

### 3. **Iniciar red local de Hardhat**:
```bash
npm run node
```

### 4. **Deploy del ecosistema completo**:
```bash
npm run deploy:complete
```

### 5. **Verificar en consola interactiva**:
```bash
npm run console
```

### Comandos de verificación en consola:

**Cargar contratos deployados:**
```javascript
const addresses = require('./contract-addresses.json');
const DiploToken = await ethers.getContractFactory("DiploToken");
const DiploNFT = await ethers.getContractFactory("DiploNFT");
const DiploMarketplace = await ethers.getContractFactory("DiploMarketplace");

const token = DiploToken.attach(addresses.DiploToken);
const nft = DiploNFT.attach(addresses.DiploNFT);
const marketplace = DiploMarketplace.attach(addresses.DiploMarketplace);
```

**Verificar configuración:**
```javascript
console.log("Token supply:", await token.totalSupply());
console.log("NFT name:", await nft.name());
console.log("Marketplace token:", await marketplace.diploToken());
```

**Simular flujo completo:**
```javascript
const [owner, seller, buyer] = await ethers.getSigners();

// 1. Mint tokens para buyer
await token.mint(buyer.address, ethers.parseEther("1000"));

// 2. Mint NFT para seller
await nft.mintNFT(seller.address, "ipfs://test-metadata");

// 3. Aprobar marketplace
await nft.connect(seller).setApprovalForAll(marketplace.getAddress(), true);

// 4. Listar NFT
await marketplace.connect(seller).listNFT(nft.getAddress(), 1, ethers.parseEther("100"));

// 5. Aprobar tokens
await token.connect(buyer).approve(marketplace.getAddress(), ethers.parseEther("100"));

// 6. Comprar NFT
await marketplace.connect(buyer).buyNFT(1);

// 7. Verificar transferencias
console.log("NFT owner:", await nft.ownerOf(1));
console.log("Seller balance:", await token.balanceOf(seller.address));
```

## Resultados Esperados

✅ **Contratos compilados** sin errores  
✅ **Tests pasando** al 100%  
✅ **Deploy exitoso** en red local  
✅ **Interacción completa** entre contratos  
✅ **Eventos emitidos** correctamente  
✅ **Transferencias funcionando** (NFT y tokens)  

## Próximos Pasos

🔄 **Flujo 4**: Frontend Web3 - Interfaz de usuario  
🌐 **Flujo 5**: Despliegue en testnet Amoy  
🔧 **Optimizaciones**: Gas, UX y seguridad adicional  

---

## 📋 Checklist de Completitud

- [ ] Contrato DiploMarketplace implementado
- [ ] Scripts de deploy configurados
- [ ] Tests del marketplace escritos
- [ ] Compilación exitosa
- [ ] Tests pasando
- [ ] Deploy local funcionando
- [ ] Verificación en consola completa
- [ ] Flujo completo de compra/venta probado

**¡Marketplace listo para integrar con el frontend!** 🚀

## Troubleshooting: Errores comunes en consola

### Error "could not decode result data"

**Síntoma:** 
```
Error: could not decode result data (value="0x", info={ "method": "totalSupply", "signature": "totalSupply()" }, code=BAD_DATA, version=6.15.0)
```

**Causa:** Los contratos no están desplegados o las direcciones son incorrectas.

**Solución:**

#### 1. **Verificar estado actual:**
```javascript
// Verificar red y direcciones
const network = await ethers.provider.getNetwork();
console.log("Red:", network.name, "ChainId:", network.chainId);

const addresses = require('./contract-addresses.json');
console.log("Direcciones:", addresses);

// Verificar si existe bytecode
const code = await ethers.provider.getCode(addresses.DiploToken);
console.log("¿Contrato desplegado?", code !== "0x");
```

#### 2. **Deploy directo en consola (método alternativo):**
```javascript
// Si los contratos no existen, deployar directamente
const [deployer] = await ethers.getSigners();

// Deploy paso a paso
const DiploToken = await ethers.getContractFactory("DiploToken");
const token = await DiploToken.deploy(deployer.address);
await token.waitForDeployment();
console.log("✅ DiploToken:", await token.getAddress());

const DiploNFT = await ethers.getContractFactory("DiploNFT");
const nft = await DiploNFT.deploy();
await nft.waitForDeployment();
console.log("✅ DiploNFT:", await nft.getAddress());

const DiploMarketplace = await ethers.getContractFactory("DiploMarketplace");
const marketplace = await DiploMarketplace.deploy(await token.getAddress(), deployer.address);
await marketplace.waitForDeployment();
console.log("✅ DiploMarketplace:", await marketplace.getAddress());
```

#### 3. **Verificar funcionamiento:**
```javascript
// Ahora deberían funcionar todos los comandos
console.log("Token supply:", ethers.formatEther(await token.totalSupply()));
console.log("NFT name:", await nft.name());
console.log("Marketplace token:", await marketplace.diploToken());
```

### Otros errores comunes:

#### **Error de red:**
```javascript
// Verificar que estés en la red correcta
const network = await ethers.provider.getNetwork();
if (network.chainId !== 31337n) {
    console.log("❌ Red incorrecta. Necesitas estar en Hardhat Network (31337)");
}
```

#### **Error de archivo no encontrado:**
```javascript
// Si contract-addresses.json no existe
try {
    const addresses = require('./contract-addresses.json');
} catch (error) {
    console.log("❌ Archivo contract-addresses.json no encontrado");
    console.log("💡 Ejecuta: npm run deploy:complete");
}
```

#### **Deploy forzado (método directo):**
```javascript
// Para evitar problemas, deploy completo en consola
async function deployAll() {
    const [deployer] = await ethers.getSigners();
    
    const DiploToken = await ethers.getContractFactory("DiploToken");
    const token = await DiploToken.deploy(deployer.address);
    await token.waitForDeployment();
    
    const DiploNFT = await ethers.getContractFactory("DiploNFT");
    const nft = await DiploNFT.deploy();
    await nft.waitForDeployment();
    
    const DiploMarketplace = await ethers.getContractFactory("DiploMarketplace");
    const marketplace = await DiploMarketplace.deploy(await token.getAddress(), deployer.address);
    await marketplace.waitForDeployment();
    
    return { token, nft, marketplace };
}

// Ejecutar deploy
const { token, nft, marketplace } = await deployAll();
```
