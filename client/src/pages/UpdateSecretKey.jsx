import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "../CarbonToken.json"; // Ensure this ABI is up-to-date
import { uploadFileToPinata } from "../utils/PinataIPFS";
import * as pdfjsLib from "pdfjs-dist/webpack";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const UpdateSecretKey = ({}) => {
  const ethers = require("ethers");
  const [newSecretKey, setNewSecretKey] = useState("");

  const handleUpdateSecretKey = async (e) => {
    e.preventDefault();
    if (!newSecretKey) {
      alert("Please provide a new secret key");
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

        // Update the secret key
        const tx = await token.updateSecretKey(newSecretKey);
        await tx.wait();
        alert("Secret key updated successfully");
      }
    } catch (error) {
      console.error("Updating secret key failed", error);
      alert("Updating secret key failed");
    }
  };

  return (
    <div className="flex flex-col items-center p-10 bg-red-500 text-white rounded-2xl shadow-lg w-full max-w-md mt-10">
      <div className="text-xl font-bold mb-4 text-center">
        Update Secret Key
      </div>
      <form
        onSubmit={handleUpdateSecretKey}
        className="flex flex-col items-center space-y-4 w-full"
      >
        <input
          type="text"
          placeholder="New Secret Key"
          value={newSecretKey}
          onChange={(e) => setNewSecretKey(e.target.value)}
          className="p-2 border border-gray-400 rounded w-full text-black"
        />
        <button
          type="submit"
          className="p-2 bg-yellow-500 text-white rounded w-full"
        >
          Update Secret Key
        </button>
      </form>
    </div>
  );
};

export default UpdateSecretKey;
