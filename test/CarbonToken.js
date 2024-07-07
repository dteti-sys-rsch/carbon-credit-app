import { expect } from "chai";
import { ethers } from "hardhat";

describe("CarbonToken", function () {
  let CarbonToken;
  let carbonToken;
  let owner;
  let addr1;
  let addr2;
  let secretKey;
  let secretKeyHash;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    CarbonToken = await ethers.getContractFactory("CarbonToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    secretKey = "supersecret";
    secretKeyHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(secretKey));

    // Deploy the contract
    carbonToken = await CarbonToken.deploy(owner.address, secretKey);
    await carbonToken.deployed();
  });

  it("Should mint tokens with the correct secret key", async function () {
    const amount = 1000;
    const ipfsHash = "QmHash";

    await carbonToken.mint(addr1.address, amount, secretKeyHash, ipfsHash);

    expect(await carbonToken.balanceOf(addr1.address)).to.equal(amount);
  });

  it("Should fail to mint tokens with the incorrect secret key", async function () {
    const amount = 1000;
    const ipfsHash = "QmHash";
    const wrongSecretKeyHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("wrongkey")
    );

    await expect(
      carbonToken.mint(addr1.address, amount, wrongSecretKeyHash, ipfsHash)
    ).to.be.revertedWith("Invalid secret key");
  });

  it("Should list tokens for sale with the correct secret key", async function () {
    const amount = 1000;
    const price = ethers.utils.parseEther("1");

    await carbonToken.mint(addr1.address, amount, secretKeyHash, "QmHash");

    await carbonToken
      .connect(addr1)
      .listTokenForSale(amount, price, secretKeyHash);

    const listing = await carbonToken.listings(addr1.address, 0);
    expect(listing.amountCTKN).to.equal(amount);
    expect(listing.priceETH).to.equal(price);
    expect(listing.active).to.be.true;
  });

  it("Should buy listed tokens with the correct secret key", async function () {
    const amount = 1000;
    const price = ethers.utils.parseEther("1");

    await carbonToken.mint(addr1.address, amount, secretKeyHash, "QmHash");

    await carbonToken
      .connect(addr1)
      .listTokenForSale(amount, price, secretKeyHash);

    await carbonToken
      .connect(addr2)
      .buyToken(addr1.address, 0, secretKeyHash, { value: price });

    expect(await carbonToken.balanceOf(addr2.address)).to.equal(amount);
  });

  it("Should delete listing with the correct secret key", async function () {
    const amount = 1000;
    const price = ethers.utils.parseEther("1");

    await carbonToken.mint(addr1.address, amount, secretKeyHash, "QmHash");

    await carbonToken
      .connect(addr1)
      .listTokenForSale(amount, price, secretKeyHash);

    await carbonToken.connect(addr1).deleteListing(0, secretKeyHash);

    const listing = await carbonToken.listings(addr1.address, 0);
    expect(listing.active).to.be.false;
  });

  it("Should update secret key by the owner", async function () {
    const newSecretKey = "newsecret";
    const newSecretKeyHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(newSecretKey)
    );

    await carbonToken.updateSecretKey(newSecretKey, owner.address);

    expect(await carbonToken.getSecretKeyHash()).to.equal(newSecretKeyHash);
  });

  it("Should fail to update secret key by non-owner", async function () {
    const newSecretKey = "newsecret";
    const newSecretKeyHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(newSecretKey)
    );

    await carbonToken.updateSecretKey(newSecretKey, addr1.address);

    expect(await carbonToken.getSecretKeyHash()).to.equal(newSecretKeyHash);
  });
});
