const main = async () => {

  // VARS =============================================

  const [deployer, bob, jane] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();
  const totalEmeraldSupply = 100_000_000;

  // console.log('Deploying contracts with account: ', deployer.address);
  // console.log('Account balance: ', accountBalance.toString());

  // DEPLOY CONTRACTS =================================


  const Usdc = await hre.ethers.getContractFactory("ERC20Mock");
  const usdc = await Usdc.deploy("USDC", "USDC", 100_000_000);
  await usdc.deployed();

  // console.log("USDC deployed to:", usdc.address);

  const BeefyVault = await hre.ethers.getContractFactory("VaultV6Mock");
  const beefyVault = await BeefyVault.deploy("Moo Scream USDC", "mooScreamUSDC", usdc.address); // Deploy BeefyVault with Moo Scream USD as IOU token and USDC as want token
  await beefyVault.deployed();

  // console.log("BeefyVaultV6Mock deployed to: %s, with wantToken: %s", beefyVault.address, await beefyVault.want());

  const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
  const emerald = await Emerald.deploy(totalEmeraldSupply);
  await emerald.deployed();

  // console.log("Emerald Token deployed to:", emerald.address);

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(emerald.address, beefyVault.address);
  await lottery.deployed();

  // console.log("Lottery deployed to: %s, with EMER token: %s, & yield vault: %s ", lottery.address, emerald.address, beefyVault.address);


  // SETUP =============================================

  // Transfer Emerald Tokens to Lottery
  await emerald.transfer(lottery.address, totalEmeraldSupply);

  // Add USDC to Lottery#acceptedERC20s
  await lottery.addAcceptedERC20(usdc.address);

  // Fund Retail users' accounts
  const bobFundingAmount = 10_000;
  await usdc.transfer(bob.address, bobFundingAmount);
  const janeFundingAmount = 10_000;
  await usdc.transfer(jane.address, janeFundingAmount);


  // USER MAKES DEPOSIT ================================

  const approveUsdcTxn = await usdc.connect(bob).approve(lottery.address, 1_000_000);
  await approveUsdcTxn.wait();

  await showBeefyStats(beefyVault);

  console.log(" ")
  const bobDepositAmount = 4000;
  console.log(`########## TX: Bob deposit ${bobDepositAmount} USDC to Lottery...`);
  const depositTxn = await lottery.connect(bob).makeDeposit(bobDepositAmount);
  await depositTxn.wait();


  await showRetailStats("Bob", bob, emerald, usdc);
  await showRetailStats("Jane", jane, emerald, usdc);

  await showLotteryStats(lottery, emerald, usdc, beefyVault);

  await showBeefyStats(beefyVault);

  // USER MAKES WITHDRAWAL =============================

  console.log(" ")
  console.log("########## Strategy deposits USDC Rewards into BeefyVault");
  await usdc.transfer(beefyVault.address, 1000);

  await showBeefyStats(beefyVault);

  const approveEmerTxn = await emerald.connect(bob).approve(lottery.address, 1_000_000);
  await approveEmerTxn.wait();

  console.log(" ")
  const bobWithdrawalAmount = 2000;
  console.log(`########## TX: Bob withdraw ${bobWithdrawalAmount} USDC from Lottery...`);
  const withdrawTxn = await lottery.connect(bob).makeWithdrawal(bobWithdrawalAmount);
  await withdrawTxn.wait();

  await showRetailStats("Bob", bob, emerald, usdc);
  await showRetailStats("Jane", jane, emerald, usdc);

  await showLotteryStats(lottery, emerald, usdc, beefyVault);

  await showBeefyStats(beefyVault);

};

async function showRetailStats (name, retailUser, emerald, usdc) {
  console.log(" ");
  console.log(`${name}'s EMER balance:`, await emerald.balanceOf(retailUser.address))
  console.log(`${name}'s USDC balance:`, await usdc.balanceOf(retailUser.address))
}

async function showLotteryStats (lottery, emerald, usdc, beefyVault) {
  console.log(" ");
  console.log("Lottery EMER balance:", await emerald.balanceOf(lottery.address));
  console.log("Lottery USDC balance:", await usdc.balanceOf(lottery.address));
  console.log("Lottery's mooScreamUSDC IOU vault token balance:", await beefyVault.balanceOf(lottery.address));
}

async function showBeefyStats (beefyVault) {
  console.log(" ");
  console.log("BeefyVault USDC reserve balance", await beefyVault.balance());
  console.log("BeefyVault Price Per Full IOU Token Share", await beefyVault.getPricePerFullShare());
}


const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runMain();
