import CarbonCreditTokenABI from "../CarbonToken.json";
const ethers = require("ethers");

export const connectToEthereum = async () => {
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

export const generateSignature = async (account, provider) => {
  const signer = provider.getSigner();
  const message = `${process.env.REACT_APP_SECRET_MESSAGE}`;
  const messageBytes = ethers.utils.toUtf8Bytes(message);
  const messageHash = ethers.utils.keccak256(messageBytes);
  const signature = await signer.signMessage(
    ethers.utils.arrayify(messageHash)
  );
  return signature;
};
