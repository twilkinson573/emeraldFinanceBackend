const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const accountBalance = await deployer.getBalance();

  console.log('Deploying contracts with account: ', deployer.address);
  console.log('Account balance: ', accountBalance.toString());

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();
  await lottery.deployed();
  console.log("Lottery deployed to:", lottery.address);

  const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
  const emerald = await Emerald.deploy(1_000_000);
  await emerald.deployed();
  console.log("Emerald deployed to:", emerald.address);

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