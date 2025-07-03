# Flujo 1: Configuración del Entorno y Token ERC20

## 🎯 Objetivos
- Configurar entorno de desarrollo con Hardhat
- Crear token ERC20 personalizado "Diplo (DIP)"
- Realizar pruebas locales del token

## 📋 Requisitos previos
- Node.js v16 o superior
- NPM o Yarn
- Git

## 🚀 Instalación

### 1. Crear proyecto y instalar dependencias
```bash
# Crear directorio del proyecto
mkdir marketplace-nft-erc20
cd marketplace-nft-erc20

# Inicializar npm (usar el package.json proporcionado)
npm init -y

# Instalar dependencias
npm install

# Crear estructura de carpetas
mkdir contracts scripts test
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores (por ahora solo necesario para testnet)
```

### 3. Compilar contratos
```bash
npm run compile
```

## 🧪 Testing

### Ejecutar tests unitarios
```bash
npm test
```

Los tests verifican:
- ✅ Configuración correcta del token (nombre, símbolo, decimales)
- ✅ Supply inicial asignado al owner
- ✅ Transferencias básicas entre cuentas
- ✅ Sistema de allowances (approve/transferFrom)
- ✅ Funciones de mint (solo owner)
- ✅ Funciones de burn

## 🏠 Deploy Local

### 1. Iniciar red local de Hardhat
```bash
# En una terminal separada
npm run node
```

### 2. Deploy del token
```bash
npm run deploy:local
```

## 🎮 Actividad de Cierre: Probar token en consola

### 1. Abrir consola de Hardhat
```bash
npm run console
```

### 2. Obtener instancia del contrato
```javascript
// Obtener el contrato factory
const DiploToken = await ethers.getContractFactory("DiploToken");

// Conectar a la instancia desplegada (usar la dirección del deploy)
const diploToken = DiploToken.attach("DIRECCION_DEL_CONTRATO");

// Obtener cuentas
const [owner, addr1, addr2] = await ethers.getSigners();
```

### 3. Verificar información básica
```javascript
// Información del token
await diploToken.name()        // "Diplo"
await diploToken.symbol()      // "DIP"
await diploToken.decimals()    // 18
await diploToken.totalSupply() // 1000000000000000000000000n

// Balance del owner (en wei)
await diploToken.balanceOf(owner.address)

// Convertir a formato legible
ethers.formatEther(await diploToken.balanceOf(owner.address))
```

### 4. Probar transferencias
```javascript
// Transferir 1000 DIP del owner a addr1
await diploToken.transfer(addr1.address, ethers.parseEther("1000"))

// Verificar balance de addr1
ethers.formatEther(await diploToken.balanceOf(addr1.address))

// Verificar balance actualizado del owner
ethers.formatEther(await diploToken.balanceOf(owner.address))
```

### 5. Probar mint (función de testing)
```javascript
// Mintear 500 DIP adicionales para addr1
await diploToken.mint(addr1.address, ethers.parseEther("500"))

// Verificar nuevo balance
ethers.formatEther(await diploToken.balanceOf(addr1.address)) // Debería ser 1500 DIP

// Verificar nuevo total supply
ethers.formatEther(await diploToken.totalSupply())
```

### 6. Probar allowances
```javascript
// Owner aprueba 200 DIP para que addr2 los gaste
await diploToken.approve(addr2.address, ethers.parseEther("200"))

// Verificar allowance
ethers.formatEther(await diploToken.allowance(owner.address, addr2.address))

// addr2 transfiere 100 DIP del owner a addr1
await diploToken.connect(addr2).transferFrom(
  owner.address, 
  addr1.address, 
  ethers.parseEther("100")
)

// Verificar allowance restante
ethers.formatEther(await diploToken.allowance(owner.address, addr2.address)) // Debería ser 100 DIP
```

## ✅ Validación del Flujo 1

Al completar este flujo deberías poder:

1. **Compilar** el contrato sin errores
2. **Ejecutar tests** con 100% de éxito
3. **Desplegar** en red local correctamente
4. **Interactuar** con el token desde la consola
5. **Verificar** todas las funcionalidades básicas:
   - Transferencias directas
   - Sistema de allowances
   - Mint de nuevos tokens
   - Consulta de balances

## 🎉 ¡Flujo 1 Completado!

Has establecido exitosamente:
- ✅ Entorno de desarrollo configurado
- ✅ Token ERC20 "Diplo (DIP)" funcional
- ✅ Testing automatizado
- ✅ Scripts de deploy
- ✅ Validación manual en consola

**Próximo paso**: Flujo 2 - NFTs y Almacenamiento Descentralizado

## 🔧 Troubleshooting

### Error de compilación
```bash
# Limpiar caché y recompilar
npx hardhat clean
npm run compile
```

### Error en tests
```bash
# Verificar versiones de dependencias
npm list
```

### Red local no responde
```bash
# Reiniciar nodo local
npm run node
```
