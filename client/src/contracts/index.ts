
// This is your deployed Logic Contract address!
export const logicContractAddress = "0xa7234f78c1fBD8b7d048c8aFF132fbefB28D9672";

// This is the ABI for your contract.
export const logicContractABI = [
  "function submitPaper(string memory _tokenURICID, string memory _greenfieldCID, bytes32 _expectedHash)",
  "function createGrantProposal(string memory _description, uint256 _amount)",
  "function voteOnProposal(uint256 _proposalId, bool _supports) payable",
  "function paperCounter() view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getProposalCounter() view returns (uint256)",
  "function getProposal(uint256) view returns (tuple(uint256 id, address proposer, string description, uint256 requestedAmount, uint256 forVotes, uint256 againstVotes, bool executed, uint8 status))"
];
