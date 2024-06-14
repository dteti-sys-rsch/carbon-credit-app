import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "../CarbonToken.json"; // Add ABI JSON file
import { uploadFileToPinata } from "../PinataIPFS";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const Homepage = ({ account, setAccount, setAccounts, setBalances }) => {
  const ethers = require("ethers");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mintAmount, setMintAmount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([null]);

  const fetchBalances = async (accounts, token) => {
    try {
      const balances = {};
      for (const acc of accounts) {
        const ctknBalance = await token.balanceOf(acc);
        const ethBalance = await token.provider.getBalance(acc);
        balances[acc] = {
          ctkn: ethers.utils.formatUnits(ctknBalance, 18),
          eth: ethers.utils.formatEther(ethBalance),
        };
      }
      setBalances(balances);
    } catch (error) {
      console.error("Failed to fetch balances", error);
    }
  };

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
          const ctknBalance = await token.balanceOf(account);
          setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

          const ethBalance = await token.provider.getBalance(account);
          // Format the balance to four decimal places
          const formattedEthBalance = parseFloat(
            ethers.utils.formatEther(ethBalance)
          ).toFixed(4);
          setEthBalance(formattedEthBalance);

          // Get list of all accounts connected to MetaMask
          const accounts = await provider.listAccounts();
          setAccounts(accounts);
          fetchBalances(accounts, token);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, [fetchBalances, setAccount, setAccounts]);

  useEffect(() => {
    if (isUploading) {
      toast.info("Checking Certificate...", {
        autoClose: false,
      });
    } else {
      toast.dismiss();
    }
  }, [isUploading]);

  const extractMintAmountFromPdf = async (file) => {
    if (file === undefined) return;
    setFiles(file);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          text += item.str + " ";
        });
      }

      console.log("Extracted text:", text);

      // Extracting the carbon offset value from the PDF text
      const match = text.match(/(\d+(\.\d+)?)\s*MT\s*of\s*CO2\s*emissions/);
      if (match) {
        setMintAmount(`${match[1] * 1000}`);
      } else {
        alert("Certificate cannot be verified.");
      }
      reader.onerror = (error) => {
        console.error("Error reading PDF file:", error);
      };
    };
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!account || !mintAmount) {
      alert("Please provide a PDF with a valid mint amount");
      return;
    }

    try {
      // Connect to the contract
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const token = new ethers.Contract(
          tokenAddress,
          CarbonCreditTokenABI.abi,
          signer
        );

        const result = await uploadFileToPinata(files, setIsUploading);
        if (result.isDuplicate) {
          alert("Error! Can't mint duplicate certificate.");
          return;
        }

        // Mint the tokens
        const tx = await token.mint(
          account,
          ethers.utils.parseUnits(mintAmount, 18),
          secretKey
        );
        await tx.wait();

        // Update balances
        const accounts = await provider.listAccounts();
        fetchBalances(accounts, token);
        alert("Tokens minted successfully");
      }
    } catch (error) {
      console.error("Minting failed", error);
      alert("Minting failed");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <div id="home">
        <div className="flex justify-center space-x-10">
          <div className="flex flex-col items-center p-10 bg-[#6B8A7A] text-white rounded-2xl shadow-lg">
            <div className="text-xl font-bold">Carbon Credit Balance</div>
            <div className="text-2xl mt-4">
              {isLoading ? "Loading..." : `${ctknBalance} CTKN`}
            </div>
          </div>
          <div className="flex flex-col items-center p-10 bg-[#EEEEEE] text-black rounded-2xl shadow-lg">
            <div className="text-xl font-bold">ETH Balance</div>
            <div className="text-2xl mt-4">
              {isLoading ? "Loading..." : `${ethBalance} ETH`}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center">
          <div className="flex flex-col items-center p-10 bg-blue-500 text-white rounded-2xl shadow-lg w-full max-w-md">
            <div className="text-xl font-bold mb-4 text-center">
              Mint Carbon Offset Certificates to CTKN
            </div>
            <form
              onSubmit={handleMint}
              className="flex flex-col items-center space-y-4 w-full"
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => extractMintAmountFromPdf(e.target.files[0])}
                className="p-2 border border-gray-400 rounded w-full"
              />
              <input
                type="number"
                placeholder="Amount"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="p-2 border border-gray-400 rounded w-full text-black cursor-not-allowed"
                readOnly
              />
              <button
                type="submit"
                className="p-2 bg-green-500 text-white rounded w-full"
              >
                Mint Tokens
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
