// const { expect } = require("chai");
// const { ethers } = require("hardhat");
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CarbonToken", function () {
  let CarbonToken, carbonToken, owner, addr1, addr2, signers;

  beforeEach(async function () {
    CarbonToken = await ethers.getContractFactory("CarbonToken");
    [owner, addr1, addr2, ...signers] = await ethers.getSigners();
    carbonToken = await CarbonToken.deploy(owner.address);
    await carbonToken.deployed();
  });

  it("Should deploy and set the correct owner", async function () {
    expect(await carbonToken.owner()).to.equal(owner.address);
  });

  it("Should mint tokens with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const ipfsHash = "QmExampleHash";
    const message = ethers.utils.solidityKeccak256(
      ["string"],
      ["skripsi_mufidus_sani"]
    );
    const messageHash = ethers.utils.arrayify(
      ethers.utils.hashMessage(message)
    );
    const signature = await owner.signMessage(messageHash);

    await carbonToken
      .connect(owner)
      .mint(addr1.address, amount, ipfsHash, signature);

    expect(await carbonToken.balanceOf(addr1.address)).to.equal(amount);
  });

  it("Should list tokens for sale with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const price = ethers.utils.parseEther("1");
    const message = ethers.utils.solidityKeccak256(
      ["string"],
      ["skripsi_mufidus_sani"]
    );
    const messageHash = ethers.utils.arrayify(
      ethers.utils.hashMessage(message)
    );
    const signature = await owner.signMessage(messageHash);

    await carbonToken.connect(owner).mint(owner.address, amount, "", signature);

    await carbonToken.connect(owner).listTokenForSale(amount, price, signature);

    const listing = await carbonToken.listings(owner.address, 0);
    expect(listing.amountCTKN).to.equal(amount);
    expect(listing.priceETH).to.equal(price);
    expect(listing.active).to.be.true;
  });

  it("Should buy tokens with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const price = ethers.utils.parseEther("1");
    const message = ethers.utils.solidityKeccak256(
      ["string"],
      ["skripsi_mufidus_sani"]
    );
    const messageHash = ethers.utils.arrayify(
      ethers.utils.hashMessage(message)
    );
    const signature = await owner.signMessage(messageHash);

    await carbonToken.connect(owner).mint(owner.address, amount, "", signature);
    await carbonToken.connect(owner).listTokenForSale(amount, price, signature);

    await carbonToken
      .connect(addr1)
      .buyToken(owner.address, 0, signature, { value: price });

    expect(await carbonToken.balanceOf(addr1.address)).to.equal(amount);
    const listing = await carbonToken.listings(owner.address, 0);
    expect(listing.active).to.be.false;
  });

  it("Should delete listing with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const price = ethers.utils.parseEther("1");
    const message = ethers.utils.solidityKeccak256(
      ["string"],
      ["skripsi_mufidus_sani"]
    );
    const messageHash = ethers.utils.arrayify(
      ethers.utils.hashMessage(message)
    );
    const signature = await owner.signMessage(messageHash);

    await carbonToken.connect(owner).mint(owner.address, amount, "", signature);
    await carbonToken.connect(owner).listTokenForSale(amount, price, signature);

    await carbonToken.connect(owner).deleteListing(0, signature);

    const listing = await carbonToken.listings(owner.address, 0);
    expect(listing.active).to.be.false;
    expect(await carbonToken.balanceOf(owner.address)).to.equal(amount);
  });
});
