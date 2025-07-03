// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DiploToken
 * @dev Token ERC20 personalizado para el marketplace de NFTs
 * Nombre: Diplo | Símbolo: DIP | Supply inicial: 1,000,000 tokens
 */
contract DiploToken is ERC20, Ownable {
    
    // Supply inicial de 1 millón de tokens
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    
    /**
     * @dev Constructor que inicializa el token con nombre, símbolo y supply inicial
     * @param initialOwner Dirección que será el owner del contrato
     */
    constructor(address initialOwner) ERC20("Diplo", "DIP") Ownable(initialOwner) {
        // Mintear el supply inicial al owner del contrato
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Función para crear nuevos tokens (solo para testing)
     * Solo el owner puede ejecutar esta función
     * @param to Dirección que recibirá los nuevos tokens
     * @param amount Cantidad de tokens a crear
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Función para quemar tokens
     * @param amount Cantidad de tokens a quemar
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Función para quemar tokens de otra dirección (requiere allowance)
     * @param from Dirección de la cual quemar tokens
     * @param amount Cantidad de tokens a quemar
     */
    function burnFrom(address from, uint256 amount) public {
        _spendAllowance(from, msg.sender, amount);
        _burn(from, amount);
    }
    
    /**
     * @dev Override de decimals para confirmar 18 decimales
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}