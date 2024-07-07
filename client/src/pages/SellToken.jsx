import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectToEthereum, generateSignature } from "../utils/Logic";

const SellToken = ({ account, setAccount }) => {
  const ethers = require("ethers");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [amountCTKN, setAmountCTKN] = useState("");
  const [priceETH, setPriceETH] = useState("");
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListingCreated, setIsListingCreated] = useState();

  useEffect(() => {
    const init = async () => {
      try {
        const { account, token } = await connectToEthereum();
        setAccount(account);
        setToken(token);

        // get balance CTKN of account
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));
        setIsLoading(false);
      } catch (error) {
        toast.error(error.message);
      }
    };
    init();
  });

  useEffect(() => {
    if (isListingCreated === true) {
      toast.success("Listing successfully created!", {
        autoClose: true,
      });
    }
  }, [isListingCreated]);

  const handleListing = async (e) => {
    e.preventDefault();
    if (parseFloat(amountCTKN) <= 0) {
      toast.warn("Amount must be greater than 0.");
      return;
    }
    if (token) {
      try {
        const { account, provider } = await connectToEthereum();
        const signature = await generateSignature(account, provider);

        const tx = await token.listTokenForSale(
          ethers.utils.parseUnits(amountCTKN, 18),
          ethers.utils.parseEther(priceETH),
          signature
        );
        await tx.wait();
        setIsListingCreated(true);
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));
        setAmountCTKN("");
      } catch (error) {
        setIsListingCreated(false);
        toast.error(
          <div>
            Listing failed to be created
            <br />
            {error.reason}
          </div>
        );
      }
    } else {
      toast.warn("Please connect wallet first.");
    }
  };

  return (
    <div id="list-tokens" className="container mx-auto px-12 py-8 md:px-20">
      <ToastContainer />
      <div className="mb-8 p-6 bg-[#254336] text-white rounded-2xl shadow-lg">
        <div className="text-center text-2xl font-normal">
          Carbon Token Balance:{" "}
          <span className="font-bold">
            {isLoading ? `Loading...` : `${ctknBalance} CTKN`}
          </span>
        </div>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-[#A1EEBD]">
        <h2 className="text-2xl font-bold mb-6">Sell Carbon Token </h2>
        <form onSubmit={handleListing} className="space-y-6">
          <div>
            <label className="block text-lg font-medium mb-2">
              Amount to List:
            </label>
            <input
              placeholder="Enter amount of CTKN"
              type="number"
              value={amountCTKN}
              onChange={(e) => {
                const value = e.target.value;
                if (parseFloat(value) > 0) {
                  setAmountCTKN(value);
                  setPriceETH(`${value * 0.00001}`);
                } else {
                  setAmountCTKN("");
                  setPriceETH("");
                  toast.warn("Amount must be greater than 0.");
                }
              }}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
              step="any"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#79AC78] text-[#000] p-2 rounded-lg hover:bg-[#254336] hover:text-white transition duration-300 ease-in-out"
          >
            List for Sell
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellToken;
