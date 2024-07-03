import CarbonCreditTokenABI from "../CarbonToken.json";

export const connectToEthereum = async () => {
  const ethers = require("ethers");
  if (!window.ethereum) {
    throw new Error("No Ethereum provider found");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const signer = provider.getSigner();
  const account = await signer.getAddress();

  const network = await provider.getNetwork();
  const expectedNetworkId = parseInt(
    process.env.REACT_APP_EXPECTED_NETWORK_ID,
    10
  );

  if (network.chainId !== expectedNetworkId) {
    throw new Error("Wrong network. Please use Sepolia Testnet.");
  }

  // Connect to the CarbonCreditToken contract
  const token = new ethers.Contract(
    process.env.REACT_APP_TOKEN_ADDRESS,
    CarbonCreditTokenABI.abi,
    signer
  );

  return { provider, signer, account, token };
};
