import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./pages/Homepage";
import SellToken from "./pages/SellToken";
import BuyToken from "./pages/BuyToken";
import MyToken from "./pages/MyToken";
import MintToken from "./pages/MintToken";
import RenderPDF from "./pages/RenderPDF";
import UpdateSecretKey from "./pages/UpdateSecretKey";

function App() {
  const [account, setAccount] = useState("");
  useEffect(() => {}, [account]);
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar account={account} />
              <Homepage account={account} setAccount={setAccount} />
            </>
          }
        />
        <Route
          path="/sell-token"
          element={
            <>
              <Navbar account={account} />
              <SellToken account={account} setAccount={setAccount} />
            </>
          }
        />
        <Route
          path="/buy-token"
          element={
            <>
              <Navbar account={account} />
              <BuyToken account={account} setAccount={setAccount} />
            </>
          }
        />
        <Route
          path="/my-token"
          element={
            <>
              <Navbar account={account} />
              <MyToken account={account} setAccount={setAccount} />
            </>
          }
        />
        <Route
          path="/mint-token"
          element={
            <>
              <Navbar account={account} />
              <MintToken account={account} setAccount={setAccount} />
            </>
          }
        />
        <Route
          path="/render-pdf"
          element={
            <>
              <Navbar account={account} />
              <RenderPDF />
            </>
          }
        />
        <Route
          path="/update-secret-key"
          element={
            <>
              <Navbar account={account} />
              <UpdateSecretKey />
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
