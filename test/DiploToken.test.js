const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiploToken", function () {
  let diploToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens

  beforeEach(async function () {
    // Obtener cuentas de testing
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy del contrato
    const DiploToken = await ethers.getContractFactory("DiploToken");
    diploToken = await DiploToken.deploy(owner.address);
    await diploToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Debería establecer el nombre y símbolo correctos", async function () {
      expect(await diploToken.name()).to.equal("Diplo");
      expect(await diploToken.symbol()).to.equal("DIP");
    });

    it("Debería tener 18 decimales", async function () {
      expect(await diploToken.decimals()).to.equal(18);
    });

    it("Debería asignar el supply inicial al owner", async function () {
      const ownerBalance = await diploToken.balanceOf(owner.address);
      expect(await diploToken.totalSupply()).to.equal(ownerBalance);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("Debería establecer el owner correcto", async function () {
      expect(await diploToken.owner()).to.equal(owner.address);
    });
  });

  describe("Transacciones", function () {
    it("Debería transferir tokens entre cuentas", async function () {
      const transferAmount = ethers.parseEther("100");

      // Transferir del owner a addr1
      await diploToken.transfer(addr1.address, transferAmount);

      const addr1Balance = await diploToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      // Verificar que el balance del owner se redujo
      const ownerBalance = await diploToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY - transferAmount);
    });

    it("Debería fallar si el sender no tiene suficientes tokens", async function () {
      const initialOwnerBalance = await diploToken.balanceOf(owner.address);
      const excessiveAmount = initialOwnerBalance + ethers.parseEther("1");

      await expect(
        diploToken.connect(addr1).transfer(owner.address, excessiveAmount)
      ).to.be.revertedWithCustomError(diploToken, "ERC20InsufficientBalance");
    });

    it("Debería actualizar balances después de transferencias", async function () {
      const transferAmount = ethers.parseEther("100");

      await diploToken.transfer(addr1.address, transferAmount);
      await diploToken.transfer(addr2.address, transferAmount);

      const finalOwnerBalance = await diploToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(INITIAL_SUPPLY - transferAmount * 2n);

      const addr1Balance = await diploToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(transferAmount);

      const addr2Balance = await diploToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);
    });
  });

  describe("Allowances", function () {
    it("Debería aprobar gasto de tokens", async function () {
      const approveAmount = ethers.parseEther("100");

      await diploToken.approve(addr1.address, approveAmount);

      const allowance = await diploToken.allowance(
        owner.address,
        addr1.address
      );
      expect(allowance).to.equal(approveAmount);
    });

    it("Debería permitir transferFrom con allowance", async function () {
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");

      // Owner aprueba a addr1
      await diploToken.approve(addr1.address, approveAmount);

      // addr1 transfiere desde owner a addr2
      await diploToken
        .connect(addr1)
        .transferFrom(owner.address, addr2.address, transferAmount);

      // Verificar balances
      const addr2Balance = await diploToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(transferAmount);

      // Verificar allowance restante
      const remainingAllowance = await diploToken.allowance(
        owner.address,
        addr1.address
      );
      expect(remainingAllowance).to.equal(approveAmount - transferAmount);
    });
  });

  describe("Mint (Solo Owner)", function () {
    it("Debería permitir al owner mintear nuevos tokens", async function () {
      const mintAmount = ethers.parseEther("1000");

      await diploToken.mint(addr1.address, mintAmount);

      const addr1Balance = await diploToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(mintAmount);

      const newTotalSupply = await diploToken.totalSupply();
      expect(newTotalSupply).to.equal(INITIAL_SUPPLY + mintAmount);
    });

    it("Debería fallar si alguien que no es owner trata de mintear", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        diploToken.connect(addr1).mint(addr2.address, mintAmount)
      ).to.be.revertedWithCustomError(diploToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burn", function () {
    it("Debería permitir quemar tokens propios", async function () {
      const burnAmount = ethers.parseEther("1000");

      await diploToken.burn(burnAmount);

      const ownerBalance = await diploToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY - burnAmount);

      const totalSupply = await diploToken.totalSupply();
      expect(totalSupply).to.equal(INITIAL_SUPPLY - burnAmount);
    });

    it("Debería permitir burnFrom con allowance", async function () {
      const approveAmount = ethers.parseEther("1000");
      const burnAmount = ethers.parseEther("500");

      // Owner aprueba a addr1
      await diploToken.approve(addr1.address, approveAmount);

      // addr1 quema tokens del owner
      await diploToken.connect(addr1).burnFrom(owner.address, burnAmount);

      const ownerBalance = await diploToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY - burnAmount);

      const totalSupply = await diploToken.totalSupply();
      expect(totalSupply).to.equal(INITIAL_SUPPLY - burnAmount);
    });
  });
});
