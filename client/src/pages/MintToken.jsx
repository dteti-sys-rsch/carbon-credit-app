import React, { useEffect, useState } from "react";
import { uploadFileToPinata, deleteFileFromPinata } from "../utils/PinataIPFS";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectToEthereum, generateSignature } from "../utils/Logic";

import * as pdfjsLib from "pdfjs-dist/webpack";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MintToken = ({ account, setAccount }) => {
  const ethers = require("ethers");
  const [mintAmount, setMintAmount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [files, setFiles] = useState([null]);
  const [isTokensMinted, setTokensMinted] = useState(false);
  const [isFileInvalid, setFileInvalid] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [mintingHistory, setMintingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMintingHistory = async (token, account) => {
    const filter = token.filters.CertificateMinted();
    const events = await token.queryFilter(filter);
    return events.map((event) => ({
      account: event.args.account,
      amount: ethers.utils.formatUnits(event.args.amount, 18),
      ipfsHash: event.args.ipfsHash,
      transactionHash: event.transactionHash,
    }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { account, token } = await connectToEthereum();
        setAccount(account);

        const history = await fetchMintingHistory(token, account);
        setMintingHistory(history);
        setIsLoading(false);
      } catch (error) {
        toast.error(error.message);
      }
    };
    init();
  });

  useEffect(() => {
    if (isUploading) {
      toast.info("Checking Certificate...", {
        autoClose: false,
        toastId: "uploadingToast",
      });
    } else {
      toast.dismiss("uploadingToast");
    }
  }, [isUploading]);

  useEffect(() => {
    if (isDeleting) {
      toast.error(
        <div>
          Mint Token CTKN Failed
          <br />
          Reverting Certificate...
        </div>,
        {
          autoClose: false,
          toastId: "deletingToast",
        }
      );
    } else {
      toast.dismiss("deletingToast");
    }
  }, [isDeleting]);

  useEffect(() => {
    if (isTokensMinted) {
      toast.success("Token CTKN Minted Successfully!", {
        autoClose: true,
        toastId: "mintedToast",
      });
    } else {
      toast.dismiss("mintedToast");
    }
  }, [isTokensMinted]);

  useEffect(() => {
    if (isFileInvalid) {
      toast.error(
        <div>
          Certificate cannot be verified
          <br />
          Document invalid.
        </div>,
        {
          autoClose: true,
          toastId: "invalidFileToast",
        }
      );
    } else {
      toast.dismiss("invalidFileToast");
    }
  }, [isFileInvalid]);

  useEffect(() => {
    if (isDuplicate) {
      toast.error(
        <div>
          Certificate cannot be verified
          <br />
          Certificate already minted.
        </div>,
        {
          autoClose: true,
          toastId: "duplicateToast",
        }
      );
    } else {
      toast.dismiss("duplicateToast");
    }
  }, [isDuplicate]);

  const extractMintAmountFromPdf = async (file) => {
    if (!file) return;

    setMintAmount("");
    setFileInvalid(false);
    setFiles(file);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let text = "";

      const processPageText = async (page) => {
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          text += item.str + " ";
        });
      };

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        await processPageText(page);
      }

      const match = text.match(/(\d+(\.\d+)?)\s*MT\s*of\s*CO2\s*emissions/);
      if (match) {
        setMintAmount(`${match[1] * 1000}`);
      } else {
        setFileInvalid(true);
      }
    };

    reader.onerror = (error) => {
      toast.error(
        <div>
          Error reading PDF file <br /> {error.message}
        </div>
      );
    };
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!mintAmount) {
      toast.error("Please provide a certificate in PDF format that is valid.");
      return;
    } else if (!account) {
      toast.error("Account not connected.");
      return;
    }

    let ipfsHash = "";

    try {
      const { token, provider } = await connectToEthereum();
      const result = await uploadFileToPinata(files, setIsUploading);
      ipfsHash = result.IpfsHash;
      if (result.isDuplicate) {
        setIsDuplicate(true);
        return;
      }

      const signature = await generateSignature(account, provider);
      const tx = await token.mint(
        account,
        ethers.utils.parseUnits(mintAmount, 18),
        ipfsHash,
        signature
      );
      await tx.wait();
      setTokensMinted(true);
    } catch (error) {
      setTokensMinted(false);
      try {
        await deleteFileFromPinata(ipfsHash, setIsDeleting);
      } catch (deleteError) {
        toast.error(
          <div>
            Failed to delete file from Pinata <br /> {deleteError}
          </div>
        );
      }
    }
  };

  return (
    <div className="container mx-auto px-12 py-8 md:px-20">
      <ToastContainer />
      <div className="mt-10 flex flex-row row-auto items-center gap-8">
        <div className="flex flex-col items-center p-10 bg-[#E7F0DC] text-black rounded-2xl shadow-lg w-full self-start">
          <div className="text-xl font-bold mb-4 text-center">
            Mint Carbon Quota Certificates to CTKN
          </div>
          <form
            onSubmit={handleMint}
            className="flex flex-col items-center space-y-4 w-full"
          >
            <label className="self-start text-left" htmlFor="certificate">
              Choose Certificate File (PDF)
            </label>
            <input
              id="certificate"
              type="file"
              accept="application/pdf"
              onChange={(e) => extractMintAmountFromPdf(e.target.files[0])}
              className="p-2 border border-gray-400 rounded w-full"
            />
            <label className="self-start text-left" htmlFor="amountCTKN">
              Amount CTKN
            </label>
            <input
              id="amountCTKN"
              type="number"
              placeholder="Amount"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="p-2 border border-gray-400 rounded w-full text-black cursor-not-allowed"
              readOnly
            />
            <button
              type="submit"
              className="p-2 bg-[#79AC78] text-[#000] rounded w-full hover:bg-[#254336] hover:text-white transition duration-300 ease-in-out"
            >
              Mint Tokens
            </button>
          </form>
        </div>
        <div className="w-full self-start">
          <h2 className="text-xl font-bold mb-4 text-center">
            Minting History
          </h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : mintingHistory.length > 0 ? (
            <ul>
              {mintingHistory.map((entry, index) => (
                <li key={index} className="p-4 border-b border-gray-300">
                  <p>Account: {entry.account}</p>
                  <p className="mb-3">Amount: {entry.amount} CTKN</p>
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${entry.ipfsHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#06D001] text-[#000] px-4 py-2 mt-2 rounded-lg hover:bg-[#9BEC00] transition duration-300 ease-in-out"
                  >
                    View Certificate
                  </a>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${entry.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#071952] text-[#fff] px-4 py-2 mt-2 rounded-lg hover:bg-[#088395] transition duration-300 ease-in-out ml-3"
                  >
                    View on Etherscan
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No minting history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MintToken;
