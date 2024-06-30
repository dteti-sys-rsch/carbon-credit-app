import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectToEthereum } from "../utils/Logic";

const Homepage = ({ account, setAccount }) => {
  const ethers = require("ethers");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { account, token } = await connectToEthereum();
        setAccount(account);

        // get balance CTKN and ETH
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

        const ethBalance = await token.provider.getBalance(account);
        const formattedEthBalance = parseFloat(
          ethers.utils.formatEther(ethBalance)
        ).toFixed(4);
        setEthBalance(formattedEthBalance);

        setIsLoading(false);
      } catch (error) {}
    };
    init();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <ToastContainer />
      <div className="flex flex-col space-y-6 justify-center">
        <div className="text-center items-center p-6 bg-[#254336] text-white rounded-2xl shadow-lg">
          <div className="text-2xl">Carbon Token Balance</div>
          <div className="text-2xl mt-4 font-bold">
            {isLoading ? "Loading..." : `${ctknBalance} CTKN`}
          </div>
        </div>
        <div className="text-center items-center p-6 bg-[#E7F0DC] text-black rounded-2xl shadow-lg">
          <div className="text-2xl">ETH Balance</div>
          <div className="text-2xl mt-4 font-bold">
            {isLoading ? "Loading..." : `${ethBalance} ETH`}
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center">
        <div className="text-xl text-center mb-3">
          Have a Carbon Offset Certificates?
        </div>
        <Link to="/mint-token">
          <button
            type="button"
            class="btn btn-outline-primary bg-[#B7B597] text-black rounded-xl p-4 text-xl font-semibold"
          >
            Mint them to CTKN
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Homepage;
