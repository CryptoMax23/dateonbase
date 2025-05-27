import { ethers } from "hardhat";

async function main() {
  console.log("Deploying DateNFT contract...");

  const DateNFT = await ethers.getContractFactory("DateNFT");
  const dateNFT = await DateNFT.deploy();
  await dateNFT.waitForDeployment();

  const address = await dateNFT.getAddress();
  console.log("DateNFT deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 