const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonToken", function () {
  let CarbonToken, carbonToken, owner, addr1, addr2, signers;

  beforeEach(async function () {
    CarbonToken = await ethers.getContractFactory("CarbonToken");
    [owner, addr1, addr2, ...signers] = await ethers.getSigners();
    authorizedMessage = "skripsi_mufidus_sani";
    carbonToken = await CarbonToken.deploy(owner.address, authorizedMessage);
    await carbonToken.deployed();
  });

  it("Should deploy and set the correct owner", async function () {
    expect(await carbonToken.owner()).to.equal(owner.address);
  });

  it("Should mint tokens with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const ipfsHash = "QmExampleHash";
    let signature =
      "0x2e56440682a24ec3f6b6d7d873dc4698f4f171445ba20b4746e38195bee319b32d22b1ce2a1bbf116c938ec1f182b09b9988277eeaf8631d998673d66d679c6a1b";

    await carbonToken
      .connect(owner)
      .mint(addr1.address, amount, ipfsHash, signature);

    expect(await carbonToken.balanceOf(addr1.address)).to.equal(amount);
  });

  it("Should list tokens for sale with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const price = ethers.utils.parseEther("1");
    let signature =
      "0x2e56440682a24ec3f6b6d7d873dc4698f4f171445ba20b4746e38195bee319b32d22b1ce2a1bbf116c938ec1f182b09b9988277eeaf8631d998673d66d679c6a1b";

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
    let signature =
      "0x2e56440682a24ec3f6b6d7d873dc4698f4f171445ba20b4746e38195bee319b32d22b1ce2a1bbf116c938ec1f182b09b9988277eeaf8631d998673d66d679c6a1b";
    let signatures =
      "0x0a971c14e487168d2315c2860399ebb49662fbc8be3d4732d2a0b8833460b79461abee1de1820e5e1d2f626991fd5e2b128ebbcc838a1bcc3d47b716c123ea6a1b";

    await carbonToken.connect(owner).mint(owner.address, amount, "", signature);
    await carbonToken.connect(owner).listTokenForSale(amount, price, signature);

    await carbonToken
      .connect(addr1)
      .buyToken(owner.address, 0, signatures, { value: price });

    expect(await carbonToken.balanceOf(addr1.address)).to.equal(amount);
    const listing = await carbonToken.listings(owner.address, 0);
    expect(listing.active).to.be.false;
  });

  it("Should delete listing with correct signature", async function () {
    const amount = ethers.utils.parseEther("100");
    const price = ethers.utils.parseEther("1");
    let signature =
      "0x2e56440682a24ec3f6b6d7d873dc4698f4f171445ba20b4746e38195bee319b32d22b1ce2a1bbf116c938ec1f182b09b9988277eeaf8631d998673d66d679c6a1b";

    await carbonToken.connect(owner).mint(owner.address, amount, "", signature);
    await carbonToken.connect(owner).listTokenForSale(amount, price, signature);

    await carbonToken.connect(owner).deleteListing(0, signature);

    const listing = await carbonToken.listings(owner.address, 0);
    expect(listing.active).to.be.false;
    expect(await carbonToken.balanceOf(owner.address)).to.equal(amount);
  });
});
