// Direcciones de los contratos (actualizar después del deploy)
export const CONTRACT_ADDRESSES = {
  hardhat: {
    DiploToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    DiploNFT: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    DiploMarketplace: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  },
  polygonAmoy: {
    DiploToken: "", // Actualizar después del deploy en testnet
    DiploNFT: "",
    DiploMarketplace: "",
  },
};

// ABIs de los contratos (simplificados para el ejemplo)
export const DIPLO_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
];

export const DIPLO_NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function mint(address to, string memory uri) returns (uint256)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
];

export const DIPLO_MARKETPLACE_ABI = [
  "function listNFT(address nftContract, uint256 tokenId, uint256 price)",
  "function buyNFT(address nftContract, uint256 tokenId, address tokenAddress)",
  "function listings(address, uint256) view returns (address seller, uint256 price, bool active)",
  "function withdrawEarnings()",
  "function earnings(address) view returns (uint256)",
  "event NFTListed(address indexed seller, address indexed nft, uint256 indexed tokenId, uint256 price)",
  "event NFTPurchased(address indexed buyer, address indexed nft, uint256 indexed tokenId, uint256 price)",
];
