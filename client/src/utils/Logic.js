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

  // Connect to the CarbonCreditToken contract
  const token = new ethers.Contract(
    process.env.REACT_APP_TOKEN_ADDRESS,
    CarbonCreditTokenABI.abi,
    signer
  );

  return { provider, signer, account, token };
};
