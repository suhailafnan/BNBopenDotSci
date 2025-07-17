// SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;
// FILE: contracts/OpenDotSciLogic.sol
// THE CONTROLLER: This contract contains all business logic. It reads and writes
// data to the Storage contract. This is the contract your frontend will talk to.


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./IOpenDotSciStorage.sol"; // Import the interface

contract OpenDotSciLogic is ERC721URIStorage {
    IOpenDotSciStorage public storageContract;

    // --- Events ---
    event PaperSubmitted(uint256 indexed paperId, address indexed author, string greenfieldCID);
    event Voted(uint256 indexed proposalId, address indexed voter, bool hasSupported);

    constructor(address _storageAddress) ERC721("OpenDotSci Paper", "ODSP") {
        storageContract = IOpenDotSciStorage(_storageAddress);
    }

    // --- Core Public Functions ---

    function submitPaper(string memory _title, string memory _greenfieldCID, string memory _tokenURICID) external {
        uint256 newId = storageContract.incrementPaperCounter();
        
        // Mint the NFT to the author
        _safeMint(msg.sender, newId);
        
        // Set the NFT's metadata (pointing to a JSON on Greenfield)
        _setTokenURI(newId, _tokenURICID);
        
        // Store the full paper's CID in the storage contract
        storageContract.storePaper(newId, _greenfieldCID);
        
        emit PaperSubmitted(newId, msg.sender, _greenfieldCID);
    }

    function createGrantProposal(string memory _description, uint256 _amount) external {
        uint256 newProposalId = storageContract.incrementProposalCounter();
        storageContract.createGrant(newProposalId, msg.sender, _description, _amount);
    }

    function approveProposalByAI(uint256 _proposalId) external {
        // In a real app, this would be restricted to a trusted AI oracle
        // For the hackathon, anyone can call it to move the demo forward
        storageContract.setProposalStatus(_proposalId, IOpenDotSciStorage.ProposalStatus.AI_Approved);
    }

    function voteOnProposal(uint256 _proposalId, bool _supports) external payable {
        // Require a small fee to vote, preventing spam
        require(msg.value >= 0.0001 ether, "Voting fee required");

        // Note: We would need to read the proposal status from the storage contract.
        // To do this properly, the storage contract needs getter functions.
        // For the hackathon, we'll assume the frontend checks this.
        // A full implementation would add:
        // require(storageContract.proposals(_proposalId).status == IOpenDotSciStorage.ProposalStatus.AI_Approved, "Proposal not AI approved");

        if (_supports) {
            storageContract.voteFor(_proposalId, msg.sender);
        } else {
            storageContract.voteAgainst(_proposalId, msg.sender);
        }
        
        emit Voted(_proposalId, msg.sender, _supports);
    }

    function executeProposal(uint256 _proposalId) external {
        // Logic to check if a proposal has passed and send funds would go here.
        // This involves adding getter functions to the storage contract to read vote counts.
        // Example:
        // (uint256 forVotes, uint256 againstVotes) = storageContract.getVoteCounts(_proposalId);
        // require(forVotes > againstVotes, "Proposal did not pass");
        // ... send funds ...
    }
}
