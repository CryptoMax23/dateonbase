const { ethers } = require("hardhat");

async function main() {
  // Get the contract instance for Base Sepolia
  const dateNFT = await ethers.getContractAt(
    "DateNFT",
    "0xC7ab8D8937Ad81408aCb93aFc57E90d9A6868eF8" // Base Sepolia address
  );

  console.log("Testing DateNFT contract on Base Sepolia...");
  console.log("Contract address:", await dateNFT.getAddress());
  
  // Get the mint price
  const mintPrice = await dateNFT.mintPrice();
  console.log("Current mint price:", ethers.formatEther(mintPrice), "ETH");

  // Test reading contract state
  const dateId = 20250101; // January 1, 2025
  const isMinted = await dateNFT.isDateMinted(dateId);
  console.log("\nChecking if January 1, 2025 is minted:", isMinted);

  if (!isMinted) {
    console.log("\nDate is available for minting!");
    console.log("To mint this date, you need:");
    console.log("1. Base Sepolia ETH (get from faucet)")
    console.log("2. Send a transaction with exactly", ethers.formatEther(mintPrice), "ETH");
    console.log("\nYou can mint this date through the website or directly through Base Sepolia Explorer:");
    console.log("https://sepolia.basescan.org/address/0xC7ab8D8937Ad81408aCb93aFc57E90d9A6868eF8#writeContract");
  } else {
    // If minted, show the owner
    const owner = await dateNFT.ownerOf(dateId);
    console.log("This date is already owned by:", owner);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 