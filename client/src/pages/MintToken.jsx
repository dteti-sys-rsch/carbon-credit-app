import React, { useEffect, useState } from "react";
import { uploadFileToPinata, deleteFileFromPinata } from "../utils/PinataIPFS";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectToEthereum } from "../utils/Logic";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const MintToken = ({ account, setAccount }) => {
  const ethers = require("ethers");
  const [mintAmount, setMintAmount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [files, setFiles] = useState([null]);
  const [IpfsHash, setIpfsHash] = useState("");
  const [isTokensMinted, setTokensMinted] = useState();
  const [isFileInvalid, setFileInvalid] = useState();
  const [isDuplicate, setIsDuplicate] = useState();

  useEffect(() => {
    const init = async () => {
      try {
        const { account } = await connectToEthereum();
        setAccount(account);
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isUploading) {
      toast.info("Checking Certificate...", {
        autoClose: false,
      });
    } else {
      toast.dismiss();
    }
  }, [isUploading]);

  useEffect(() => {
    if (isDeleting) {
      toast.error("Reverting Certificate", {
        autoClose: false,
      });
    } else {
      toast.dismiss();
    }
  }, [isDeleting]);

  useEffect(() => {
    if (isTokensMinted === true) {
      toast.success("Token CTKN Minted Successfully!", {
        autoClose: true,
      });
    } else if (isTokensMinted === false) {
      toast.success("Token CTKN Minted Successfully!", {
        autoClose: true,
      });
    }
  }, [isTokensMinted]);

  useEffect(() => {
    if (isFileInvalid) {
      toast.error("Certificate cannot be verified. Document invalid.", {
        autoClose: true,
      });
    } else {
      toast.dismiss();
    }
  }, [isFileInvalid]);

  useEffect(() => {
    if (isDuplicate) {
      toast.error(
        "Certificate cannot be verified. Certificate already minted.",
        {
          autoClose: true,
        }
      );
    } else {
      toast.dismiss();
    }
  }, [isDuplicate]);

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

      // Extracting the carbon offset value from the PDF text
      const match = text.match(/(\d+(\.\d+)?)\s*MT\s*of\s*CO2\s*emissions/);
      if (match) {
        setMintAmount(`${match[1] * 1000}`);
      } else {
        setFileInvalid(true);
      }
      reader.onerror = (error) => {
        console.error("Error reading PDF file:", error);
      };
    };
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!account || !mintAmount) {
      alert("Please provide a certificate in PDF format that valid.");
      return;
    }

    try {
      const { token } = await connectToEthereum();
      const result = await uploadFileToPinata(files, setIsUploading);
      setIpfsHash(result.IpfsHash);
      if (result.isDuplicate) {
        setIsDuplicate(true);
        return;
      }

      // Mint the tokens
      const tx = await token.mint(
        account,
        ethers.utils.parseUnits(mintAmount, 18),
        secretKey
      );
      await tx.wait();
      setTokensMinted(true);
    } catch (error) {
      console.error("Minting failed", error);
      setTokensMinted(false);
      try {
        await deleteFileFromPinata(IpfsHash, setIsDeleting); // Delete the uploaded file from Pinata when transaction cancel/rejected
      } catch (deleteError) {
        console.error("Failed to delete file from Pinata", deleteError);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <div className="mt-10 flex flex-col items-center">
        <div className="flex flex-col items-center p-10 bg-[#E7F0DC] text-black rounded-2xl shadow-lg w-full max-w-md">
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
              className="p-2 bg-[#059212] text-white rounded w-full"
            >
              Mint Tokens
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MintToken;
