export const fetchBalances = async (accounts, token, setBalances) => {
  const ethers = require("ethers");
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
