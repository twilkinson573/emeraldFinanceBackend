const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lottery", () => {

  let deployer, bob, emerald, lottery, usdc, beefyVault; 
  let totalEmeraldSupply = 100_000_000;

  beforeEach(async () => {
    [deployer, bob] = await hre.ethers.getSigners();

    // DEPLOY CONTRACTS =================================

    const Usdc = await hre.ethers.getContractFactory("ERC20Mock");
    usdc = await Usdc.deploy("USDC", "USDC", 100_000_000);
    await usdc.deployed();

    const BeefyVault = await hre.ethers.getContractFactory("VaultV6Mock");
    beefyVault = await BeefyVault.deploy("Moo Scream USDC", "mooScreamUSDC", usdc.address); // Deploy BeefyVault with Moo Scream USD as IOU token and USDC as want token
    await beefyVault.deployed();

    const Lottery = await hre.ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy(beefyVault.address);
    await lottery.deployed();

    // SETUP =============================================
    await lottery.addAcceptedERC20(usdc.address);
    await usdc.transfer(bob.address, 10_000);

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
      await expect(lottery.connect(bob).makeDeposit(5000)).to.be.reverted;
    });

    it("Should allow transfer of USDC below the allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await expect(lottery.connect(bob).makeDeposit(4999)).to.not.be.reverted;
    });

    it("Should allow transfer of USDC equal to the allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await expect(lottery.connect(bob).makeDeposit(5000)).to.not.be.reverted;
    });

    it("Should not allow transfer of USDC above allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await expect(lottery.connect(bob).makeDeposit(5001)).to.be.reverted;
    });

    it("Should allow transfer of USDC below the user balance", async () => {
      await usdc.connect(bob).approve(lottery.address, 1_000_000);
      await expect(lottery.connect(bob).makeDeposit(9999)).to.not.be.reverted;
    });

    it("Should allow transfer of USDC equal to the user balance", async () => {
      await usdc.connect(bob).approve(lottery.address, 1_000_000);
      await expect(lottery.connect(bob).makeDeposit(10_000)).to.not.be.reverted;
    });

    it("Should not allow transfer of USDC above user balance", async () => {
      await usdc.connect(bob).approve(lottery.address, 1_000_000);
      await expect(lottery.connect(bob).makeDeposit(10_001)).to.be.reverted;
    });

    it("Should let the user deposit in the correct amount of USDC", async () => {
      const bobBalance = await usdc.balanceOf(bob.address);

      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      expect(await usdc.balanceOf(lottery.address)).to.equal(5000);
      expect(await usdc.balanceOf(bob.address)).to.equal(bobBalance - 5000);
    });

    it("Should credit the user the correct number of EMER tokens", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      expect(await emerald.balanceOf(bob.address)).to.equal(5000*100);
      expect(await emerald.balanceOf(lottery.address)).to.equal(totalEmeraldSupply - 5000*100);
    });

  });


  describe("#makeWithdrawal", () => {
    it("Should not allow transfer of EMER without an allowance", async () => {
      await expect(lottery.connect(bob).makeWithdrawal(5000)).to.be.reverted;
    });

    it("Should allow transfer of EMER below the allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      await emerald.connect(bob).approve(lottery.address, 5000 * 100);
      await expect(lottery.connect(bob).makeWithdrawal(4999 * 100)).to.not.be.reverted;
    });

    it("Should allow transfer of EMER equal to the allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      await emerald.connect(bob).approve(lottery.address, 5000 * 100);
      await expect(lottery.connect(bob).makeWithdrawal(5000 * 100)).to.not.be.reverted;
    });

    it("Should not allow transfer of EMER above allowance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      await emerald.connect(bob).approve(lottery.address, 5000 * 100);
      await expect(lottery.connect(bob).makeWithdrawal(5001 * 100)).to.be.reverted;
    });

    it("Should allow transfer of EMER below the user balance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      await emerald.connect(bob).approve(lottery.address, 1_000_000);
      await expect(lottery.connect(bob).makeWithdrawal(4999 * 100)).to.not.be.reverted;
    });

    it("Should allow transfer of EMER equal to the user balance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      await emerald.connect(bob).approve(lottery.address, 1_000_000);
      await expect(lottery.connect(bob).makeWithdrawal(5000 * 100)).to.not.be.reverted;
    });

    it("Should not allow transfer of EMER above user balance", async () => {
      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(5000);

      await emerald.connect(bob).approve(lottery.address, 1_000_000);
      await expect(lottery.connect(bob).makeWithdrawal(5001 * 100)).to.be.reverted;
    });

    it("Should let the user withdraw the correct amount of USDC", async () => {
      const bobUsdcBalance = await usdc.balanceOf(bob.address);
      const depositUsdcAmount = 5000;
      const withdrawalEmerAmount = 3000 * 100;

      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(depositUsdcAmount);

      await emerald.connect(bob).approve(lottery.address, 1_000_000);
      await lottery.connect(bob).makeWithdrawal(withdrawalEmerAmount);

      expect(await usdc.balanceOf(lottery.address)).to.equal(depositUsdcAmount - withdrawalEmerAmount/100);
      expect(await usdc.balanceOf(bob.address)).to.equal(bobUsdcBalance - depositUsdcAmount + withdrawalEmerAmount/100);
    });

    it("Should withdraw from the user the correct number of EMER tokens", async () => {
      const lotteryEmerBalance = await emerald.balanceOf(lottery.address);
      const depositUsdcAmount = 5000;
      const withdrawalEmerAmount = 3000 * 100;

      await usdc.connect(bob).approve(lottery.address, 5000);
      await lottery.connect(bob).makeDeposit(depositUsdcAmount);

      await emerald.connect(bob).approve(lottery.address, 1_000_000);
      await lottery.connect(bob).makeWithdrawal(withdrawalEmerAmount);

      expect(await emerald.balanceOf(lottery.address)).to.equal(lotteryEmerBalance - depositUsdcAmount*100 + withdrawalEmerAmount);
      expect(await emerald.balanceOf(bob.address)).to.equal(depositUsdcAmount*100 - withdrawalEmerAmount);
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
