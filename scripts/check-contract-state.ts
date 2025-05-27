const hre = require("hardhat");

async function main() {
  const contractAddress = "0xBBb811040c8D20aC5F30467BC10a4795d8292D05";
  const dateNFT = await hre.ethers.getContractAt("DateNFT", contractAddress);

  console.log("Checking DateNFT contract state...");
  console.log("Contract address:", contractAddress);

  try {
    const mintStartDate = await dateNFT.mintStartDate();
    const mintEndDate = await dateNFT.mintEndDate();
    const mintingEnabled = await dateNFT.mintingEnabled();
    const isEmergencyStopped = await dateNFT.isEmergencyStopped();
    const isPaused = await dateNFT.paused();

    console.log("\nContract State:");
    console.log("-------------");
    console.log("Mint Start Date:", mintStartDate.toString());
    console.log("Mint End Date:", mintEndDate.toString());
    console.log("Minting Enabled:", mintingEnabled);
    console.log("Emergency Stopped:", isEmergencyStopped);
    console.log("Contract Paused:", isPaused);

    // Check specific date (2025/01/01)
    const dateToCheck = 20250101;
    const isMinted = await dateNFT.datesMinted(dateToCheck);
    console.log("\nChecking date 2025/01/01:");
    console.log("Already minted:", isMinted);
    
  } catch (error) {
    console.error("Error checking contract state:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 