import "./App.css";
import { ChakraProvider, Image } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { ethers } from "ethers";
import { Button } from "@chakra-ui/react";
import abi from "./contracts/FeeCollector.sol/FeeCollector.json";
import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Input } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { Spinner } from "@chakra-ui/react";
function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [caBalance, setCaBalance] = useState();
  const [isLoading, setLoading] = useState(false);
  const toast = useToast();

  //Function for fetch data from smart contract
  const fetchSc = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      "0x1E626Cf9893911A0a82cbD0d6C3E20B2Dd43DfD8",
      abi.abi,
      provider
    );
    const balance = await contract.balance();
    setCaBalance(ethers.utils.formatEther(balance));
  };

  //Function for cheking events on SC
  const checkEvents = async () => {
    setLoading(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      "0x1E626Cf9893911A0a82cbD0d6C3E20B2Dd43DfD8",
      abi.abi,
      provider
    );
    contract
      .on("Tsx", (bal) => {
        setCaBalance(ethers.utils.formatEther(bal));

        setLoading(false);
      })
      .then(() => fetchSc());
  };

  //Withdraw function that is connected to SC
  const withdraw = async (e) => {
    e.preventDefault();

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const test = await provider.getNetwork();
    const contract = new ethers.Contract(
      "0x1E626Cf9893911A0a82cbD0d6C3E20B2Dd43DfD8",
      abi.abi,
      signer
    );
    try {
      await contract
        .withdraw(
          (e.target.amount.value * 1000000000000000000).toString(),
          e.target.address.value
        )
        .then(() => checkEvents());
    } catch (err) {
      console.log(err);
      toast({
        status: "error",
        title: err.message.includes("Only owner can withdraw !")
          ? "Only Owner can withdraw, and its not you xD"
          : "Please fill the blanks correctly",
      });
    }
  };

  //Web3 Connect Function
  const login = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    if (network.chainId !== 80001) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13881",
              rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
              chainName: "Mumbai Testnet",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://polygonscan.com/"],
            },
          ],
        });
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setIsLogged(true);
        fetchSc();
      } catch (err) {
        setIsLogged(false);
        toast({
          title: err.message,
          status: "error",
        });
      }
      setIsLogged(true);
    } else {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      setIsLogged(true);
      fetchSc();
    }
  };

  //Deposit to SC
  const deposit = async (e) => {
    e.preventDefault();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      "0x1E626Cf9893911A0a82cbD0d6C3E20B2Dd43DfD8",
      abi.abi,
      signer
    );
    const gasPrice = await provider.getGasPrice();
    const sA = await signer.getAddress();
    const tx = {
      from: sA,
      to: "0x1E626Cf9893911A0a82cbD0d6C3E20B2Dd43DfD8",
      value: ethers.utils.parseEther(e.target.amount.value),
      gasLimit: ethers.utils.hexlify(100000), // 100000
      gasPrice: gasPrice.toNumber(),
    };
    try {
      signer.sendTransaction(tx).then(() => checkEvents());
    } catch (err) {
      console.log(err);
      toast({
        title: err.message,
        status: "error",
      });
    }
  };
  useEffect(() => {}, []);
  return (
    <ChakraProvider>
      <Flex
        fontWeigth="bold"
        className="bg"
        h="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          className="mainCard"
          gap="2rem"
          flexDir="column"
          justifyContent="center"
          alignItems="center"
        >
          <Flex pos={"relative"}>
            {isLoading && (
              <Spinner
                size="lg"
                top="-2rem"
                left="0"
                right="0"
                margin="0 auto"
                pos="absolute"
                color="green"
              ></Spinner>
            )}
            <form onSubmit={withdraw}>
              <Input
                color="white"
                margin="1rem 0 "
                name="address"
                placeholder="Withdraw Address"
              ></Input>
              <Input
                color="white"
                margin="1rem 0 "
                name="amount"
                placeholder="Withdraw Amount"
              ></Input>
              <Input type="submit" bgColor="white" as={Button} color="black">
                Withdraw
              </Input>
            </form>
          </Flex>
          <Flex>
            <form onSubmit={deposit}>
              <Input
                color="white"
                margin="1rem 0"
                name="amount"
                placeholder="Deposit Amount"
              ></Input>
              <Input
                margin="1rem 0  "
                type="submit"
                bgColor="white"
                as={Button}
                color="black"
              >
                Deposit to Contract
              </Input>
            </form>
          </Flex>
          <Box display="grid" placeItems="center">
            {isLogged == false ? (
              <Button p="1.5rem" onClick={login}>
                <Image
                  h="30px"
                  marginRight="1rem"
                  src={require("./assets/metamask.png")}
                ></Image>
                Login
              </Button>
            ) : (
              <Text fontSize="30px" color="white">
                {"Balance of SC = " + caBalance + " MATIC"}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>
    </ChakraProvider>
  );
}

export default App;
