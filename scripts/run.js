const main = async () => {

  // VARS =============================================

  const [deployer, bob, jane] = await hre.ethers.getSigners();

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

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(beefyVault.address);
  await lottery.deployed();

  // console.log("Lottery deployed to: %s, & yield vault: %s ", lottery.address, beefyVault.address);


  // SETUP =============================================

  // Add USDC to Lottery#acceptedERC20s
  await lottery.addAcceptedWant(usdc.address);

  // Fund Retail users' accounts
  const bobFundingAmount = 10_000;
  await usdc.transfer(bob.address, bobFundingAmount);
  const janeFundingAmount = 10_000;
  await usdc.transfer(jane.address, janeFundingAmount);


  // USER MAKES DEPOSIT ================================

  const bobApproveUsdcTxn = await usdc.connect(bob).approve(lottery.address, 1_000_000);
  await bobApproveUsdcTxn.wait();
  const janeApproveUsdcTxn = await usdc.connect(jane).approve(lottery.address, 1_000_000);
  await janeApproveUsdcTxn.wait();

  await showBeefyStats(beefyVault);

  console.log(" ")
  const bobDepositAmount = 4000;
  console.log(`########## TX: Bob deposit ${bobDepositAmount} USDC to Lottery...`);
  const bobDepositTxn = await lottery.connect(bob).makeDeposit(bobDepositAmount);
  await bobDepositTxn.wait();

  await showRetailStats("Bob", bob, lottery, usdc);
  await showRetailStats("Jane", jane, lottery, usdc);
  await showLotteryStats(lottery, usdc, beefyVault);
  await showBeefyStats(beefyVault);


  console.log(" ")
  const janeDepositAmount = 1000;
  console.log(`########## TX: Jane deposit ${janeDepositAmount} USDC to Lottery...`);
  const janeDepositTxn = await lottery.connect(jane).makeDeposit(janeDepositAmount);
  await janeDepositTxn.wait();

  await showRetailStats("Bob", bob, lottery, usdc);
  await showRetailStats("Jane", jane, lottery, usdc);
  await showLotteryStats(lottery, usdc, beefyVault);
  await showBeefyStats(beefyVault);

  // USER MAKES WITHDRAWAL =============================

  console.log(" ")
  console.log("########## Strategy deposits USDC Rewards into BeefyVault");
  await usdc.transfer(beefyVault.address, 1000);

  await showBeefyStats(beefyVault);

  console.log(" ")
  const bobWithdrawalAmount = 2000;
  console.log(`########## TX: Bob withdraw ${bobWithdrawalAmount} USDC from Lottery...`);
  const withdrawTxn = await lottery.connect(bob).makeWithdrawal(bobWithdrawalAmount);
  await withdrawTxn.wait();

  await showRetailStats("Bob", bob, lottery, usdc);
  await showRetailStats("Jane", jane, lottery, usdc);
  await showLotteryStats(lottery, usdc, beefyVault);
  await showBeefyStats(beefyVault);

};

async function showRetailStats (name, retailUser, lottery, usdc) {
  console.log(" ");
  // TODO1 - Show user's NFT ticket with amount deposited here
  console.log(`${name}'s USDC balance:`, await usdc.balanceOf(retailUser.address))
}

async function showLotteryStats (lottery, usdc, beefyVault) {
  console.log(" ");
  // TODO1 - Show all NFT tickets here
  console.log("Lottery USDC balance:", await usdc.balanceOf(lottery.address));
  console.log("Lottery IOU vault token balance:", await beefyVault.balanceOf(lottery.address));
}

async function showBeefyStats (beefyVault) {
  console.log(" ");
  console.log("BeefyVault USDC reserve balance", await beefyVault.balance());
  console.log("BeefyVault IOU Token TotalSupply", await beefyVault.totalSupply());
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
