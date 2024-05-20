import React, { useEffect, useState } from "react";
import CarbonCreditTokenABI from "./CarbonToken.json"; // Add ABI JSON file

const tokenAddress = "0xc6e7DF5E7b4f2A278906862b61205850344D4e7d";

function App() {
  const ethers = require("ethers");
  const [account, setAccount] = useState("");
  const [ctknBalance, setCtknBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amountCTKN, setAmountCTKN] = useState("");
  // const [amountETH, setAmountETH] = useState("");
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
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

        const ethBalance = await token.provider.getBalance(account);
        setEthBalance(ethers.utils.formatEther(ethBalance));

        // Get list of all accounts connected to MetaMask
        const accounts = await provider.listAccounts();
        setAccounts(accounts);
        fetchBalances(accounts, token);
      }
    };
    init();
  }, []);

  const fetchBalances = async (accounts, token, provider) => {
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
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (token) {
      try {
        const amountETH = "100";
        // Check if the recipient has approved the smart contract to spend ETH
        const recipientEthBalance = await token.provider.getBalance(recipient);
        if (ethers.utils.parseEther(amountETH).gt(recipientEthBalance)) {
          alert("Recipient does not have enough ETH");
          return;
        }

        const tx = await token.transferCTKNWithETHBack(
          recipient,
          ethers.utils.parseUnits(amountCTKN, 18),
          ethers.utils.parseEther(amountETH),
          {
            value: ethers.utils.parseEther(amountETH), // Send ETH with the transaction
          }
        );
        await tx.wait();
        const ctknBalance = await token.balanceOf(account);
        setCtknBalance(ethers.utils.formatUnits(ctknBalance, 18));

        const ethBalance = await token.provider.getBalance(account);
        setEthBalance(ethers.utils.formatEther(ethBalance));

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
      <p>Your Carbon Credit Balance: {ctknBalance}</p>
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
            value={amountCTKN}
            onChange={(e) => setAmountCTKN(e.target.value)}
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
            <p>Balance: {balances[acc]?.ctkn} CTKN</p>
            <p>Balance: {balances[acc]?.eth} ETH</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
