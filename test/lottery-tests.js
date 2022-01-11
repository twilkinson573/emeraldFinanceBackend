const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", () => {

  let deployer, bob, emerald, lottery, usdc; 
  let totalEmeraldSupply = 100_000_000;

  beforeEach(async () => {
    [deployer, bob] = await hre.ethers.getSigners();

    // DEPLOY CONTRACTS =================================

    const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
    emerald = await Emerald.deploy(totalEmeraldSupply);
    await emerald.deployed();

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy(emerald.address);
    await lottery.deployed();

    const Usdc = await hre.ethers.getContractFactory("ERC20Mock");
    usdc = await Usdc.deploy("USDC", "USDC", 100_000_000);
    await usdc.deployed();

    // SETUP =============================================
    await emerald.transfer(lottery.address, totalEmeraldSupply);
    await lottery.addAcceptedERC20(usdc.address);
    await usdc.transfer(bob.address, 1000);

  });


  describe("#constructor", () => {
    it("Should own the total supply of EMER tokens", async () => {
      expect(await emerald.balanceOf(lottery.address)).to.equal(totalEmeraldSupply);
      expect(await emerald.balanceOf(emerald.address)).to.equal(0);
      expect(await emerald.balanceOf(deployer.address)).to.equal(0);
      expect(await emerald.balanceOf(bob.address)).to.equal(0);

    });
  });

  describe("#addAcceptedERC20", () => {
    it("Should only be callable by the owner", async () => {
      await expect(lottery.connect(bob).addAcceptedERC20("0x0000000000000000000000000000000000000001")).to.be.reverted;
      await expect(lottery.connect(deployer).addAcceptedERC20("0x0000000000000000000000000000000000000001")).to.not.be.reverted;
    })

    it("Should add the address to #acceptedERC20s on top of default", async () => {
      expect(await lottery.getAcceptedERC20sCount()).to.equal(1);

      await lottery.connect(deployer).addAcceptedERC20("0x0000000000000000000000000000000000000001");

      expect(await lottery.getAcceptedERC20sCount()).to.equal(2);
      expect(await lottery.getAcceptedERC20(1)).to.equal("0x0000000000000000000000000000000000000001");
    })

  });

  describe("#makeDeposit", () => {
    it("Should not allow transfer of USDC without an allowance", async () => {
      await expect(lottery.connect(bob).makeDeposit(500)).to.be.reverted;
    });

    it("Should allow transfer of USDC below the allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 500);
      await expect(lottery.connect(bob).makeDeposit(499)).to.not.be.reverted;
    });

    it("Should allow transfer of USDC equal to the allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 500);
      await expect(lottery.connect(bob).makeDeposit(500)).to.not.be.reverted;
    });

    it("Should allow transfer of USDC above allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 500);
      await expect(lottery.connect(bob).makeDeposit(501)).to.be.reverted;
    });

    it("Should let the user deposit in the correct amount of USDC", async () => {
      const bobBalance = await usdc.balanceOf(bob.address);

      await usdc.connect(bob).approve(lottery.address, 500);
      await lottery.connect(bob).makeDeposit(500);

      expect(await usdc.balanceOf(lottery.address)).to.equal(500);
      expect(await usdc.balanceOf(bob.address)).to.equal(bobBalance - 500);
    });

    it("Should credit the user the correct number of EMER tokens", async () => {
      await usdc.connect(bob).approve(lottery.address, 500);
      await lottery.connect(bob).makeDeposit(500);

      expect(await emerald.balanceOf(bob.address)).to.equal(500*100);
      expect(await emerald.balanceOf(lottery.address)).to.equal(totalEmeraldSupply - 500*100);
    });

  });

});

  // describe("#", () => {
  //   it("xxx", async () => {
      
  //   })
  // })

  // expect(await greeter.greet()).to.equal("Hello, world!");
  // const setGreetingTx = await greeter.setGreeting("Hola, mundo!");
  // wait until the transaction is mined
  // await setGreetingTx.wait();
  // expect(await greeter.greet()).to.equal("Hola, mundo!");
