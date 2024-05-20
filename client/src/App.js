import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "./CarbonToken.json"; // Add ABI JSON file

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const ethers = require("ethers");
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});

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
        const balance = await token.balanceOf(account);
        setBalance(ethers.utils.formatUnits(balance, 18));

        // Get list of all accounts connected to MetaMask
        const accounts = await provider.listAccounts();
        setAccounts(accounts);
        fetchBalances(accounts, token);
      }
    };
    init();
  }, []);

  const fetchBalances = async (accounts, token) => {
    const balances = {};
    for (const acc of accounts) {
      const balance = await token.balanceOf(acc);
      balances[acc] = ethers.utils.formatUnits(balance, 18);
    }
    setBalances(balances);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (token) {
      try {
        const tx = await token.transfer(
          recipient,
          ethers.utils.parseUnits(amount, 18)
        );
        await tx.wait();
        const balance = await token.balanceOf(account);
        setBalance(ethers.utils.formatUnits(balance, 18));
        fetchBalances(accounts, token); // Update balances after transfer
        alert("Transfer successful!");
      } catch (error) {
        console.error("Transfer failed", error);
        alert("Transfer failed: " + error.message);
      }
    }
  };

  return (
    <div>
      <h1>Carbon Credit Trading System</h1>
      <p>Your account: {account}</p>
      <p>Your Carbon Credit Balance: {balance}</p>
      <form onSubmit={handleTransfer}>
        <div>
          <label>Recipient Address:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount to Transfer:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Transfer</button>
      </form>
      <h2>Connected Accounts</h2>
      <ul>
        {accounts.map((acc) => (
          <li key={acc}>
            <p>Address: {acc}</p>
            <p>Balance: {balances[acc]} CTKN</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
