const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", function () {

  let deployer, bobAddr, emerald, lottery; 
  let totalEmeraldSupply = 100_000_000;

  beforeEach(async () => {
    [deployer, bobAddr] = await hre.ethers.getSigners();

    const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
    emerald = await Emerald.deploy(totalEmeraldSupply);
    await emerald.deployed();

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy(emerald.address);
    await lottery.deployed();

    await emerald.transfer(lottery.address, totalEmeraldSupply);
  });


  it("Should own the total supply of EMER tokens", async function () {
    console.log(lottery.address)
    expect(await emerald.balanceOf(lottery.address)).to.equal(totalEmeraldSupply);
    expect(await emerald.balanceOf(emerald.address)).to.equal(0);
    expect(await emerald.balanceOf(deployer.address)).to.equal(0);
    expect(await emerald.balanceOf(bobAddr.address)).to.equal(0);

    // expect(await greeter.greet()).to.equal("Hello, world!");

    // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // // wait until the transaction is mined
    // await setGreetingTx.wait();

    // expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
