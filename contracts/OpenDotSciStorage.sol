
// FILE: contracts/OpenDotSciStorage.sol
// CORRECTED FILE: Made `papers` and `proposals` mappings internal and added explicit getter functions that return tuples.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OpenDotSciStorage {
    address public owner;
    address public controller;
    enum ProposalStatus { Pending, AI_Approved, Rejected, Funded }
    enum PaperStatus { Pending, AI_Approved, Peer_Approved, Reproduced }
    
    struct Paper {
        uint256 id;
        address author;
        string greenfieldCID;
        bytes32 expectedOutputHash;
        PaperStatus status;
        uint256 salePrice;
        uint256 forVotes;
        uint256 againstVotes;
        address paperDAO;
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

    mapping(uint256 => Paper) internal papers;
    mapping(uint256 => GrantProposal) internal proposals;
    uint256 public paperCounter;
    uint256 public proposalCounter;

    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyController() { require(msg.sender == controller, "Not controller"); _; }
    constructor() { owner = msg.sender; }
    function setController(address _controller) external onlyOwner { controller = _controller; }
    
    // --- Getters ---
    function getPaper(uint256 _id) external view returns (uint256, address, string memory, bytes32, PaperStatus, uint256, uint256, uint256, address) {
        Paper storage p = papers[_id];
        return (p.id, p.author, p.greenfieldCID, p.expectedOutputHash, p.status, p.salePrice, p.forVotes, p.againstVotes, p.paperDAO);
    }
    
    function getProposal(uint256 _id) external view returns (uint256, address, string memory, uint256, uint256, uint256, bool, ProposalStatus) {
        GrantProposal storage p = proposals[_id];
        return (p.id, p.proposer, p.description, p.requestedAmount, p.forVotes, p.againstVotes, p.executed, p.status);
    }

    // --- Write Functions ---
    function incrementPaperCounter() external onlyController returns (uint256) { return ++paperCounter; }
    function storePaper(uint256 _id, address _author, string memory _cid, bytes32 _expectedHash, uint256 _price) external onlyController {
        papers[_id].id = _id; papers[_id].author = _author; papers[_id].greenfieldCID = _cid;
        papers[_id].expectedOutputHash = _expectedHash; papers[_id].status = PaperStatus.Pending; papers[_id].salePrice = _price;
    }
    function setPaperDAO(uint256 _paperId, address _daoAddress) external onlyController { papers[_paperId].paperDAO = _daoAddress; }
    function setPaperStatus(uint256 _paperId, PaperStatus _status) external onlyController { papers[_paperId].status = _status; }
    function addVoteForPaper(uint256 _paperId, address _voter, uint256 _weight) external onlyController {
        require(!papers[_paperId].hasVoted[_voter], "Already voted");
        papers[_paperId].forVotes += _weight; papers[_paperId].hasVoted[_voter] = true;
    }
    function addVoteAgainstPaper(uint256 _paperId, address _voter, uint256 _weight) external onlyController {
        require(!papers[_paperId].hasVoted[_voter], "Already voted");
        papers[_paperId].againstVotes += _weight; papers[_paperId].hasVoted[_voter] = true;
    }
    function incrementProposalCounter() external onlyController returns (uint256) { return ++proposalCounter; }
    function createGrant(uint256 _id, address _proposer, string memory _desc, uint256 _amount) external onlyController {
        GrantProposal storage p = proposals[_id]; p.id = _id; p.proposer = _proposer;
        p.description = _desc; p.requestedAmount = _amount; p.status = ProposalStatus.Pending;
    }
    function setProposalStatus(uint256 _proposalId, ProposalStatus _status) external onlyController { proposals[_proposalId].status = _status; }
    function addVoteForGrant(uint256 _proposalId, address _voter, uint256 _weight) external onlyController {
        require(!proposals[_proposalId].hasVoted[_voter], "Already voted");
        proposals[_proposalId].forVotes += _weight; proposals[_proposalId].hasVoted[_voter] = true;
    }
    function addVoteAgainstGrant(uint256 _proposalId, address _voter, uint256 _weight) external onlyController {
        require(!proposals[_proposalId].hasVoted[_voter], "Already voted");
        proposals[_proposalId].againstVotes += _weight; proposals[_proposalId].hasVoted[_voter] = true;
    }
}