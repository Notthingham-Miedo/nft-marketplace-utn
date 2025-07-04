// ABI del contrato ERC721 (NFT)
export const nftAbi = [
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "symbol", "type": "string"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "string", "name": "ipfsHash", "type": "string"}],
    "name": "mintNFT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "string", "name": "ipfsHash", "type": "string"}],
    "name": "mint",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "index", "type": "uint256"}],
    "name": "tokenByIndex",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// ABI del contrato ERC20 (Token)
export const erc20Abi = [
  {
    "inputs": [{"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "symbol", "type": "string"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// ABI del contrato Marketplace
export const marketplaceAbi = [
  {
    "inputs": [
      {"internalType": "address", "name": "_diploToken", "type": "address"},
      {"internalType": "address", "name": "initialOwner", "type": "address"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "listNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}],
    "name": "buyNFT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}],
    "name": "cancelListing",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}],
    "name": "getListing",
    "outputs": [
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveListings",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "name": "listings",
    "outputs": [
      {"internalType": "address", "name": "seller", "type": "address"},
      {"internalType": "address", "name": "nftContract", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "uint256", "name": "price", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextListingId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "nftContract", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "NFTListed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "NFTPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "listingId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "seller", "type": "address"}
    ],
    "name": "ListingCancelled",
    "type": "event"
  }
] as const;
