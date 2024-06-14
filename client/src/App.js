import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import ListTokenForSale from "./pages/ListTokenForSale";
import Listings from "./pages/Listings";
import PurchasedListings from "./pages/PurchasedListings";
import RenderPDF from "./pages/RenderPDF";

function App() {
  const [account, setAccount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  useEffect(() => {}, [account, accounts, balances]);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar
                account={account}
                accounts={accounts}
                balances={balances}
              />
              <Homepage
                account={account}
                setAccount={setAccount}
                setBalances={setBalances}
                setAccounts={setAccounts}
              />
            </>
          }
        />
        <Route
          path="/sale-token"
          element={
            <>
              <Navbar
                account={account}
                accounts={accounts}
                balances={balances}
              />
              <ListTokenForSale
                account={account}
                setAccount={setAccount}
                setBalances={setBalances}
                setAccounts={setAccounts}
              />
            </>
          }
        />
        <Route
          path="/listings"
          element={
            <>
              <Navbar
                account={account}
                accounts={accounts}
                balances={balances}
              />
              <Listings
                account={account}
                setAccount={setAccount}
                setBalances={setBalances}
                setAccounts={setAccounts}
              />
            </>
          }
        />
        <Route
          path="/purchased-listings"
          element={
            <>
              <Navbar
                account={account}
                accounts={accounts}
                balances={balances}
              />
              <PurchasedListings
                account={account}
                setAccount={setAccount}
                setBalances={setBalances}
                setAccounts={setAccounts}
              />
            </>
          }
        />
        <Route
          path="/render-pdf"
          element={
            <>
              <Navbar
                account={account}
                accounts={accounts}
                balances={balances}
              />
              <RenderPDF />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
