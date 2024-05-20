async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CarbonToken = await ethers.getContractFactory("CarbonToken");
  const token = await CarbonToken.deploy(deployer.address);

  console.log("CarbonToken deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
