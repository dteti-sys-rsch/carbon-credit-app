import React, { useEffect, useState } from "react";
import { uploadFileToPinata } from "../PinataIPFS";
import CarbonCreditTokenABI from "../CarbonToken.json"; // Add ABI JSON file
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const ListTokenForSale = ({ setAccount, setAccounts, setBalances }) => {
  const ethers = require("ethers");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [amountCTKN, setAmountCTKN] = useState("");
  const [priceETH, setPriceETH] = useState("");
  const [token, setToken] = useState(null);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Connect to Metamask
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          setAccount(account);

          // Connect to the CarbonCreditToken contract
          const token = new ethers.Contract(
            tokenAddress,
            CarbonCreditTokenABI.abi,
            signer
          );
          setToken(token);

          // balance CTKN
          const ctknBalance = await token.balanceOf(account);
          setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

          // Get list of all accounts connected to MetaMask
          const accounts = await provider.listAccounts();
          setAccounts(accounts);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isUploading) {
      toast.info("Uploading file to IPFS...", {
        autoClose: false,
      });
    } else {
      toast.dismiss();
    }
  }, [isUploading]);

  const handleListing = async (e) => {
    e.preventDefault();
    // if (token && file) {
    //   try {
    //     // Upload file to IPFS
    //     const result = await uploadFileToPinata(file, setIsUploading);
    //     const ipfsHash = result.IpfsHash;

    //     // List token for sale with IPFS hash
    //     const tx = await token.listTokenForSale(
    //       ethers.utils.parseUnits(amountCTKN, 18),
    //       ethers.utils.parseEther(priceETH),
    //       ipfsHash
    //     );
    //     await tx.wait();
    //     alert("Listing and file upload successful!");
    //   } catch (error) {
    //     console.error("Listing and file upload failed", error);
    //     alert("Listing and file upload failed: " + error.message);
    //   }
    if (token) {
      try {
        // Upload file to IPFS
        // const result = await uploadFileToPinata(file, setIsUploading);
        const ipfsHash = "";

        // List token for sale with IPFS hash
        const tx = await token.listTokenForSale(
          ethers.utils.parseUnits(amountCTKN, 18),
          ethers.utils.parseEther(priceETH),
          ipfsHash,
          secretKey
        );
        await tx.wait();
        alert("Listing and file upload successful!");
      } catch (error) {
        console.error("Listing and file upload failed", error);
        alert("Listing and file upload failed: " + error.message);
      }
    } else {
      alert("Please select a file and enter listing details first");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  return (
    <div id="list-tokens" className="container mx-auto p-6">
      <ToastContainer />
      <div className="mb-8 p-6 bg-green-500 text-white rounded-2xl shadow-lg">
        <div className="text-center text-2xl font-bold">
          Carbon Credit Balance:{" "}
          {isLoading ? `Loading...` : `${ctknBalance} CTKN`}
        </div>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6">List Tokens for Sale</h2>
        <form onSubmit={handleListing} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">
              Amount to List:
            </label>
            <input
              type="number"
              value={amountCTKN}
              onChange={(e) => [
                setAmountCTKN(e.target.value),
                setPriceETH(`${e.target.value * 0.01}`),
              ]}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          {/* <div>
            <label className="block text-lg font-medium mb-2">
              Upload File:
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div> */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
          >
            List for Sale
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListTokenForSale;
