// FILE: src/contracts/index.ts
// UPDATED FILE: Using your latest deployed contract address and the complete ABI.

// This is your deployed Logic Contract address!
export const logicContractAddress = "0x31F85bFb8853BAed9628dDe050822160A5F48835";

// This is the final, complete ABI for your Logic contract.
export const logicContractABI = [
  "function submitPaper(string memory _uri, string memory _cid, bytes32 _hash, uint256 _price, bool _createDAO)",
  "function createGrantProposal(string memory _description, uint256 _amount)",
  "function voteOnPaper(uint256 _paperId, bool _supports) payable",
  "function getProposalCounter() view returns (uint256)",
  "function getProposal(uint256) view returns (tuple(uint256 id, address proposer, string description, uint256 requestedAmount, uint256 forVotes, uint256 againstVotes, bool executed, uint8 status))",
  "function getPaperCounter() view returns (uint256)",
  "function getPaper(uint256) view returns (tuple(uint256 id, address author, string greenfieldCID, bytes32 expectedOutputHash, uint8 status, uint256 salePrice, uint256 forVotes, uint256 againstVotes, address paperDAO))",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];
