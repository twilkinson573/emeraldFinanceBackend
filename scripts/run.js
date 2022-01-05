const hre = require("hardhat");

async function main() {

  // Get references to signers
  const [owner, randomPerson] = await hre.ethers.getSigners();

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();

  await lottery.deployed();

  console.log("Lottery deployed to:", lottery.address);

  console.log("Contracts deployed by:", owner.address);

  const bal = await lottery.checkHisBalance();
  console.log("Cheese:", bal);

  console.log("Total supply");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
