// scripts/deploy.js

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy();

  console.log("Election contract deployed to:", election.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
