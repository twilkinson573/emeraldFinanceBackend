const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", () => {

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


  describe("#constructor", () => {
    it("Should own the total supply of EMER tokens", async () => {
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

  describe("#makeDeposit", () => {

    it("Should let the user deposit in the correct amount of USDC", async () => {

    });


    it("Should credit the user the correct number of EMER tokens", async () => {
      depositTxn = await lottery.connect(bobAddr).makeDeposit(500);
      await depositTxn.wait();

      expect(await emerald.balanceOf(bobAddr.address)).to.equal(500);
      expect(await emerald.balanceOf(lottery.address)).to.equal(totalEmeraldSupply - 500);
    });

  });

  describe("#addAcceptedERC20", () => {
    it("Should only be callable by the owner", async () => {
      await expect(lottery.connect(bobAddr).addAcceptedERC20("0x0000000000000000000000000000000000000001")).to.be.reverted;
      await expect(lottery.connect(deployer).addAcceptedERC20("0x0000000000000000000000000000000000000001")).to.not.be.reverted;
    })

    it("Should add the address to #acceptedERC20s", async () => {
      expect(await lottery.getAcceptedERC20sCount()).to.equal(0);

      const txn = await lottery.connect(deployer).addAcceptedERC20("0x0000000000000000000000000000000000000001");
      await txn.wait();

      expect(await lottery.getAcceptedERC20sCount()).to.equal(1);
      expect(await lottery.getAcceptedERC20(0)).to.equal("0x0000000000000000000000000000000000000001");
    })

  })

});

  // describe("#", () => {
  //   it("xxx", async () => {
      
  //   })
  // })
