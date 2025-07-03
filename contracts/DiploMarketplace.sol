// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DiploMarketplace
 * @dev Marketplace para comprar/vender NFTs usando tokens DIP
 */
contract DiploMarketplace is Ownable, ReentrancyGuard {
    // Estructura para almacenar datos de NFTs en venta
    struct Listing {
        address seller; // Vendedor del NFT
        address nftContract; // Dirección del contrato NFT
        uint256 tokenId; // ID del NFT
        uint256 price; // Precio en tokens DIP
        bool active; // Estado de la venta
    }

    // Dirección del token DIP
    IERC20 public diploToken;

    // Mapping: tokenId => Listing
    mapping(uint256 => Listing) public listings;

    // Mapping: seller => ganancias acumuladas
    mapping(address => uint256) public earnings;

    // Contador para generar IDs únicos de listings
    uint256 public nextListingId;

    // Eventos para trazabilidad
    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event NFTPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 tokenId,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId, address indexed seller);

    event EarningsWithdrawn(address indexed seller, uint256 amount);

    /**
     * @dev Constructor
     * @param _diploToken Dirección del contrato DiploToken
     */
    constructor(
        address _diploToken,
        address initialOwner
    ) Ownable(initialOwner) {
        diploToken = IERC20(_diploToken);
        nextListingId = 1;
    }

    /**
     * @dev Función para listar un NFT en venta
     * @param nftContract Dirección del contrato NFT
     * @param tokenId ID del NFT a vender
     * @param price Precio en tokens DIP
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "Not owner of NFT"
        );
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
                IERC721(nftContract).getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        uint256 listingId = nextListingId++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit NFTListed(listingId, msg.sender, nftContract, tokenId, price);
    }

    /**
     * @dev Función para comprar un NFT
     * @param listingId ID del listing a comprar
     */
    function buyNFT(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];

        require(listing.active, "Listing not active");
        require(listing.seller != msg.sender, "Cannot buy your own NFT");
        require(
            diploToken.balanceOf(msg.sender) >= listing.price,
            "Insufficient DIP balance"
        );
        require(
            diploToken.allowance(msg.sender, address(this)) >= listing.price,
            "Insufficient DIP allowance"
        );

        // Transferir tokens DIP del comprador al vendedor
        diploToken.transferFrom(msg.sender, listing.seller, listing.price);

        // Transferir NFT del vendedor al comprador
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Marcar listing como inactivo
        listing.active = false;

        emit NFTPurchased(
            listingId,
            msg.sender,
            listing.seller,
            listing.tokenId,
            listing.price
        );
    }

    /**
     * @dev Función para cancelar un listing
     * @param listingId ID del listing a cancelar
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];

        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not listing owner");

        listing.active = false;

        emit ListingCancelled(listingId, msg.sender);
    }

    /**
     * @dev Función para obtener información de un listing
     * @param listingId ID del listing
     */
    function getListing(
        uint256 listingId
    )
        external
        view
        returns (
            address seller,
            address nftContract,
            uint256 tokenId,
            uint256 price,
            bool active
        )
    {
        Listing storage listing = listings[listingId];
        return (
            listing.seller,
            listing.nftContract,
            listing.tokenId,
            listing.price,
            listing.active
        );
    }

    /**
     * @dev Función para obtener todos los listings activos
     * @return Array de IDs de listings activos
     */
    function getActiveListings() external view returns (uint256[] memory) {
        uint256 activeCount = 0;

        // Contar listings activos
        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeCount++;
            }
        }

        // Crear array con IDs activos
        uint256[] memory activeListings = new uint256[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < nextListingId; i++) {
            if (listings[i].active) {
                activeListings[currentIndex] = i;
                currentIndex++;
            }
        }

        return activeListings;
    }
}
