import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "./CarbonToken.json"; // Add ABI JSON file

const tokenAddress = "0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD";

function App() {
  const ethers = require("ethers");
  const [account, setAccount] = useState("");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amountCTKN, setAmountCTKN] = useState("");
  const [token, setToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const init = async () => {
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

        // Fetch user's CTKN balance
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

        // Fetch user's ETH balance
        const ethBalance = await provider.getBalance(account);
        setEthBalance(ethers.utils.formatEther(ethBalance));

        // Fetch list of all accounts connected to MetaMask
        const accounts = await provider.listAccounts();
        setAccounts(accounts);

        // Fetch CTKN listings
        fetchListings(token);
      }
    };
    init();
  }, []);

  const fetchListings = async (token) => {
    const numListings = await token.nextListingId();
    const listings = [];
    for (let i = 0; i < numListings; i++) {
      const listing = await token.listings(i);
      listings.push(listing);
    }
    setListings(listings);
  };

  const handleListCTKN = async (e) => {
    e.preventDefault();
    if (token && amountCTKN > 0) {
      try {
        await token.listCTKNForSale(
          ethers.utils.parseUnits(amountCTKN, 18),
          ethers.utils.parseEther("0.1")
        );
        alert("CTKN listed for sale successfully!");
        fetchListings(token); // Update listings after listing CTKN
      } catch (error) {
        console.error("Listing failed", error);
        alert("Listing failed: " + error.message);
      }
    }
  };

  const handleBuyCTKN = async (listing) => {
    if (token) {
      try {
        await token.buyCTKNFromListing(listing.id, listing.priceETH);
        alert("CTKN purchased successfully!");
        fetchListings(token); // Update listings after purchasing CTKN
        // Fetch updated balances after transaction
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));
        const ethBalance = await token.provider.getBalance(account);
        setEthBalance(ethers.utils.formatEther(ethBalance));
      } catch (error) {
        console.error("Purchase failed", error);
        alert("Purchase failed: " + error.message);
      }
    }
  };

  return (
    <div>
      <h1>Carbon Credit Trading System</h1>
      <p>Your account: {account}</p>
      <p>Your Carbon Credit Balance: {ctknBalance}</p>
      <p>Your ETH Balance: {ethBalance}</p>
      <form onSubmit={handleListCTKN}>
        <div>
          <label>Amount of CTKN to List:</label>
          <input
            type="number"
            value={amountCTKN}
            onChange={(e) => setAmountCTKN(e.target.value)}
            required
          />
        </div>
        <button type="submit">List CTKN for Sale</button>
      </form>
      <h2>CTKN Listings</h2>
      <ul>
        {listings.map((listing, index) => (
          <li key={index}>
            <p>Listing ID: {index}</p>
            <p>
              Amount: {ethers.utils.formatUnits(listing.amountCTKN, 18)} CTKN
            </p>
            <p>Price: {ethers.utils.formatEther(listing.priceETH)} ETH</p>
            <button onClick={() => handleBuyCTKN(listing)}>Buy CTKN</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
