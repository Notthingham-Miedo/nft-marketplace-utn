# 🎮 Actividad: Probar token en consola - Paso a Paso

## 📋 Prerequisitos
- Proyecto instalado y compilado
- Red local de Hardhat corriendo
- Token desplegado en red local

## 🚀 Paso a Paso Completo

### **Paso 1: Preparar el entorno**

```bash
# Terminal 1: Levantar red local (mantener abierta)
npm run node
```

```bash
# Terminal 2: Deploy del token
npm run deploy:local
```

**📝 IMPORTANTE**: Guardar la dirección del contrato que aparece al final del deploy. Ejemplo:
```
✅ DiploToken desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### **Paso 2: Iniciar consola interactiva**

```bash
# Terminal 2: Abrir consola
npx hardhat console
```

### **Paso 3: Configurar conexión al contrato**

```javascript
// 1. Obtener el factory del contrato
const DiploToken = await ethers.getContractFactory("DiploToken");

// 2. Conectar a la instancia desplegada (CAMBIAR por tu dirección)
const TOKEN_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // ⚠️ USAR TU DIRECCIÓN
const diploToken = DiploToken.attach(TOKEN_ADDRESS);

// 3. Obtener cuentas de prueba
const [owner, addr1, addr2] = await ethers.getSigners();

// 4. Verificar conexión
console.log("🔗 Conectado al token:", await diploToken.getAddress());
console.log("👤 Owner:", owner.address);
console.log("👤 Addr1:", addr1.address);
console.log("👤 Addr2:", addr2.address);
```

### **Paso 4: Verificar información básica del token**

```javascript
// Información del token
console.log("📊 INFORMACIÓN DEL TOKEN:");
console.log("Nombre:", await diploToken.name());
console.log("Símbolo:", await diploToken.symbol());
console.log("Decimales:", await diploToken.decimals());

// Supply total
const totalSupply = await diploToken.totalSupply();
console.log("Supply Total:", ethers.formatEther(totalSupply), "DIP");
```

**🎯 Resultado esperado:**
```
📊 INFORMACIÓN DEL TOKEN:
Nombre: Diplo
Símbulo: DIP
Decimales: 18
Supply Total: 1000000.0 DIP
```

### **Paso 5: Verificar balances iniciales**

```javascript
// Balance del owner (debería tener todo el supply inicial)
const ownerBalance = await diploToken.balanceOf(owner.address);
console.log("💰 Balance Owner:", ethers.formatEther(ownerBalance), "DIP");

// Balances de otras cuentas (deberían ser 0)
const addr1Balance = await diploToken.balanceOf(addr1.address);
const addr2Balance = await diploToken.balanceOf(addr2.address);
console.log("💰 Balance Addr1:", ethers.formatEther(addr1Balance), "DIP");
console.log("💰 Balance Addr2:", ethers.formatEther(addr2Balance), "DIP");
```

**🎯 Resultado esperado:**
```
💰 Balance Owner: 1000000.0 DIP
💰 Balance Addr1: 0.0 DIP
💰 Balance Addr2: 0.0 DIP
```

### **Paso 6: Probar transferencias**

```javascript
// Transferir 1000 DIP del owner a addr1
console.log("🔄 Transfiriendo 1000 DIP del owner a addr1...");
const tx1 = await diploToken.transfer(addr1.address, ethers.parseEther("1000"));
await tx1.wait(); // Esperar confirmación

// Verificar balances después de la transferencia
const ownerBalanceAfter = await diploToken.balanceOf(owner.address);
const addr1BalanceAfter = await diploToken.balanceOf(addr1.address);

console.log("💰 Nuevo Balance Owner:", ethers.formatEther(ownerBalanceAfter), "DIP");
console.log("💰 Nuevo Balance Addr1:", ethers.formatEther(addr1BalanceAfter), "DIP");
```

**🎯 Resultado esperado:**
```
💰 Nuevo Balance Owner: 999000.0 DIP
💰 Nuevo Balance Addr1: 1000.0 DIP
```

### **Paso 7: Probar transferencia entre cuentas no-owner**

```javascript
// addr1 transfiere 200 DIP a addr2
console.log("🔄 Transfiriendo 200 DIP de addr1 a addr2...");
const tx2 = await diploToken.connect(addr1).transfer(addr2.address, ethers.parseEther("200"));
await tx2.wait();

// Verificar balances finales
const finalAddr1Balance = await diploToken.balanceOf(addr1.address);
const finalAddr2Balance = await diploToken.balanceOf(addr2.address);

console.log("💰 Balance Final Addr1:", ethers.formatEther(finalAddr1Balance), "DIP");
console.log("💰 Balance Final Addr2:", ethers.formatEther(finalAddr2Balance), "DIP");
```

**🎯 Resultado esperado:**
```
💰 Balance Final Addr1: 800.0 DIP
💰 Balance Final Addr2: 200.0 DIP
```

### **Paso 8: Probar función mint (solo owner)**

```javascript
// Owner mintea 500 DIP adicionales para addr1
console.log("⚡ Minteando 500 DIP adicionales para addr1...");
const tx3 = await diploToken.mint(addr1.address, ethers.parseEther("500"));
await tx3.wait();

// Verificar nuevo balance y supply
const newAddr1Balance = await diploToken.balanceOf(addr1.address);
const newTotalSupply = await diploToken.totalSupply();

console.log("💰 Nuevo Balance Addr1:", ethers.formatEther(newAddr1Balance), "DIP");
console.log("📊 Nuevo Total Supply:", ethers.formatEther(newTotalSupply), "DIP");
```

**🎯 Resultado esperado:**
```
💰 Nuevo Balance Addr1: 1300.0 DIP
📊 Nuevo Total Supply: 1000500.0 DIP
```

### **Paso 9: Probar que non-owner no puede mintear**

```javascript
// Intentar mintear desde addr1 (debería fallar)
console.log("❌ Intentando mintear desde addr1 (debería fallar)...");
try {
  await diploToken.connect(addr1).mint(addr2.address, ethers.parseEther("100"));
  console.log("🚨 ERROR: El mint no debería haber funcionado!");
} catch (error) {
  console.log("✅ Correcto: Solo el owner puede mintear");
  console.log("Error:", error.message.includes("OwnableUnauthorizedAccount") ? "OwnableUnauthorizedAccount" : error.message);
}
```

### **Paso 10: Resumen final**

```javascript
// Mostrar estado final de todos los balances
console.log("\n📋 RESUMEN FINAL:");
console.log("👤 Owner:", ethers.formatEther(await diploToken.balanceOf(owner.address)), "DIP");
console.log("👤 Addr1:", ethers.formatEther(await diploToken.balanceOf(addr1.address)), "DIP");
console.log("👤 Addr2:", ethers.formatEther(await diploToken.balanceOf(addr2.address)), "DIP");
console.log("📊 Total Supply:", ethers.formatEther(await diploToken.totalSupply()), "DIP");
```

## ✅ **Validación Exitosa**

Si todos los pasos funcionan correctamente, habrás validado:

- ✅ **Información básica del token** (nombre, símbolo, decimales, supply)
- ✅ **Balances iniciales** (owner tiene todo el supply)
- ✅ **Transferencias directas** (owner → addr1)
- ✅ **Transferencias entre usuarios** (addr1 → addr2)
- ✅ **Función mint** (solo owner puede mintear)
- ✅ **Control de acceso** (non-owner no puede mintear)

## 🚨 **Solución de Problemas**

### Error: "Cannot read properties of undefined"
```javascript
// Verificar que el contrato esté bien conectado
console.log("Dirección del contrato:", await diploToken.getAddress());
```

### Error: "Transaction reverted"
```javascript
// Verificar que tengas suficiente balance
const balance = await diploToken.balanceOf(owner.address);
console.log("Balance disponible:", ethers.formatEther(balance));
```

### Error de conexión
```bash
# Verificar que la red local esté corriendo
# Terminal 1 debería mostrar actividad de bloques
```

## 🎯 **Criterios de Éxito**

✅ Todos los comandos se ejecutan sin errores  
✅ Los balances se actualizan correctamente  
✅ Las transferencias funcionan  
✅ Solo el owner puede mintear  
✅ Los totales cuadran matemáticamente  

**¡Flujo 1 completado exitosamente!** 🎉

---

```js
// Deploy fresh from console
const DiploToken = await ethers.getContractFactory("DiploToken");

// Get accounts
const [owner] = await ethers.getSigners();

// Deploy with owner address
const diploToken = await DiploToken.deploy(owner.address);
await diploToken.waitForDeployment();

// Get and save the address
const contractAddress = await diploToken.getAddress();
console.log("🔗 Fresh contract deployed at:", contractAddress);

// Now test it immediately
console.log("Nombre:", await diploToken.name());
console.log("Símbolo:", await diploToken.symbol());
```