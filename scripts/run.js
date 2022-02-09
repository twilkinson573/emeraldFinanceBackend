const main = async () => {

  // VARS =============================================

  const [deployer, bob] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();
  const totalEmeraldSupply = 100_000_000;

  console.log('Deploying contracts with account: ', deployer.address);
  console.log('Account balance: ', accountBalance.toString());


  // DEPLOY CONTRACTS =================================


  const Usdc = await hre.ethers.getContractFactory("ERC20Mock");
  const usdc = await Usdc.deploy("USDC", "USDC", 100_000_000);
  await usdc.deployed();

  console.log("USDC deployed to:", usdc.address);

  const BeefyVault = await hre.ethers.getContractFactory("VaultV6Mock");
  const beefyVault = await BeefyVault.deploy("Moo USDC", "mooUSDC", usdc.address); // Deploy BeefyVault with Moo USD as IOU token and USDC as want token
  await beefyVault.deployed();

  console.log("BeefyVaultV6Mock deployed to: %s, with wantToken: %s", beefyVault.address, await beefyVault.want());

  const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
  const emerald = await Emerald.deploy(totalEmeraldSupply);
  await emerald.deployed();

  console.log("Emerald Token deployed to:", emerald.address);

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(emerald.address, beefyVault.address);
  await lottery.deployed();

  console.log("Lottery deployed to: %s, with EMER token: %s, & yield vault: %s ", lottery.address, emerald.address, beefyVault.address);


  // SETUP =============================================


  // Transfer Emerald Tokens to Lottery
  await emerald.transfer(lottery.address, totalEmeraldSupply);
  console.log("Lottery EMER balance:", await emerald.balanceOf(lottery.address));

  // Fund Bob's account
  let bobFundingAmount = 10_000;
  console.log(`Funding Bob's account with ${bobFundingAmount} USDC...`);
  await usdc.transfer(bob.address, bobFundingAmount);

  // Add USDC to Lottery#acceptedERC20s
  await lottery.addAcceptedERC20(usdc.address);


  // USER MAKES DEPOSIT ================================

  console.log(" ")
  console.log("## TX 1: Bob giving USDC approval to Lottery...");
  // Note, how would I make this request happen in real life through a frontend?
  let approveUsdcTxn = await usdc.connect(bob).approve(lottery.address, 1_000_000);
  await approveUsdcTxn.wait();

  console.log("BOB USDC approval amount", await usdc.allowance(bob.address, lottery.address));

  console.log(" ")
  let bobDepositAmount = 4000;
  console.log(`## TX 2: Bob making USDC deposit of ${bobDepositAmount} to Lottery...`);
  let depositTxn = await lottery.connect(bob).makeDeposit(bobDepositAmount);
  await depositTxn.wait();

  console.log("Lottery EMER balance:", await emerald.balanceOf(lottery.address));
  console.log("Bob's EMER balance:", await emerald.balanceOf(bob.address));

  console.log("Lottery USDC balance:", await usdc.balanceOf(lottery.address));
  console.log("Bob's USDC balance:", await usdc.balanceOf(bob.address));
  console.log("Beefy Vault's USDC balance:", await usdc.balanceOf(beefyVault.address));

  // USER MAKES WITHDRAWAL =============================

  console.log(" ")
  console.log("## TX 3: Bob giving EMER approval to Lottery...");
  // Note, how would I make this request happen in real life through a frontend?
  let approveEmerTxn = await emerald.connect(bob).approve(lottery.address, 1_000_000);
  await approveEmerTxn.wait();

  console.log("BOB EMER approval amount", await emerald.allowance(bob.address, lottery.address));

  console.log(" ")
  let bobWithdrawalAmount = 2000;
  console.log(`## TX 4: Bob making a small USDC withdrawal of ${bobWithdrawalAmount} from Lottery...`);
  let withdrawTxn = await lottery.connect(bob).makeWithdrawal(bobWithdrawalAmount);
  await withdrawTxn.wait();

  console.log("Lottery EMER balance:", await emerald.balanceOf(lottery.address));
  console.log("Bob's EMER balance:", await emerald.balanceOf(bob.address));

  console.log("Lottery USDC balance:", await usdc.balanceOf(lottery.address));
  console.log("Bob's USDC balance:", await usdc.balanceOf(bob.address));
  console.log("Beefy Vault's USDC balance:", await usdc.balanceOf(beefyVault.address));

};


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
