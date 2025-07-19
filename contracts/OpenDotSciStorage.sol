// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OpenDotSciStorage {
    address public owner;
    address public controller;

    // --- Enums ---
    enum ProposalStatus { Pending, AI_Approved, Rejected, Funded }
    enum PaperStatus { Pending, AI_Approved, Peer_Approved, Reproduced }

    // --- Structs ---
    struct Paper {
        uint256 id;
        address author;
        string greenfieldCID;
        bytes32 expectedOutputHash;
        PaperStatus status;
        uint256 forVotes;
        uint256 againstVotes;
        mapping(address => bool) hasVoted;
    }

    struct GrantProposal {
        uint256 id;
        address proposer;
        string description;
        uint256 requestedAmount;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        ProposalStatus status;
        mapping(address => bool) hasVoted;
    }

    // --- State Variables ---
    mapping(uint256 => Paper) public papers;
    mapping(uint256 => GrantProposal) public proposals;
    uint256 public paperCounter;
    uint256 public proposalCounter;

    // --- Modifiers ---
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyController() { require(msg.sender == controller, "Not controller"); _; }

    constructor() { owner = msg.sender; }

    function setController(address _controller) external onlyOwner {
        controller = _controller;
    }

    // --- Paper Functions (Controller-only) ---
    function incrementPaperCounter() external onlyController returns (uint256) {
        return ++paperCounter;
    }
    function storePaper(uint256 _id, address _author, string memory _cid, bytes32 _expectedHash) external onlyController {
        papers[_id].id = _id;
        papers[_id].author = _author;
        papers[_id].greenfieldCID = _cid;
        papers[_id].expectedOutputHash = _expectedHash;
        papers[_id].status = PaperStatus.Pending;
    }
    function setPaperStatus(uint256 _paperId, PaperStatus _status) external onlyController {
        papers[_paperId].status = _status;
    }
    function voteForPaper(uint256 _paperId, address _voter) external onlyController {
        require(!papers[_paperId].hasVoted[_voter], "Already voted");
        papers[_paperId].forVotes++;
        papers[_paperId].hasVoted[_voter] = true;
    }
    function voteAgainstPaper(uint256 _paperId, address _voter) external onlyController {
        require(!papers[_paperId].hasVoted[_voter], "Already voted");
        papers[_paperId].againstVotes++;
        papers[_paperId].hasVoted[_voter] = true;
    }

    // --- Grant Functions (Controller-only) ---
    function incrementProposalCounter() external onlyController returns (uint256) {
        return ++proposalCounter;
    }
    function createGrant(uint256 _id, address _proposer, string memory _desc, uint256 _amount) external onlyController {
        GrantProposal storage newProposal = proposals[_id];
        newProposal.id = _id;
        newProposal.proposer = _proposer;
        newProposal.description = _desc;
        newProposal.requestedAmount = _amount;
        newProposal.status = ProposalStatus.Pending;
    }
    function setProposalStatus(uint256 _proposalId, ProposalStatus _status) external onlyController {
        proposals[_proposalId].status = _status;
    }
    function voteForGrant(uint256 _proposalId, address _voter) external onlyController {
        require(!proposals[_proposalId].hasVoted[_voter], "Already voted");
        proposals[_proposalId].forVotes++;
        proposals[_proposalId].hasVoted[_voter] = true;
    }
    function voteAgainstGrant(uint256 _proposalId, address _voter) external onlyController {
        require(!proposals[_proposalId].hasVoted[_voter], "Already voted");
        proposals[_proposalId].againstVotes++;
        proposals[_proposalId].hasVoted[_voter] = true;
    }
}