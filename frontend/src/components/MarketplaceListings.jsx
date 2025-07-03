import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Box, Heading, Text, Image, Button, SimpleGrid, Card, CardBody, Stack, Flex, Badge, Spinner } from '@chakra-ui/react';

function MarketplaceListings({ contracts, account }) {
  const [listings, setListings] = useState([]);
  const [isBuying, setIsBuying] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!contracts) return;
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const activeListings = await contracts.marketplace.getActiveListings();
        const listingsData = await Promise.all(
          activeListings.map(async (listing) => {
            const tokenURI = await contracts.nft.tokenURI(listing.tokenId);
            const metadataResponse = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
            const metadata = await metadataResponse.json();
            return {
              listingId: Number(listing.listingId),
              price: ethers.formatEther(listing.price),
              seller: listing.seller,
              tokenId: Number(listing.tokenId),
              ...metadata
            };
          })
        );
        setListings(listingsData.filter(l => l.seller.toLowerCase() !== account.toLowerCase()));
      } catch (error) {
        console.error("Error cargando listings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadListings();
  }, [contracts, account]);

  const handleBuyNFT = async (listing) => {
    setIsBuying(prev => ({ ...prev, [listing.listingId]: true }));
    try {
      const priceInWei = ethers.parseEther(listing.price);
      const approveTx = await contracts.token.approve(contracts.marketplace.target, priceInWei);
      await approveTx.wait();
      const buyTx = await contracts.marketplace.buyNFT(listing.listingId);
      await buyTx.wait();
      alert(`¡NFT "${listing.name}" comprado!`);
      setListings(prev => prev.filter(l => l.listingId !== listing.listingId));
    } catch (error) {
      console.error("Error al comprar:", error);
      alert("Hubo un error al comprar el NFT.");
    } finally {
      setIsBuying(prev => ({ ...prev, [listing.listingId]: false }));
    }
  };

  if (isLoading) {
    return <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>NFTs en Venta</Heading>
      {listings.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {listings.map(listing => (
            <Card key={listing.listingId} size="sm">
              <CardBody>
                <Image src={listing.image?.replace("ipfs://", "https://ipfs.io/ipfs/")} fallbackSrc="https://via.placeholder.com/150" alt={listing.name} borderRadius="md" />
                <Stack mt="4" spacing="2">
                  <Heading size="sm">{listing.name} #{Number(listing.tokenId)}</Heading>
                  <Text color="gray.600" fontSize="xs" noOfLines={2}>{listing.description}</Text>
                  <Text color="blue.600" fontSize="md" fontWeight="bold">{listing.price} DIP</Text>
                  <Button colorScheme="purple" size="sm" isLoading={isBuying[listing.listingId]} onClick={() => handleBuyNFT(listing)}>Comprar</Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Text>No hay NFTs en venta en este momento.</Text>
      )}
    </Box>
  );
}

export default MarketplaceListings;