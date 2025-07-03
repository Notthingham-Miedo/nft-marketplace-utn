# Flujo 2: NFTs y Almacenamiento Descentralizado

## 🎯 Objetivos
- Configurar servicio IPFS con Pinata
- Implementar contrato ERC721Enumerable
- Gestionar metadata JSON para NFTs
- Subir imagen y metadata a IPFS
- Mintear NFT de prueba vinculado a IPFS

## 📋 Requisitos previos
- Flujo 1 completado (Token ERC20 funcionando)
- Cuenta activa en [Pinata Cloud](https://pinata.cloud)
- API Keys de Pinata configuradas
- Imagen de prueba en carpeta `assets/`

## 🚀 Configuración de Pinata IPFS

### 1. Obtener credenciales de Pinata
1. Crear cuenta en [pinata.cloud](https://pinata.cloud)
2. Ir a **API Keys** en el dashboard
3. Crear nueva API Key con permisos de **pinning**
4. Guardar **API Key** y **Secret API Key**

### 2. Configurar variables de entorno
```bash
# Agregar a tu archivo .env
PINATA_API_KEY=tu_api_key_aqui
PINATA_SECRET_API_KEY=tu_secret_key_aqui
PINATA_JWT=tu_jwt_token_aqui
```

### 3. Instalar dependencias
```bash
npm install @pinata/sdk
```

## 🖼️ Preparación de Assets

### 1. Crear directorio y agregar imagen
```bash
mkdir assets
# Colocar tu imagen de prueba en: ./assets/sample-nft.jpg
```

## 📝 Implementación del Contrato NFT

El contrato `DiploNFT.sol` ya está implementado con las siguientes características:

### Características principales:
- ✅ **ERC721Enumerable**: Permite listar y contar NFTs
- ✅ **Ownable**: Solo el owner puede mintear
- ✅ **IPFS Integration**: Soporte nativo para metadata IPFS
- ✅ **Token URI Management**: Gestión de URIs personalizados

### Funciones clave:
```solidity
function mintNFT(address to, string memory ipfsHash) public onlyOwner
function tokensOfOwner(address owner) public view returns (uint256[])
function tokenURI(uint256 tokenId) public view override returns (string memory)
```

## 🌐 Scripts IPFS con Pinata

### 1. Script de subida a IPFS
El archivo `scripts/uploadToIPFS.js` maneja:
- ✅ Autenticación con Pinata
- ✅ Subida de imágenes
- ✅ Creación y subida de metadata JSON
- ✅ Validación de conectividad

### 2. Estructura de metadata JSON
```json
{
  "name": "Nombre del NFT",
  "description": "Descripción detallada",
  "image": "https://gateway.pinata.cloud/ipfs/CID_IMAGEN",
  "attributes": [
    { "trait_type": "Color", "value": "Azul" },
    { "trait_type": "Rareza", "value": "Común" }
  ]
}
```

## 🏠 Deploy y Testing

### 1. Compilar contratos
```bash
npm run compile
```

### 2. Deploy del contrato NFT
```bash
npm run deploy:nft:local
# O manualmente:
npx hardhat run scripts/deploy-nft.js --network localhost
```

### 3. Subir imagen y metadata a IPFS
```bash
node scripts/uploadToIPFS.js
```

### 4. Mintear NFT de prueba
```bash
npx hardhat run scripts/mint-nft.js --network localhost
```

## 🎮 Actividad de Cierre: Flujo completo de NFT

### 1. Verificar archivos generados
Después de ejecutar los scripts, deberías tener:
```bash
contract-addresses.json    # Direcciones de contratos
ipfs-upload-info.json     # Información de subida IPFS
nft-mint-info.json        # Información del NFT minteado
```

### 2. Abrir consola de Hardhat
```bash
npm run console
```

### 3. Conectar al contrato NFT
```javascript
// Cargar direcciones de contratos
const addresses = require('./contract-addresses.json');

// Obtener factory y conectar
const DiploNFT = await ethers.getContractFactory("DiploNFT");
const diploNFT = DiploNFT.attach(addresses.DiploNFT);

// Obtener cuentas
const [owner, addr1, addr2] = await ethers.getSigners();
```

### 4. Verificar información básica del NFT
```javascript
// Información del contrato
await diploNFT.name()           // "DiploNFT"
await diploNFT.symbol()         // "DNFT"
await diploNFT.totalSupply()    // 1n (si ya minteaste)

// Dirección del contrato
await diploNFT.getAddress()

// Owner del contrato
await diploNFT.owner()
```

### 5. Verificar NFT minteado
```javascript
// Verificar que existe el token ID 1
await diploNFT.ownerOf(1)

// Obtener URI del token
const tokenURI = await diploNFT.tokenURI(1);
console.log("Token URI:", tokenURI);

// Ver todos los tokens del owner
const tokens = await diploNFT.tokensOfOwner(owner.address);
console.log("Tokens del owner:", tokens);

// Balance de NFTs del owner
await diploNFT.balanceOf(owner.address)
```

### 6. Probar transferencia de NFT
```javascript
// Transferir NFT del owner a addr1
await diploNFT.transferFrom(owner.address, addr1.address, 1);

// Verificar nuevo owner
await diploNFT.ownerOf(1)  // Debería ser addr1.address

// Verificar balances actualizados
await diploNFT.balanceOf(owner.address)  // 0
await diploNFT.balanceOf(addr1.address)  // 1
```

### 7. Mintear NFT adicional
```javascript
// Solo el owner puede mintear (debemos reconectar como owner)
const nftAsOwner = diploNFT.connect(owner);

// Mintear otro NFT (usar un CID diferente o el mismo para prueba)
const ipfsHash = "QmTuCuRJBJiNnPKgfTMLzVhwjDX4XFD3fLJi8Hrc4wGYXy"; // Ejemplo
await nftAsOwner.mintNFT(addr2.address, ipfsHash);

// Verificar nuevo total supply
await diploNFT.totalSupply()  // 2n

// Ver tokens de addr2
await diploNFT.tokensOfOwner(addr2.address);
```

### 8. Verificar metadata en IPFS
```javascript
// Obtener URI del token
const uri = await diploNFT.tokenURI(1);
console.log("Metadata URL:", uri);

// Puedes verificar visitando la URL en el navegador
// Formato: https://ipfs.io/ipfs/CID_METADATA
```

### 9. Probar funciones de enumeración
```javascript
// Obtener token por índice
await diploNFT.tokenByIndex(0)  // Primer token minteado
await diploNFT.tokenByIndex(1)  // Segundo token minteado

// Obtener token de un owner por índice
await diploNFT.tokenOfOwnerByIndex(addr1.address, 0)
```

## ✅ Validación del Flujo 2

Al completar este flujo deberías poder:

1. **Conectar** exitosamente con Pinata IPFS
2. **Subir imagen** y obtener CID único
3. **Generar metadata** JSON con enlaces IPFS
4. **Desplegar** contrato ERC721Enumerable
5. **Mintear NFT** vinculado a metadata IPFS
6. **Verificar** todas las funcionalidades:
   - Consulta de propietarios
   - Transferencias de NFTs
   - Enumeración de tokens
   - Acceso a metadata IPFS

## 🎉 ¡Flujo 2 Completado!

Has establecido exitosamente:
- ✅ Servicio IPFS configurado con Pinata
- ✅ Contrato ERC721Enumerable funcional
- ✅ Sistema de metadata descentralizado
- ✅ NFT de prueba minteado y verificado
- ✅ Scripts automatizados para IPFS

**Próximo paso**: Flujo 3 - Smart Contract del Marketplace

## 🔧 Troubleshooting

### Error de autenticación Pinata
```bash
# Verificar variables de entorno
node -e "console.log(process.env.PINATA_API_KEY)"
```

### Error "No se encontró la imagen"
```bash
# Verificar que existe el archivo
ls -la ./assets/
```

### Error de compilación del contrato
```bash
# Limpiar y recompilar
npx hardhat clean
npm run compile
```

### NFT no muestra metadata
- Verificar que el CID es correcto
- Probar acceso directo: `https://gateway.pinata.cloud/ipfs/TU_CID`
- Verificar formato JSON de metadata

### Error en transfer de NFT
```bash
# Verificar que el token existe y el sender es el owner
await diploNFT.ownerOf(tokenId)
```

## 📁 Archivos creados en este flujo

```
contracts/
  DiploNFT.sol                 # Contrato ERC721Enumerable
scripts/
  uploadToIPFS.js              # Script de subida a Pinata
  deploy-nft.js                # Deploy del contrato NFT
  mint-nft.js                  # Script de minteo
assets/
  sample-nft.jpg               # Imagen de prueba
contract-addresses.json        # Direcciones desplegadas
ipfs-upload-info.json         # Info de subida IPFS
nft-mint-info.json            # Info del NFT minteado
```
