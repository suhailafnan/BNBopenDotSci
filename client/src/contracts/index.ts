// This file centralizes your contract information, making it easy to manage.


export const logicContractAddress = "0xa7234f78c1fBD8b7d048c8aFF132fbefB28D9672";

// This is a minimal ABI (Application Binary Interface) for the functions we need to call.
// You can get the full ABI from your Hardhat project under 'artifacts/contracts/OpenDotSciLogic.sol/OpenDotSciLogic.json'
export const logicContractABI = [
  "function submitPaper(string memory _tokenURICID, string memory _greenfieldCID, bytes32 _expectedHash)",
  "function createGrantProposal(string memory _description, uint256 _amount)",
  "function voteOnProposal(uint256 _proposalId, bool _supports) payable",
  // Add any view functions you need to read data here, e.g.,
  // "function proposals(uint256) view returns (uint256 id, address proposer, string description, uint256 requestedAmount, uint256 forVotes, uint256 againstVotes, bool executed, uint8 status)"
];