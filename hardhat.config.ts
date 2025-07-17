import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"; // FIX: Explicitly import for VS Code intellisense

// IMPORTANT:
// 1. Go to your MetaMask wallet.
// 2. Create a NEW, EMPTY account. Do NOT use your main account.
// 3. Export the private key for this NEW account.
// 4. Create a new file in your project's root directory called ".env"
// 5. In that .env file, add the following line, replacing YOUR_PRIVATE_KEY with the key you just exported:
//    PRIVATE_KEY="YOUR_PRIVATE_KEY"

// We need to install a new package to read from the .env file
// Run this in your terminal: pnpm install dotenv
import "dotenv/config";

const privateKey = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    opbnb_testnet: {
      url: "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: [privateKey],
    },
  },
};

export default config;