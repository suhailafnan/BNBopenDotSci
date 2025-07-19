
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOpenDotSciStorage {
    enum ProposalStatus { Pending, AI_Approved, Rejected, Funded }
    enum PaperStatus { Pending, AI_Approved, Peer_Approved, Reproduced }

    struct GrantProposal {
        uint256 id;
        address proposer;
        string description;
        uint256 requestedAmount;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        ProposalStatus status;
    }
    
    struct Paper {
        uint256 id;
        address author;
        string greenfieldCID;
        bytes32 expectedOutputHash;
        PaperStatus status;
        uint256 forVotes;
        uint256 againstVotes;
    }

    // Write functions
    function incrementPaperCounter() external returns (uint256);
    function storePaper(uint256 _id, address _author, string memory _cid, bytes32 _expectedHash) external;
    function setPaperStatus(uint256 _paperId, PaperStatus _status) external;
    function voteForPaper(uint256 _paperId, address _voter) external;
    function voteAgainstPaper(uint256 _paperId, address _voter) external;
    function incrementProposalCounter() external returns (uint256);
    function createGrant(uint256 _id, address _proposer, string memory _desc, uint256 _amount) external;
    function setProposalStatus(uint256 _proposalId, ProposalStatus _status) external;
    function voteForGrant(uint256 _proposalId, address _voter) external;
    function voteAgainstGrant(uint256 _proposalId, address _voter) external;

    // View functions
    function proposalCounter() external view returns (uint256);
    function proposals(uint256) external view returns (GrantProposal memory);
    function paperCounter() external view returns (uint256); // <-- NEW
    function papers(uint256) external view returns (Paper memory); // <-- NEW
}

