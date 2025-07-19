// FILE: scripts/deploy.ts
// FINAL, CORRECTED DEPLOY SCRIPT: This deploys all contracts and links them correctly.

import hre from "hardhat";

async function main() {
  const { ethers } = hre;
  console.log("Starting full deployment...");

  // 1. Deploy OpenDotSciToken (ODT)
  const ODTFactory = await ethers.getContractFactory("OpenDotSciToken");
  const odtContract = await ODTFactory.deploy();
  await odtContract.waitForDeployment();
  const odtAddress = odtContract.target;
  console.log(`✅ OpenDotSciToken (ODT) deployed to: ${odtAddress}`);

  // 2. Deploy ReputationSBT contract
  const SBTFactory = await ethers.getContractFactory("ReputationSBT");
  const sbtContract = await SBTFactory.deploy();
  await sbtContract.waitForDeployment();
  const sbtAddress = sbtContract.target;
  console.log(`✅ ReputationSBT contract deployed to: ${sbtAddress}`);

  // 3. Deploy Storage Contract
  const StorageFactory = await ethers.getContractFactory("OpenDotSciStorage");
  const storageContract = await StorageFactory.deploy();
  await storageContract.waitForDeployment();
  const storageAddress = storageContract.target;
  console.log(`✅ OpenDotSciStorage (Model) deployed to: ${storageAddress}`);

  // 4. Deploy Logic Contract, linking it to all others
  const LogicFactory = await ethers.getContractFactory("OpenDotSciLogic");
  const logicContract = await LogicFactory.deploy(storageAddress, sbtAddress, odtAddress);
  await logicContract.waitForDeployment();
  const logicAddress = logicContract.target;
  console.log(`✅ OpenDotSciLogic (Controller) deployed to: ${logicAddress}`);

  // 5. Authorize Logic contract to control Storage
  console.log("Authorizing Logic contract on Storage contract...");
  const tx1 = await storageContract.setController(logicAddress);
  await tx1.wait();
  console.log("-> Authorization complete.");

  // 6. Authorize Logic contract to mint SBTs
  console.log("Authorizing Logic contract on SBT contract...");
  const tx2 = await sbtContract.transferOwnership(logicAddress);
  await tx2.wait();
  console.log("-> Authorization complete.");
  
  // 7. Authorize Logic contract to mint ODT tokens
  console.log("Authorizing Logic contract on ODT contract...");
  const tx3 = await odtContract.transferOwnership(logicAddress);
  await tx3.wait();
  console.log("-> Authorization complete.");

  console.log("----------------------------------------------------");
  console.log("✅ Deployment successful!");
  console.log(`Storage Contract: ${storageAddress}`);
  console.log(`SBT Contract: ${sbtAddress}`);
  console.log(`ODT Contract: ${odtAddress}`);
  console.log(`Logic Contract (Your Frontend's Target): ${logicAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
