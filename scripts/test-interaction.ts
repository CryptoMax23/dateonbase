import { ethers } from "hardhat";

async function main() {
  // Get the contract instance
  const dateNFT = await ethers.getContractAt(
    "DateNFT",
    "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Address from deployment
  );

  // Get signers (accounts)
  const [owner, user1] = await ethers.getSigners();
  
  console.log("Testing DateNFT contract interactions...");
  console.log("Contract address:", await dateNFT.getAddress());
  
  // Test minting a date
  const dateId = 20250101; // January 1, 2025
  const mintPrice = await dateNFT.mintPrice();
  
  console.log("\nTesting mint function...");
  console.log("Minting date:", dateId);
  console.log("Current mint price:", ethers.formatEther(mintPrice), "ETH");
  
  const mintTx = await dateNFT.connect(user1).mint(dateId, { value: mintPrice });
  await mintTx.wait();
  
  // Check if date is minted
  const isMinted = await dateNFT.datesMinted(dateId);
  console.log("Date minted successfully:", isMinted);
  
  // Check owner of the date
  const owner1 = await dateNFT.ownerOf(dateId);
  console.log("Owner of date:", owner1);
  console.log("User1 address:", user1.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 