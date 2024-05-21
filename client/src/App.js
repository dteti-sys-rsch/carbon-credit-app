import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "./CarbonToken.json"; // Add ABI JSON file

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const ethers = require("ethers");
  const [account, setAccount] = useState("");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amountCTKN, setAmountCTKN] = useState("");
  const [priceETH, setPriceETH] = useState("");
  const [listings, setListings] = useState([]);
  const [token, setToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});

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

  // const fetchListings = async (token) => {
  //   try {
  //     // Fetch all TokenListed events
  //     const listedFilter = token.filters.TokenListed();
  //     const listingEvents = await token.queryFilter(listedFilter);

  //     // Fetch all TokenPurchased events
  //     const purchasedFilter = token.filters.TokenPurchased();
  //     const purchaseEvents = await token.queryFilter(purchasedFilter);

  //     // Create a map to track active listings
  //     const activeListingsMap = {};

  //     listingEvents.forEach((event) => {
  //       const seller = event.args.seller;
  //       const amountCTKN = ethers.utils.formatUnits(event.args.amountCTKN, 18);
  //       const priceETH = ethers.utils.formatEther(event.args.priceETH);

  //       if (!activeListingsMap[seller]) {
  //         activeListingsMap[seller] = [];
  //       }

  //       activeListingsMap[seller].push({
  //         amountCTKN,
  //         priceETH,
  //         active: true,
  //       });
  //     });

  //     purchaseEvents.forEach((event) => {
  //       const seller = event.args.seller;
  //       const amountCTKN = ethers.utils.formatUnits(event.args.amountCTKN, 18);
  //       const priceETH = ethers.utils.formatEther(event.args.priceETH);

  //       if (activeListingsMap[seller]) {
  //         const listing = activeListingsMap[seller].find(
  //           (l) => l.amountCTKN === amountCTKN && l.priceETH === priceETH
  //         );
  //         if (listing) {
  //           listing.active = false;
  //         }
  //       }
  //     });

  //     // Filter only active listings
  //     const activeListings = [];
  //     Object.keys(activeListingsMap).forEach((seller) => {
  //       activeListingsMap[seller].forEach((listing) => {
  //         if (listing.active) {
  //           activeListings.push({
  //             seller,
  //             amountCTKN: listing.amountCTKN,
  //             priceETH: listing.priceETH,
  //             active: true,
  //           });
  //         }
  //       });
  //     });

  //     setListings(activeListings);
  //     console.log(activeListings);
  //   } catch (error) {
  //     console.error("Failed to fetch listings", error);
  //   }
  // };

  const fetchListings = async (token) => {
    try {
      // Fetch all TokenListed events
      const listedFilter = token.filters.TokenListed();
      const listingEvents = await token.queryFilter(listedFilter);

      // Fetch all TokenPurchased events
      const purchasedFilter = token.filters.TokenPurchased();
      const purchaseEvents = await token.queryFilter(purchasedFilter);

      // Create a map to track active listings
      const activeListingsMap = {};

      listingEvents.forEach((event) => {
        const seller = event.args.seller;
        const amountCTKN = ethers.utils.formatUnits(event.args.amountCTKN, 18);
        const priceETH = ethers.utils.formatEther(event.args.priceETH);

        if (!activeListingsMap[seller]) {
          activeListingsMap[seller] = [];
        }

        activeListingsMap[seller].push({
          amountCTKN,
          priceETH,
          active: true,
        });
      });

      purchaseEvents.forEach((event) => {
        const seller = event.args.seller;
        const amountCTKN = ethers.utils.formatUnits(event.args.amountCTKN, 18);
        const priceETH = ethers.utils.formatEther(event.args.priceETH);

        if (activeListingsMap[seller]) {
          const listing = activeListingsMap[seller].find(
            (l) => l.amountCTKN === amountCTKN && l.priceETH === priceETH
          );
          if (listing) {
            listing.active = false;
          }
        }
      });

      // Filter only active listings
      const activeListings = [];
      Object.keys(activeListingsMap).forEach((seller) => {
        activeListingsMap[seller].forEach((listing) => {
          if (listing.active) {
            activeListings.push({
              seller,
              amountCTKN: listing.amountCTKN,
              priceETH: listing.priceETH,
              active: true,
            });
          }
        });
      });

      setListings(activeListings);
      console.log(activeListings);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  // const handleTransfer = async (e) => {
  //   e.preventDefault();
  //   if (token) {
  //     try {
  //       const amountETH = "100";
  //       // Check if the recipient has approved the smart contract to spend ETH
  //       const recipientEthBalance = await token.provider.getBalance(recipient);
  //       if (ethers.utils.parseEther(amountETH).gt(recipientEthBalance)) {
  //         alert("Recipient does not have enough ETH");
  //         return;
  //       }

  //       const tx = await token.transferCTKNWithETHBack(
  //         recipient,
  //         ethers.utils.parseUnits(amountCTKN, 18),
  //         ethers.utils.parseEther(amountETH),
  //         {
  //           value: ethers.utils.parseEther(amountETH), // Send ETH with the transaction
  //         }
  //       );
  //       await tx.wait();
  //       const ctknBalance = await token.balanceOf(account);
  //       setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

  //       const ethBalance = await token.provider.getBalance(account);
  //       setEthBalance(ethers.utils.formatEther(ethBalance));

  //       fetchBalances(accounts, token); // Update balances after transfer
  //       alert("Transfer successful!");
  //     } catch (error) {
  //       console.error("Transfer failed", error);
  //       alert("Transfer failed: " + error.message);
  //     }
  //   }
  // };

  // const handleListing = async (e) => {
  //   e.preventDefault();
  //   if (token) {
  //     try {
  //       const tx = await token.listTokenForSale(
  //         ethers.utils.parseUnits(amountCTKN, 18),
  //         ethers.utils.parseEther(priceETH)
  //       );
  //       await tx.wait();
  //       fetchListings(token);
  //       alert("Listing successful!");
  //     } catch (error) {
  //       console.error("Listing failed", error);
  //       alert("Listing failed: " + error.message);
  //     }
  //   }
  // };

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

  // const handleBuy = async (seller, listingIndex, priceETH) => {
  //   if (token && accounts.length > 0) {
  //     try {
  //       const tx = await token.buyToken(seller, listingIndex, {
  //         value: ethers.utils.parseEther(priceETH),
  //       });
  //       await tx.wait();

  //       // Update listings after purchase
  //       const updatedListings = [...listings];
  //       updatedListings.splice(listingIndex, 1);
  //       setListings(updatedListings);

  //       fetchListings(token); // Update listings after purchase
  //       const ctknBalance = await token.balanceOf(account);
  //       setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));
  //       const ethBalance = await token.provider.getBalance(account);
  //       setEthBalance(ethers.utils.formatEther(ethBalance));
  //       alert("Purchase successful!");
  //     } catch (error) {
  //       console.error("Purchase failed", error);
  //       alert("Purchase failed: " + error.message);
  //     }
  //   } else {
  //     console.error("Accounts array is empty or not initialized");
  //     alert("Accounts array is empty or not initialized");
  //   }
  // };

  const handleBuy = async (seller, listingIndex, priceETH) => {
    if (token && accounts.length > 0) {
      try {
        const tx = await token.buyToken(seller, listingIndex, {
          value: ethers.utils.parseEther(priceETH),
        });
        await tx.wait();

        // Update listings after purchase
        const updatedListings = [...listings];
        updatedListings.splice(listingIndex, 1);
        setListings(updatedListings);

        fetchListings(token); // Update listings after purchase
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
            onChange={(e) => setAmountCTKN(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price in ETH:</label>
          <input
            type="number"
            value={priceETH}
            onChange={(e) => setPriceETH(e.target.value)}
            required
          />
        </div>
        <button type="submit">List for Sale</button>
      </form>
      <h2>Available Listings</h2>
      <ul>
        {listings.map((listing, index) => (
          // <li key={index}>
          //   <p>Seller: {listing.seller}</p>
          //   <p>Amount: {listing.amountCTKN} CTKN</p>
          //   <p>Price: {listing.priceETH} ETH</p>
          //   <button
          //     onClick={() => handleBuy(listing.seller, index, listing.priceETH)}
          //   >
          //     Buy
          //   </button>
          // </li>
          <li key={index}>
            <p>Seller: {listing.seller}</p>
            <p>Amount: {listing.amountCTKN} CTKN</p>
            <p>Price: {listing.priceETH} ETH</p>
            {listing.seller !== account && (
              <button
                onClick={() =>
                  handleBuy(listing.seller, index, listing.priceETH)
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
