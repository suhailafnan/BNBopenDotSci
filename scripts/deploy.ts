import hre from "hardhat";
// FIX: Import the contract type from TypeChain for casting
import { ReputationSBT } from "../typechain-types";

async function main() {
  const { ethers } = hre;
  console.log("Starting full deployment...");

  // 1. Deploy ReputationSBT contract
  const ReputationSBTFactory = await ethers.getContractFactory("ReputationSBT");
  // FIX: Cast the deployed contract to its specific type
  const sbtContract = await ReputationSBTFactory.deploy() as ReputationSBT;
  await sbtContract.waitForDeployment();
  const sbtAddress = await sbtContract.getAddress();
  console.log(`✅ ReputationSBT contract deployed to: ${sbtAddress}`);

  // 2. Deploy Storage Contract
  const OpenDotSciStorageFactory = await ethers.getContractFactory("OpenDotSciStorage");
  const storageContract = await OpenDotSciStorageFactory.deploy();
  await storageContract.waitForDeployment();
  const storageAddress = await storageContract.getAddress();
  console.log(`✅ OpenDotSciStorage (Model) deployed to: ${storageAddress}`);

  // 3. Deploy Logic Contract, linking it to the other two
  const OpenDotSciLogicFactory = await ethers.getContractFactory("OpenDotSciLogic");
  const logicContract = await OpenDotSciLogicFactory.deploy(storageAddress, sbtAddress);
  await logicContract.waitForDeployment();
  const logicAddress = await logicContract.getAddress();
  console.log(`✅ OpenDotSciLogic (Controller) deployed to: ${logicAddress}`);

  // 4. Authorize Logic contract to control Storage
  console.log("Authorizing Logic contract on Storage contract...");
  const tx1 = await storageContract.setController(logicAddress);
  await tx1.wait();
  console.log("-> Authorization complete.");

  // 5. Authorize Logic contract to mint SBTs by transferring ownership
  console.log("Authorizing Logic contract on SBT contract...");
  const tx2 = await sbtContract.transferOwnership(logicAddress);
  await tx2.wait();
  console.log("-> Authorization complete.");

  console.log("----------------------------------------------------");
  console.log("✅ Deployment successful!");
  console.log(`Storage Contract: ${storageAddress}`);
  console.log(`SBT Contract: ${sbtAddress}`);
  console.log(`Logic Contract (Your Frontend's Target): ${logicAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});