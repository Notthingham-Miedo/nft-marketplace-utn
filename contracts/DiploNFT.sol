// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DiploNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;

    // Mapping para almacenar el URI de cada token
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("DiploNFT", "DNFT") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    /**
     * @dev Mintea un nuevo NFT con metadata IPFS
     * @param to Dirección que recibirá el NFT
     * @param ipfsHash Hash IPFS del metadata JSON
     */
    function mintNFT(
        address to,
        string memory ipfsHash
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsHash);
        return tokenId;
    }

    /**
     * @dev Establece el URI de un token
     */
    function _setTokenURI(uint256 tokenId, string memory uri) internal {
        require(
            _ownerOf(tokenId) != address(0),
            "URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = uri;
    }

    /**
     * @dev Devuelve el URI del token
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "URI query for nonexistent token"
        );

        string memory _tokenURI = _tokenURIs[tokenId];
        
        // Si el token URI ya es una URL completa (data: o https:), devolverlo tal como está
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }

        return super.tokenURI(tokenId);
    }

    /**
     * @dev Base URI para metadata (IPFS gateway) - solo se usa si no hay token URI específico
     */
    function _baseURI() internal pure override returns (string memory) {
        return "https://gateway.pinata.cloud/ipfs/";
    }

    /**
     * @dev Devuelve todos los tokens de un owner
     */
    function tokensOfOwner(
        address owner
    ) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }

        return tokenIds;
    }
}
