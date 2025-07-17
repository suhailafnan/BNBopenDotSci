import hre from "hardhat"; // FIX: Changed import to be more robust for VS Code

async function main() {
  const { ethers } = hre; // FIX: Destructure ethers from the hardhat runtime environment
  console.log("Starting deployment...");

  // 1. Deploy the Storage Contract (The Model)
  const OpenDotSciStorage = await ethers.getContractFactory("OpenDotSciStorage");
  const storageContract = await OpenDotSciStorage.deploy();
  await storageContract.waitForDeployment();
  const storageAddress = await storageContract.getAddress();
  console.log(`✅ OpenDotSciStorage (Model) deployed to: ${storageAddress}`);

  // 2. Deploy the Logic Contract (The Controller)
  const OpenDotSciLogic = await ethers.getContractFactory("OpenDotSciLogic");
  // Pass the storage contract's address to the logic contract's constructor
  const logicContract = await OpenDotSciLogic.deploy(storageAddress);
  await logicContract.waitForDeployment();
  const logicAddress = await logicContract.getAddress();
  console.log(`✅ OpenDotSciLogic (Controller) deployed to: ${logicAddress}`);

  // 3. Set the Controller on the Storage Contract (Crucial Final Step)
  console.log("Authorizing Logic contract to control Storage contract...");
  const tx = await storageContract.setController(logicAddress);
  await tx.wait(); // Wait for the transaction to be mined
  console.log("✅ Authorization complete.");
  console.log("----------------------------------------------------");
  console.log("Deployment successful!");
  console.log(`Storage Contract Address: ${storageAddress}`);
  console.log(`Logic Contract Address: ${logicAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});