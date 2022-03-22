const { ethers } = require("hardhat");

const main = async () => {

  // VARS =============================================

  const [deployer, bob, jane] = await hre.ethers.getSigners();

  // console.log('Deploying contracts with account: ', deployer.address);
  // console.log('Account balance: ', accountBalance.toString());

  // DEPLOY CONTRACTS =================================

  const Usdc = await hre.ethers.getContractFactory("ERC20Mock");
  const usdc = await Usdc.deploy("USDC", "USDC", ethers.utils.parseUnits("1000000.0"));
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
  const bobFundingAmount = ethers.utils.parseUnits("10000.0");
  await usdc.transfer(bob.address, bobFundingAmount);
  const janeFundingAmount = ethers.utils.parseUnits("10000.0");
  await usdc.transfer(jane.address, janeFundingAmount);


  // USER MAKES DEPOSIT ================================

  const bobApproveUsdcTxn = await usdc.connect(bob).approve(lottery.address, ethers.utils.parseUnits("1000000.0"));
  await bobApproveUsdcTxn.wait();
  const janeApproveUsdcTxn = await usdc.connect(jane).approve(lottery.address, ethers.utils.parseUnits("1000000.0"));
  await janeApproveUsdcTxn.wait();

  await showBeefyStats(beefyVault);

  console.log(" ")
  const bobDepositAmount = ethers.utils.parseUnits("4000.0");
  console.log(`########## TX: Bob deposit ${ethers.utils.formatEther(bobDepositAmount)} USDC to Lottery...`);
  const bobDepositTxn = await lottery.connect(bob).makeDeposit(bobDepositAmount);
  await bobDepositTxn.wait();

  await showRetailUserStats("Bob", bob, lottery, usdc);
  await showRetailUserStats("Jane", jane, lottery, usdc);
  await showLotteryStats(lottery, usdc, beefyVault);
  await showBeefyStats(beefyVault);


  console.log(" ")
  const janeDepositAmount = ethers.utils.parseUnits("1000.0");
  console.log(`########## TX: Jane deposit ${ethers.utils.formatEther(janeDepositAmount)} USDC to Lottery...`);
  const janeDepositTxn = await lottery.connect(jane).makeDeposit(janeDepositAmount);
  await janeDepositTxn.wait();

  const janeDepositTxn1 = await lottery.connect(jane).makeDeposit(ethers.utils.parseUnits("2000.0"));
  await janeDepositTxn1.wait();

  await showRetailUserStats("Bob", bob, lottery, usdc);
  await showRetailUserStats("Jane", jane, lottery, usdc);
  await showLotteryStats(lottery, usdc, beefyVault);
  await showBeefyStats(beefyVault);

  // USER MAKES WITHDRAWAL =============================

  console.log(" ")
  const rewardAmount = ethers.utils.parseUnits("1000.0")
  console.log(`######### MOCK: Yield farming strategy deposits ${ethers.utils.formatEther(rewardAmount)} USDC into vault`)
  await usdc.transfer(beefyVault.address, rewardAmount);

  await showBeefyStats(beefyVault);

  console.log(" ")
  let bobTicketId = await lottery.tokenOfOwnerByIndex(bob.address, 0) 
  console.log(`########## TX: Bob withdrawing ticket #${bobTicketId} from Lottery...`);
  const withdrawTxn = await lottery.connect(bob).withdrawTicket(bobTicketId);
  await withdrawTxn.wait();

  await showRetailUserStats("Bob", bob, lottery, usdc);
  await showRetailUserStats("Jane", jane, lottery, usdc);
  await showLotteryStats(lottery, usdc, beefyVault);
  await showBeefyStats(beefyVault);

};

async function showRetailUserStats (name, retailUser, lottery, usdc) {
  console.log(" ");
  let retailUserBalance = await lottery.balanceOf(retailUser.address);
  console.log(`${name}'s lottery tickets count:`, retailUserBalance);

  for (let i=0; i < retailUserBalance; i++) {
    let userTicket = await lottery.tokenOfOwnerByIndex(retailUser.address, i);
    console.log(`Ticket ${userTicket}:`, await lottery.lotteryTickets(userTicket));
  }

  console.log(`${name}'s USDC balance:`, await usdc.balanceOf(retailUser.address))
}

async function showLotteryStats (lottery, usdc, beefyVault) {
  console.log(" ");
  console.log("Lottery Tickets Count:", await lottery.totalSupply());
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
