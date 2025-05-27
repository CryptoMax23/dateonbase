const hre = require("hardhat");

async function main() {
  console.log("Deploying DateNFT contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const DateNFT = await hre.ethers.getContractFactory("DateNFT");
  const dateNFT = await DateNFT.deploy();
  await dateNFT.waitForDeployment();

  const address = await dateNFT.getAddress();
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Contract Address:", address);
  console.log("Contract URI: https://dateonbase.vercel.app/api/contract-metadata");
  console.log("Collection Name: DateOnBase");
  console.log("Symbol: DATE");
  console.log("Initial Mint Price: 0.01 ETH");

  // Verify the contract
  console.log("\nWaiting for 5 block confirmations before verification...");
  await dateNFT.deploymentTransaction()?.wait(5);

  console.log("\nVerifying contract on Base Sepolia...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.log("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 