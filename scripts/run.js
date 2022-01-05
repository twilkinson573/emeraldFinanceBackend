const main = async () => {

  // VARS =============================================

  const [deployer, bobAddr] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();
  const totalEmeraldSupply = 100_000_000;

  console.log('Deploying contracts with account: ', deployer.address);
  console.log('Account balance: ', accountBalance.toString());


  // DEPLOY CONTRACTS =================================

  const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
  const em = await Emerald.deploy(totalEmeraldSupply);
  await em.deployed();

  console.log("Emerald Token deployed to:", em.address);

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(em.address);
  await lottery.deployed();

  console.log("Lottery deployed to:", lottery.address);


  // TRANSFER EMERALD TOKENS ===========================

  await em.transfer(lottery.address, totalEmeraldSupply);

  console.log("Lottery EMER balance:", await em.balanceOf(lottery.address));


  console.log("Bob making deposit...");
  depositTxn = await lottery.connect(bobAddr).makeDeposit(50_000_000);
  await depositTxn.wait();

  console.log("Lottery EMER balance:", await em.balanceOf(lottery.address));
  console.log("Bob's EMER balance:", await em.balanceOf(bobAddr.address));

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