import { useEffect, useState } from "react";
import { connectToEthereum } from "../utils/Logic";

const secretKey = process.env.REACT_APP_SECRET_KEY;

const MyToken = ({ setAccount }) => {
  const ethers = require("ethers");
  const [token, setToken] = useState(null);
  const [purchasedListings, setPurchasedListings] = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSold, setIsLoadingSold] = useState(true);
  const [listings, setListings] = useState([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);

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

      // Filter listings to only include those from the connected account
      const myListings = activeListings.filter(
        (listing) => listing.seller === account
      );

      setListings(myListings);
      setIsLoadingAvailable(false);
    } catch (error) {
      console.error("Failed to fetch listings", error);
    }
  };

  const fetchPurchasedListings = async (token, account) => {
    try {
      const purchasedFilter = token.filters.TokenPurchased(
        account,
        null,
        null,
        null
      );
      const purchasedEvents = await token.queryFilter(purchasedFilter);

      const purchasedListings = purchasedEvents.map((event) => ({
        seller: event.args.seller,
        amountCTKN: ethers.utils.formatUnits(event.args.amountCTKN, 18),
        priceETH: ethers.utils.formatEther(event.args.priceETH),
        listingIndex: event.args.listingIndex.toNumber(),
      }));

      setPurchasedListings(purchasedListings);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch purchased listings", error);
    }
  };

  const fetchSoldListings = async (token, account) => {
    try {
      const soldListingEvents = await token.queryFilter(
        token.filters.TokenPurchased(null, account)
      );
      const soldListings = soldListingEvents.map((event) => ({
        buyer: event.args.buyer,
        amountCTKN: ethers.utils.formatUnits(event.args.amountCTKN, 18),
        priceETH: ethers.utils.formatEther(event.args.priceETH),
      }));
      setSoldListings(soldListings);
      setIsLoadingSold(false);
    } catch (error) {
      console.error("Failed to fetch sold listings", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { account, token } = await connectToEthereum();
        setAccount(account);
        setToken(token);

        // fetch available listings
        fetchListings(token, account);
        fetchPurchasedListings(token, account);
        fetchSoldListings(token, account);
      } catch (error) {
        console.error("Initialization failed", error);
      }
    };
    init();
  }, []);

  const handleDelete = async (listingIndex) => {
    if (token) {
      try {
        const tx = await token.deleteListing(listingIndex, secretKey);
        await tx.wait();
        alert("Listing deleted successfully!");
        fetchListings(token);
      } catch (error) {
        console.error("Deletion failed", error);
        alert("Deletion failed: " + error.message);
      }
    } else {
      alert("Please connect your wallet first");
    }
  };

  return (
    <div id="purchased-listings" className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">My CTKN Listings</h2>
      <div className="space-y-4">
        {isLoadingAvailable ? (
          <div>Loading...</div>
        ) : listings.length > 0 ? (
          listings.map((listing, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">Seller: {listing.seller}</p>
              <p>Amount: {listing.amountCTKN} CTKN</p>
              <p>Price: {listing.priceETH} ETH</p>
              <button
                onClick={() => handleDelete(listing.listingIndex)}
                className="bg-red-500 text-white px-4 py-2 mt-2 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div className="text-lg">No listings has been made.</div>
        )}
      </div>
      <h2 className="text-3xl font-bold text-center mb-6 pt-8">
        Purchased Listings
      </h2>
      <div className="space-y-4">
        {isLoading ? (
          <div>Loading...</div>
        ) : purchasedListings.length > 0 ? (
          purchasedListings.map((listing, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">Seller: {listing.seller}</p>
              <p>Amount: {listing.amountCTKN} CTKN</p>
              <p>Price: {listing.priceETH} ETH</p>
            </div>
          ))
        ) : (
          <div className="text-lg">No listings been purchased.</div>
        )}
      </div>
      <h2 className="text-3xl font-bold text-center mb-6 pt-8">
        Sold Listings
      </h2>
      <div className="space-y-4">
        {isLoadingSold ? (
          <div>Loading...</div>
        ) : soldListings.length > 0 ? (
          soldListings.map((listing, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg font-semibold">Buyer: {listing.buyer}</p>
              <p>Amount: {listing.amountCTKN} CTKN</p>
              <p>Price: {listing.priceETH} ETH</p>
            </div>
          ))
        ) : (
          <div className="text-lg">No listings currently sold.</div>
        )}
      </div>
    </div>
  );
};

export default MyToken;
