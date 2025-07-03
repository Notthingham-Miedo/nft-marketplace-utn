const { ethers } = require("hardhat");

async function main() {
  console.log("Desplegando contrato DiploNFT...");

  // Obtener el contrato
  const DiploNFT = await ethers.getContractFactory("DiploNFT");

  // Desplegar
  const diploNFT = await DiploNFT.deploy();
  await diploNFT.waitForDeployment();

  console.log(`DiploNFT desplegado en: ${await diploNFT.getAddress()}`);

  // Guardar la dirección para uso futuro
  const fs = require("fs");
  const contractAddress = {
    DiploNFT: await diploNFT.getAddress(),
  };

  fs.writeFileSync(
    "./contract-addresses.json",
    JSON.stringify(contractAddress, null, 2)
  );

  console.log("Dirección guardada en contract-addresses.json");

  return diploNFT;
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
