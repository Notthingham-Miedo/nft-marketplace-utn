const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DiploMarketplace", function () {
  let diploToken, diploNFT, marketplace;
  let owner, seller, buyer;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy contracts
    const DiploToken = await ethers.getContractFactory("DiploToken");
    diploToken = await DiploToken.deploy(owner.address);

    const DiploNFT = await ethers.getContractFactory("DiploNFT");
    diploNFT = await DiploNFT.deploy();

    const DiploMarketplace = await ethers.getContractFactory(
      "DiploMarketplace"
    );
    marketplace = await DiploMarketplace.deploy(
      await diploToken.getAddress(),
      owner.address
    );

    // Setup: mint tokens para buyer
    await diploToken.mint(buyer.address, ethers.parseEther("1000"));

    // Setup: mint NFT para seller
    await diploNFT.mintNFT(seller.address, "ipfs://test-hash");
  });

  describe("Listing NFTs", function () {
    it("Should list NFT successfully", async function () {
      const nftAddress = await diploNFT.getAddress();
      const price = ethers.parseEther("100");

      // Aprobar marketplace
      await diploNFT
        .connect(seller)
        .setApprovalForAll(await marketplace.getAddress(), true);

      // Listar NFT
      await expect(
        marketplace.connect(seller).listNFT(nftAddress, 1, price)
      ).to.emit(marketplace, "NFTListed");

      // Verificar listing
      const listing = await marketplace.getListing(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(price);
      expect(listing.active).to.be.true;
    });

    it("Should fail if not owner", async function () {
      const nftAddress = await diploNFT.getAddress();
      const price = ethers.parseEther("100");

      await expect(
        marketplace.connect(buyer).listNFT(nftAddress, 1, price)
      ).to.be.revertedWith("Not owner of NFT");
    });
  });

  describe("Buying NFTs", function () {
    beforeEach(async function () {
      const nftAddress = await diploNFT.getAddress();
      const price = ethers.parseEther("100");

      // Setup listing
      await diploNFT
        .connect(seller)
        .setApprovalForAll(await marketplace.getAddress(), true);
      await marketplace.connect(seller).listNFT(nftAddress, 1, price);
    });

    it("Should buy NFT successfully", async function () {
      const price = ethers.parseEther("100");

      // Aprobar tokens
      await diploToken
        .connect(buyer)
        .approve(await marketplace.getAddress(), price);

      // Comprar NFT
      await expect(marketplace.connect(buyer).buyNFT(1)).to.emit(
        marketplace,
        "NFTPurchased"
      );

      // Verificar transferencias
      expect(await diploNFT.ownerOf(1)).to.equal(buyer.address);
      expect(await diploToken.balanceOf(seller.address)).to.equal(price);
    });

    it("Should fail without approval", async function () {
      await expect(marketplace.connect(buyer).buyNFT(1)).to.be.revertedWith(
        "Insufficient DIP allowance"
      );
    });
  });
});
