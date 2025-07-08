const { ethers } = require("hardhat");

async function main() {
  console.log("💰 Distribuyendo tokens DIP...");

  // Cargar direcciones de contratos
  const contractAddresses = require("../contract-addresses.json");
  
  if (!contractAddresses || !contractAddresses.DiploToken) {
    console.error("❌ No se encontraron direcciones de contratos.");
    return;
  }

  // Conectar al contrato
  const DiploToken = await ethers.getContractFactory("DiploToken");
  const token = DiploToken.attach(contractAddresses.DiploToken);

  // Obtener cuentas de Hardhat
  const accounts = await ethers.getSigners();
  console.log("📋 Distribuyendo desde:", accounts[0].address);

  // Lista de cuentas para recibir tokens (puedes agregar más direcciones aquí)
  const recipients = [
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Account #1
      amount: "1000000",
      name: "Account #1"
    },
    {
      address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Account #2
      amount: "500",
      name: "Account #2"
    },
    {
      address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Account #3
      amount: "500",
      name: "Account #3"
    }
    // Agrega más direcciones aquí si necesitas
    // {
    //   address: "TU_DIRECCION_DE_METAMASK",
    //   amount: "1000",
    //   name: "Mi Cuenta Personal"
    // }
  ];

  try {
    for (const recipient of recipients) {
      console.log(`\n⏳ Enviando ${recipient.amount} DIP a ${recipient.name} (${recipient.address})...`);
      
      const tx = await token.mint(recipient.address, ethers.parseEther(recipient.amount));
      await tx.wait();
      
      console.log(`✅ Enviado exitosamente!`);
      console.log(`📄 Hash: ${tx.hash}`);
      
      // Verificar balance
      const balance = await token.balanceOf(recipient.address);
      console.log(`💰 Balance actual: ${ethers.formatEther(balance)} DIP`);
    }

    console.log("\n🎉 Distribución completada!");
    console.log("📊 Resumen de balances:");
    
    for (const recipient of recipients) {
      const balance = await token.balanceOf(recipient.address);
      console.log(`   ${recipient.name}: ${ethers.formatEther(balance)} DIP`);
    }
    
  } catch (error) {
    console.error("❌ Error distribuyendo tokens:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
