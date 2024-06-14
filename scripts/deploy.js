async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const CarbonToken = await ethers.getContractFactory("CarbonToken");

  // Define the constructor arguments
  const initialOwner = deployer.address;
  const secretKey = "tes123"; // Replace with your actual secret key

  // Deploy the contract with the constructor arguments
  const token = await CarbonToken.deploy(initialOwner, secretKey);

  console.log("CarbonToken deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
