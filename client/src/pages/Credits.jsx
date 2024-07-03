import { useEffect, useState } from "react";
import { connectToEthereum } from "../utils/Logic";
import { ToastContainer, toast } from "react-toastify";

const secretKey = process.env.REACT_APP_SECRET_KEY;

const Credits = ({ account, setAccount }) => {
  const ethers = require("ethers");
  const [token, setToken] = useState(null);
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
          if (listing.active && seller !== account) {
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
      setIsLoadingAvailable(false);
    } catch (error) {
      toast.error("Failed to fetch listings, ", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { account, token } = await connectToEthereum();
        setAccount(account);
        setToken(token);
        fetchListings(token, account);
      } catch (error) {
        toast.error(error.message);
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
        fetchListings(token);
      } catch (error) {
        toast.error("Purchase failed, ", error);
        alert("Purchase failed: " + error.message);
      }
    } else {
      alert("Please connect your wallet first");
    }
  };

  return (
    <div
      id="available-listings"
      className="container mx-auto px-12 py-8 md:px-20"
    >
      <ToastContainer />
      <h2 className="text-3xl font-bold text-center mb-6">Credits</h2>
      <ul className="space-y-4">
        {isLoadingAvailable ? (
          <div>Loading...</div>
        ) : listings.length > 0 ? (
          listings.map((listing, index) => (
            <li
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg border-2 border-[#5DEBD7]"
            >
              <p className="text-lg font-semibold">Seller: {listing.seller}</p>
              <p>Amount: {listing.amountCTKN} CTKN</p>
              <p>Price: {listing.priceETH} ETH</p>
              <div>
                {listing.seller !== account && listing.active && (
                  <button
                    onClick={() =>
                      handleBuy(
                        listing.seller,
                        listing.listingIndex,
                        listing.priceETH
                      )
                    }
                    className="bg-[#254336] text-white px-4 py-2 mt-2 rounded-lg hover:bg-green-600 transition duration-300 ease-in-out"
                  >
                    Buy
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <div className="text-lg">No credits of CTKN available right now.</div>
        )}
      </ul>
    </div>
  );
};

export default Credits;
