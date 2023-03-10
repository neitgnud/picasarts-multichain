import React, { useState, useEffect, useMemo } from 'react';
import {
    Skeleton,
    SimpleGrid,
    Image,
    Box,
    Divider,
    Text,
    Avatar,
    Flex,
    VStack,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Progress,
    ListItem,
    UnorderedList,
    Link,
    NumberInput,
    NumberInputField,
    CircularProgress,
    useToast,
    Center,
    Tag,
    TagLabel,
    TagLeftIcon,
    HStack,
    FormControl,
    FormLabel,
} from "@chakra-ui/react";
import NextLink from 'next/link';
import HammerIcon from 'src/components/icons/Hammer';
import BagIcon from 'src/components/icons/Bag';
import { TimeIcon, MinusIcon, PlusSquareIcon } from '@chakra-ui/icons';
import { CheckIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { noneAddress, marketAddress, loanAddress, rentalAddress, daiAddress, usdcAddress } from 'src/state/chain/config';
import { createFtContractWithSigner } from 'src/state/util';
import { useDispatch, useSelector } from 'react-redux';
import { getTextColor } from 'src/state/util';
import MarketPanel from 'src/components/market/Panel';

export default function NftBuy({ ipnft }) {
    const [contractAddress, tokenId] = ipnft.split("@");
    const dispatch = useDispatch();
    const { account, selectedChain, tokens: { obj: tokenObj, loaded: tokenLoaded } } = useSelector(state => state.chain);
    const { contract: hubContract, loaded: hubLoaded } = useSelector(state => state.hub);

    const [isLoading, setIsLoading] = useState(false);
    const [metadata, setMetadata] = useState({});
    const [collectionData, setCollectionData] = useState({});
    const [creatorData, setCreatorData] = useState({});
    const [properties, setProperties] = useState([]);
    const [boostNum, setBoostNum] = useState([]);
    const [boostPer, setBoostPer] = useState([]);
    const [tabIndex, setTabIndex] = useState(0);
    const toast = useToast();

    const loadData = async () => {
        setIsLoading(true);
        let dataRes = await fetch(`/api/nft/get?chain=${selectedChain}&ipnft=${ipnft}`);
        let dataJson = await dataRes.json();
        await loadCollectionData(contractAddress);
        await loadCreatorData(dataJson.data.creator_address);
        setMetadata(dataJson.data);
        console.log(dataJson.data)
        if (dataJson.data.owner.toLowerCase() === loanAddress) {
            setTabIndex(1);
        }
        if (dataJson.data.owner.toLowerCase() === rentalAddress) {
            setTabIndex(2);
        }
        setProperties(dataJson.data.attributes.filter(item => item.display_type == "string"))
        setBoostNum(dataJson.data.attributes.filter(item => item.display_type == "boost_number" || item.display_type == "number"))
        setBoostPer(dataJson.data.attributes.filter(item => item.display_type == "boost_percentage"))
        setIsLoading(false);
    }

    const loadCreatorData = async (creator_address) => {
        let dataRes = await fetch(`/api/user/${creator_address}`);
        let dataJson = await dataRes.json();
        setCreatorData(dataJson.data);
    }

    const loadCollectionData = async (cAddress) => {
        let dataRes = await fetch(`/api/collection/get-by-address?chain=${selectedChain}&address=${cAddress}`);
        let dataJson = await dataRes.json();
        setCollectionData(dataJson.data);
    }

    const handleTabsChange = (index) => {
        setTabIndex(index)
    }

    useEffect(() => {
        loadData();
    }, [])


    return (
        <Box>
            <SimpleGrid columns={2} p={20} gap={20}>
                <Box p={5} borderRadius={10} bgColor={metadata?.background_color ? metadata.background_color : 'gray.200'} h={'min'}>
                    {(metadata?.image) ? <Image borderRadius={10} src={`http://127.0.0.1:8080/btfs/${metadata.image}`} w={'full'} /> : <Skeleton w={'full'} minH={500} />}
                </Box>
                <VStack gap={4} align={'left'}>
                    <Box>
                        <Text fontSize={'2xl'} fontWeight={700}>{metadata?.name}</Text>
                        {/* <Text>Sell by <NextLink href={`/user/${marketData?.seller}`} passHref><Link fontWeight={700}>{marketData?.seller}</Link></NextLink></Text> */}
                    </Box>
                    <Box border={'2px pink dashed'} borderRadius={2}>
                        <Tabs variant='enclosed-colored' isFitted colorScheme='pink' index={tabIndex} onChange={handleTabsChange} isLazy >
                            <TabList>
                                <Tab>Market</Tab>
                                <Tab>Loan</Tab>
                                <Tab>Rental</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <MarketPanel owner={metadata?.owner} contractAddress={contractAddress} tokenId={tokenId} />
                                </TabPanel>
                                <TabPanel>
                                    <Text fontWeight={700}>Borrower: {usdcAddress}</Text>
                                    <UnorderedList>
                                        <ListItem>
                                            Loans accepted: 20
                                        </ListItem>
                                        <ListItem>
                                            Loans liquidated: 2
                                        </ListItem>
                                        <ListItem>
                                            Offer: 20 ETH
                                        </ListItem>
                                        <ListItem>
                                            Profit: 2 ETH
                                        </ListItem>
                                        <ListItem>
                                            Token Info: <Link target={'blank'}
                                                href={`#`}>
                                                ETH
                                            </Link>
                                        </ListItem>
                                        <ListItem>
                                            Duration: 3 days
                                        </ListItem>
                                    </UnorderedList>

                                    <HStack my={2}>
                                        <Text>Remain time:</Text>
                                        <Tag size={'lg'} variant='outline' colorScheme='red' bg={'white'}>
                                            <TagLeftIcon boxSize='12px' as={TimeIcon} />
                                            <TagLabel>{Math.floor(7200000 / (1000 * 60 * 60 * 24))}D:{Math.floor((7200000 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))}H:{Math.floor((7200000 % (1000 * 60 * 60)) / (1000 * 60))}M</TagLabel>
                                        </Tag>
                                    </HStack>
                                    <Flex w='full' gap={5}>
                                        <FormControl>
                                            <FormLabel>Profit</FormLabel>
                                            <NumberInput maxW={'3xs'} my={2}>
                                                <NumberInputField min={0} placeholder='Enter add profit' />
                                            </NumberInput>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel>Time extend (days):</FormLabel>
                                            <NumberInput maxW={'3xs'} my={2}>
                                                <NumberInputField min={0} placeholder='Enter time add (days)' />
                                            </NumberInput>
                                        </FormControl>

                                    </Flex>
                                    <Center gap={5}><Button colorScheme={'teal'} leftIcon={<PlusSquareIcon />}>Add Proposal</Button> <Button colorScheme={'red'} leftIcon={<MinusIcon />}>Pay Off</Button></Center>
                                </TabPanel>
                                <TabPanel>
                                    <UnorderedList spacing={4}>
                                        <ListItem>
                                            <Text>Contract address: {contractAddress}</Text>
                                        </ListItem>
                                        <ListItem>
                                            <Text>Token ID: {tokenId}</Text>
                                        </ListItem>
                                        {(metadata?.royalty) &&
                                            <ListItem>
                                                <Text>Royalty: {parseFloat(metadata?.royalty / 100)}%</Text>
                                            </ListItem>}
                                    </UnorderedList>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </Box>
                </VStack>
            </SimpleGrid>

            <Box border={'2px pink dashed'} borderRadius={2} mx={20}>
                <Center p={2}><Text as='i' color={getTextColor(metadata.background_color ? metadata.background_color : "#ffffff" )} bgColor={metadata.background_color}>{ipnft}</Text></Center>
                <SimpleGrid columns={2} gap={10} px={10}>
                    <Box>
                        <Text fontWeight={700} my={2}>Creator</Text>
                        <Flex align={'center'} gap={5}>
                            <Avatar size={'sm'} name='Avatar Creator' src={creatorData?.avatar ? `http://127.0.0.1:8080/btfs/${creatorData?.avatar}` : ""} />
                            <NextLink href={`/artist/${metadata?.creator_address}`} passHref><Link>{creatorData?.name ? creatorData?.name : metadata?.creator_address}</Link></NextLink>
                        </Flex>
                    </Box>
                    {collectionData && <Box>
                        <Text fontWeight={700} my={2}>Collection</Text>
                        <Flex align={'center'} gap={5}>
                            <Avatar size={'sm'} name='Collection Name' src={collectionData.logo ? `http://127.0.0.1:8080/btfs/${collectionData.logo}` : ""} />
                            <NextLink href={`/collection/${collectionData?.id}`} passHref><Link>{collectionData?.name}</Link></NextLink>
                        </Flex>
                    </Box>
                    }
                </SimpleGrid>
                <Box p={10}>
                    <Text fontWeight={700} my={2}>Description</Text>
                    <Text>{metadata?.description}</Text>
                </Box>
                <Tabs variant='enclosed-colored' isFitted colorScheme='pink'>
                    <TabList>
                        <Tab>Properties</Tab>
                        <Tab>Boost</Tab>
                        <Tab>Addtional Details</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <SimpleGrid columns={3} gap={5}>
                                {properties.length ? properties.map(item => <Box bgColor={'purple.50'} px={10} py={5} textAlign={'center'} borderRadius={4} border={'2px solid'} borderColor={'purple.400'}>
                                    <Text my={2} color={'purple.600'} fontWeight={700} textTransform={'uppercase'}>{item.trait_type}</Text>
                                    <Text>{item.value}</Text>
                                </Box>) : "None"}
                            </SimpleGrid>
                        </TabPanel>
                        <TabPanel>
                            <UnorderedList spacing={6}>
                                {boostPer.map((item, index) =>
                                    <ListItem key={`boost_num${index}`}>
                                        <Text>{item.trait_type}: {item.value}%</Text><Progress colorScheme={'purple'} hasStripe value={item.value} />
                                    </ListItem>
                                )}
                                {boostNum.map((item, index) =>
                                    <ListItem key={`boost_per${index}`}>
                                        <Text >{item.trait_type}: {item.value}</Text><Progress colorScheme={'cyan'} value={item.value} />
                                    </ListItem>
                                )}
                            </UnorderedList>
                        </TabPanel>
                        <TabPanel>
                            <UnorderedList spacing={4}>
                                <ListItem>
                                    <Text>Contract address: {contractAddress}</Text>
                                </ListItem>
                                <ListItem>
                                    <Text>Token ID: {tokenId}</Text>
                                </ListItem>
                                {(metadata?.royalty) &&
                                    <ListItem>
                                        <Text>Royalty: {parseFloat(metadata?.royalty / 100)}%</Text>
                                    </ListItem>}
                            </UnorderedList>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>

            <Divider />
        </Box>
    );
}

NftBuy.getInitialProps = async ({ query }) => {
    return {
        ipnft: query.ipnft
    }
}