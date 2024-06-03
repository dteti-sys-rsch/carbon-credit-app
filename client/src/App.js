import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "./CarbonToken.json"; // Add ABI JSON file
import { uploadFileToPinata } from "./PinataIPFS";

const tokenAddress = "0x7969c5eD335650692Bc04293B07F5BF2e7A673C0";

function App() {
  const ethers = require("ethers");
  const [account, setAccount] = useState("");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [amountCTKN, setAmountCTKN] = useState("");
  const [priceETH, setPriceETH] = useState("");
  const [listings, setListings] = useState([]);
  const [token, setToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        // Connect to Metamask
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await window.ethereum.enable();
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
          const ctknBalance = await token.balanceOf(account);
          setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

          const ethBalance = await token.provider.getBalance(account);
          setEthBalance(ethers.utils.formatEther(ethBalance));

          // Get list of all accounts connected to MetaMask
          const accounts = await provider.listAccounts();
          setAccounts(accounts);
          fetchBalances(accounts, token);
          fetchListings(token);
        }
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

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

  const fetchListings = async (token) => {
    try {
      const listedFilter = token.filters.TokenListed();
      const listingEvents = await token.queryFilter(listedFilter);

      const purchasedFilter = token.filters.TokenPurchased();
      const purchaseEvents = await token.queryFilter(purchasedFilter);

      const activeListingsMap = {};

      listingEvents.forEach((event) => {
        const seller = event.args.seller;
        const amountCTKN = ethers.utils.formatUnits(event.args.amountCTKN, 18);
        const priceETH = ethers.utils.formatEther(event.args.priceETH);
        const listingIndex = event.args.listingIndex.toNumber();

        if (!activeListingsMap[seller]) {
          activeListingsMap[seller] = [];
        }

        activeListingsMap[seller].push({
          amountCTKN,
          priceETH,
          active: true,
          listingIndex,
        });
      });

      purchaseEvents.forEach((event) => {
        const seller = event.args.seller;
        const listingIndex = event.args.listingIndex.toNumber();

        if (activeListingsMap[seller]) {
          const listing = activeListingsMap[seller].find(
            (l) => l.listingIndex === listingIndex
          );
          if (listing) {
            listing.active = false;
          }
        }
      });

      const activeListings = [];
      Object.keys(activeListingsMap).forEach((seller) => {
        activeListingsMap[seller].forEach((listing) => {
          if (listing.active) {
            activeListings.push({
              seller,
              amountCTKN: listing.amountCTKN,
              priceETH: listing.priceETH,
              listingIndex: listing.listingIndex,
              active: true,
            });
          }
        });
      });

      setListings(activeListings);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  const handleListing = async (e) => {
    e.preventDefault();
    if (token) {
      try {
        const tx = await token.listTokenForSale(
          ethers.utils.parseUnits(amountCTKN, 18),
          ethers.utils.parseEther(priceETH)
        );
        await tx.wait();
        fetchListings(token);
        alert("Listing successful!");
      } catch (error) {
        console.error("Listing failed", error);
        alert("Listing failed: " + error.message);
      }
    }
  };

  const handleBuy = async (seller, listingIndex, priceETH) => {
    if (token && accounts.length > 0) {
      try {
        const tx = await token.buyToken(seller, listingIndex, {
          value: ethers.utils.parseEther(priceETH),
        });
        await tx.wait();

        fetchListings(token); // Refresh listings after purchase

        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));
        const ethBalance = await token.provider.getBalance(account);
        setEthBalance(ethers.utils.formatEther(ethBalance));
        alert("Purchase successful!");
      } catch (error) {
        console.error("Purchase failed", error);
        alert("Purchase failed: " + error.message);
      }
    } else {
      console.error("Accounts array is empty or not initialized");
      alert("Accounts array is empty or not initialized");
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (file) {
      try {
        const result = await uploadFileToPinata(file);
        setIpfsHash(result.IpfsHash);
        alert("File uploaded successfully!");
      } catch (error) {
        console.error("File upload failed", error);
        alert("File upload failed: " + error.message);
      }
    } else {
      alert("Please select a file first");
    }
  };

  return (
    <div>
      <h1>Carbon Credit Trading System</h1>
      <p>Your account: {account}</p>
      <p>Your Carbon Credit Balance: {ctknBalance} CTKN</p>
      <p>Your ETH Balance: {ethBalance} ETH</p>
      <h2>List Tokens for Sale</h2>
      <form onSubmit={handleListing}>
        <div>
          <label>Amount to List:</label>
          <input
            type="number"
            value={amountCTKN}
            onChange={(e) => [
              setAmountCTKN(e.target.value),
              setPriceETH(`${e.target.value * 0.01}`),
            ]}
            required
          />
        </div>
        {/* <div>
          <label>Price in ETH:</label>
          <input
            type="number"
            value={priceETH}
            onChange={(e) => setPriceETH(e.target.value)}
            required
          />
        </div> */}
        <button type="submit">List for Sale</button>
      </form>
      <h2>Upload File</h2>
      <form onSubmit={handleFileUpload}>
        <div>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Upload File</button>
      </form>
      {ipfsHash && (
        <div>
          <h3>Uploaded File:</h3>
          <p>IPFS Hash: {ipfsHash}</p>
          <a
            href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View File
          </a>
        </div>
      )}
      <h2>Available Listings</h2>
      <ul>
        {listings.map((listing, index) => (
          <li key={index}>
            <p>Seller: {listing.seller}</p>
            <p>Amount: {listing.amountCTKN} CTKN</p>
            <p>Price: {listing.priceETH} ETH</p>
            {listing.seller !== account && listing.active && (
              <button
                onClick={() =>
                  handleBuy(
                    listing.seller,
                    listing.listingIndex,
                    listing.priceETH
                  )
                }
              >
                Buy
              </button>
            )}
          </li>
        ))}
      </ul>
      <h2>Connected Accounts</h2>
      <ul>
        {accounts.map((acc) => (
          <li key={acc}>
            <p>Address: {acc}</p>
            <p>Balance: {balances[acc]?.ctkn} CTKN</p>
            <p>Balance: {balances[acc]?.eth} ETH</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
