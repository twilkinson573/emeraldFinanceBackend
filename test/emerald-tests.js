const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EmeraldToken", function () {

  let emerald;

  beforeEach(async () => {
    const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
    emerald = await Emerald.deploy(100_000_000);
    await emerald.deployed();
  });


  it("Should set the totalSupply correctly", async function () {
    expect(await emerald.totalSupply()).to.equal(100_000_000);
  });
});
