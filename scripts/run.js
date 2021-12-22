const hre = require("hardhat");

async function main() {

  // Get references to signers
  const [owner, randomPerson] = await hre.ethers.getSigners();

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy();

  await lottery.deployed();

  console.log("Lottery deployed to:", lottery.address);

  // Deploy EmeraldToken
  const Emerald = await hre.ethers.getContractFactory("EmeraldToken");
  const emerald = await Emerald.deploy(1_000_000);

  await emerald.deployed();

  console.log("Emerald deployed to:", emerald.address);

  console.log("Contracts deployed by:", owner.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
