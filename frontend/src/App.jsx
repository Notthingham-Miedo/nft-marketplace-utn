import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Heading,
  Button,
  Text,
  Flex,
  Spacer,
  Divider,
} from '@chakra-ui/react';

// Importar ABIs y direcciones
import addresses from './contract-addresses.json';
import DiploTokenABI from './abis/DiploToken.json';
import DiploNFTABI from './abis/DiploNFT.json';
import DiploMarketplaceABI from './abis/DiploMarketplace.json';

// Importar componentes hijos
import MyNFTs from './components/MyNFTs';
import MarketplaceListings from './components/MarketplaceListings';

function App() {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [dipBalance, setDipBalance] = useState('0');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Por favor, instala MetaMask.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        setAccount(signer.address);

        const tokenContract = new ethers.Contract(addresses.DiploToken, DiploTokenABI.abi, signer);
        const nftContract = new ethers.Contract(addresses.DiploNFT, DiploNFTABI.abi, signer);
        const marketplaceContract = new ethers.Contract(addresses.DiploMarketplace, DiploMarketplaceABI.abi, signer);

        setContracts({
          token: tokenContract,
          nft: nftContract,
          marketplace: marketplaceContract,
        });
      }
    } catch (error) {
      console.error("Error conectando la billetera:", error);
    }
  };

  useEffect(() => {
    const getBalance = async () => {
      if (contracts && account) {
        const balance = await contracts.token.balanceOf(account);
        setDipBalance(ethers.formatEther(balance));
      }
    };
    getBalance();
  }, [contracts, account]);

  return (
    <Flex direction="column" minH="100vh" bg="gray.100">
      <Flex as="header" align="center" p={4} bg="white" boxShadow="md" width="100%">
        <Heading as="h1" size="lg">
          🖼️ Diplo NFT Marketplace
        </Heading>
        <Spacer />
        {account ? (
          <Box textAlign="right">
            <Text fontSize="sm" color="gray.600">
              {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
            </Text>
            <Text fontSize="md" fontWeight="bold">
              {parseFloat(dipBalance).toFixed(2)} DIP
            </Text>
          </Box>
        ) : (
          <Button colorScheme="blue" onClick={connectWallet}>
            Conectar Wallet
          </Button>
        )}
      </Flex>

      <Box as="main" flex="1" p={4} maxWidth="1200px" mx="auto" width="100%">
        {account && contracts ? (
          <>
            <MarketplaceListings contracts={contracts} account={account} />
            <Divider my={10} />
            <MyNFTs account={account} contracts={contracts} />
          </>
        ) : (
          <Flex justify="center" align="center" height="50vh">
            <Heading as="h2" size="md" color="gray.500">Por favor, conecta tu wallet para empezar.</Heading>
          </Flex>
        )}
      </Box>

      <Box as="footer" textAlign="center" p={4} color="gray.500" fontSize="sm">
        © {new Date().getFullYear()} Diplo NFT Marketplace
      </Box>
    </Flex>
  );
}

export default App;