import { useEffect, useState } from "react";
import { uploadFileToPinata } from "../PinataIPFS";
import CarbonCreditTokenABI from "../CarbonToken.json"; // Add ABI JSON file

const tokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const Listings = ({ account, setAccount, setAccounts }) => {
  const ethers = require("ethers");
  const [amountCTKN, setAmountCTKN] = useState("");
  const [priceETH, setPriceETH] = useState("");
  const [token, setToken] = useState(null);
  const [listings, setListings] = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);
  const [isLoadingSold, setIsLoadingSold] = useState(true);

  const fetchListings = async (token, account) => {
    try {
      const listedFilter = token.filters.TokenListed();
      const listingEvents = await token.queryFilter(listedFilter);

      const purchasedFilter = token.filters.TokenPurchased();
      const purchaseEvents = await token.queryFilter(purchasedFilter);

      const deletedFilter = token.filters.ListingDeleted();
      const deletedEvents = await token.queryFilter(deletedFilter);

      const activeListingsMap = {};

      listingEvents.forEach((event) => {
        const seller = event.args.seller;
        const amountCTKN = ethers.utils.formatUnits(event.args.amountCTKN, 18);
        const priceETH = ethers.utils.formatEther(event.args.priceETH);
        const listingIndex = event.args.listingIndex.toNumber();
        const ipfsHash = event.args.ipfsHash;

        if (!activeListingsMap[seller]) {
          activeListingsMap[seller] = [];
        }

        activeListingsMap[seller].push({
          amountCTKN,
          priceETH,
          active: true,
          listingIndex,
          ipfsHash,
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

      deletedEvents.forEach((event) => {
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
          if (listing.active && seller !== account) {
            activeListings.push({
              seller,
              amountCTKN: listing.amountCTKN,
              priceETH: listing.priceETH,
              listingIndex: listing.listingIndex,
              ipfsHash: listing.ipfsHash,
              active: true,
            });
          }
        });
      });

      setListings(activeListings);
      setIsLoadingAvailable(false);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  const fetchSoldListings = async (token, account) => {
    try {
      const soldListingEvents = await token.queryFilter(
        token.filters.TokenPurchased(null, account)
      );
      const soldListings = soldListingEvents.map((event) => {
        return {
          buyer: event.args.buyer,
          amountCTKN: ethers.utils.formatUnits(event.args.amountCTKN, 18),
          priceETH: ethers.utils.formatEther(event.args.priceETH),
          ipfsHash: event.args.ipfsHash,
        };
      });
      setSoldListings(soldListings);
      setIsLoadingSold(false);
    } catch (error) {
      console.error("Failed to fetch sold listings", error);
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
          setToken(token);

          // fetch available listings
          fetchListings(token, account);
          fetchSoldListings(token, account);

          // Get list of all accounts connected to MetaMask
          const accounts = await provider.listAccounts();
          setAccounts(accounts);
        }
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

  const handleBuy = async (seller, listingIndex, priceETH) => {
    if (token) {
      try {
        const tx = await token.buyToken(seller, listingIndex, secretKey, {
          value: ethers.utils.parseEther(priceETH),
        });
        await tx.wait();
        alert("Purchase successful!");
        fetchListings(token); // Refresh the listings
        fetchSoldListings(token, account); // Refresh the sold listings
      } catch (error) {
        console.error("Purchase failed", error);
        alert("Purchase failed: " + error.message);
      }
    } else {
      alert("Please connect your wallet first");
    }
  };

  const handleDelete = async (listingIndex) => {
    if (token) {
      try {
        const tx = await token.deleteListing(listingIndex);
        await tx.wait();
        alert("Listing deleted successfully!");
        fetchListings(token); // Refresh the listings
      } catch (error) {
        console.error("Deletion failed", error);
        alert("Deletion failed: " + error.message);
      }
    } else {
      alert("Please connect your wallet first");
    }
  };

  return (
    <div id="available-listings" className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Credits</h2>
      <ul className="space-y-4">
        {isLoadingAvailable ? (
          <div>Loading...</div>
        ) : listings.length > 0 ? (
          listings.map((listing, index) => (
            <li key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">Seller: {listing.seller}</p>
              <p>Amount: {listing.amountCTKN} CTKN</p>
              <p>Price: {listing.priceETH} ETH</p>

              <div>
                {listing.seller === account && listing.active && (
                  <>
                    <p>
                      File:{" "}
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${listing.ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View File
                      </a>
                    </p>
                    <button
                      onClick={() => handleDelete(listing.listingIndex)}
                      className="bg-red-500 text-white px-4 py-2 mt-2 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
                {listing.seller !== account && listing.active && (
                  <button
                    onClick={() =>
                      handleBuy(
                        listing.seller,
                        listing.listingIndex,
                        listing.priceETH
                      )
                    }
                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded-lg hover:bg-green-600"
                  >
                    Buy
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <div>No listings available</div>
        )}
      </ul>
    </div>
  );
};

export default Listings;
