import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Box, Heading, Text, Image, Input, Button, SimpleGrid, Card, CardBody, Stack, Flex } from '@chakra-ui/react';

function MyNFTs({ account, contracts }) {
  const [myNfts, setMyNfts] = useState([]);
  const [price, setPrice] = useState('');
  const [isListing, setIsListing] = useState({});

  useEffect(() => {
    if (!contracts || !account) return;
    const loadUserNFTs = async () => {
      const nftIds = await contracts.nft.tokensOfOwner(account);
      const nftsData = await Promise.all(
        nftIds.map(async (id) => {
          const tokenURI = await contracts.nft.tokenURI(id);
          const metadataResponse = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
          const metadata = await metadataResponse.json();
          return { id: Number(id), ...metadata };
        })
      );
      setMyNfts(nftsData);
    };
    loadUserNFTs();
  }, [account, contracts]);

  const handleListNFT = async (tokenId) => {
    if (!price || parseFloat(price) <= 0) {
      alert("Ingresa un precio válido.");
      return;
    }
    setIsListing(prev => ({ ...prev, [tokenId]: true }));
    try {
      const approveTx = await contracts.nft.approve(contracts.marketplace.target, tokenId);
      await approveTx.wait();
      const listTx = await contracts.marketplace.listNFT(contracts.nft.target, tokenId, ethers.parseEther(price));
      await listTx.wait();
      alert("¡NFT listado con éxito!");
      setMyNfts(prev => prev.filter(nft => nft.id !== tokenId));
      setPrice('');
    } catch (error) {
      console.error("Error al listar:", error);
      alert("Hubo un error al listar el NFT.");
    } finally {
      setIsListing(prev => ({ ...prev, [tokenId]: false }));
    }
  };

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>Mis NFTs</Heading>
      {myNfts.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {myNfts.map(nft => (
            <Card key={nft.id} size="sm">
              <CardBody>
                <Image src={nft.image?.replace("ipfs://", "https://ipfs.io/ipfs/")} fallbackSrc="https://via.placeholder.com/150" alt={nft.name} borderRadius="md" />
                <Stack mt="4" spacing="2">
                  <Heading size="sm">{nft.name} #{nft.id}</Heading>
                  <Flex>
                    <Input placeholder="Precio en DIP" size="sm" type="number" onChange={(e) => setPrice(e.target.value)} mr={2} />
                    <Button colorScheme="teal" size="sm" isLoading={isListing[nft.id]} onClick={() => handleListNFT(nft.id)}>Vender</Button>
                  </Flex>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text>No posees ningún NFT en este momento.</Text>
      )}
    </Box>
  );
}

export default MyNFTs;