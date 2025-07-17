// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// FILE: contracts/OpenDotSciStorage.sol
// THE MODEL: This contract ONLY holds data. It has no public logic.
// Its only job is to store state and ensure only the authorized Controller
// contract can make changes to it.

contract OpenDotSciStorage {
    address public owner;
    address public controller;

    // --- Data Structs ---
    enum ProposalStatus { Pending, AI_Approved, Rejected, Funded }

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

    // --- State Variables (The Database) ---
    mapping(uint256 => string) public paperDataCID;
    mapping(uint256 => GrantProposal) public proposals;
    uint256 public paperCounter;
    uint256 public proposalCounter;

    // --- Events ---
    event ControllerSet(address indexed newController);
    event GrantCreated(uint256 indexed proposalId, address indexed proposer);
    event StatusChanged(uint256 indexed proposalId, ProposalStatus newStatus);

    // --- Modifiers (Access Control) ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyController() {
        require(msg.sender == controller, "Caller is not the controller");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // --- Administrative Functions ---
    function setController(address _controller) external onlyOwner {
        controller = _controller;
        emit ControllerSet(_controller);
    }

    // --- Internal Logic Functions (Callable ONLY by the Controller) ---
    function incrementPaperCounter() external onlyController returns (uint256) {
        paperCounter++;
        return paperCounter;
    }

    function storePaper(uint256 _id, string memory _cid) external onlyController {
        paperDataCID[_id] = _cid;
    }

    function createGrant(uint256 _id, address _proposer, string memory _desc, uint256 _amount) external onlyController {
        proposals[_id].id = _id;
        proposals[_id].proposer = _proposer;
        proposals[_id].description = _desc;
        proposals[_id].requestedAmount = _amount;
        proposals[_id].status = ProposalStatus.Pending;
        emit GrantCreated(_id, _proposer);
    }
    
    function incrementProposalCounter() external onlyController returns (uint256) {
        proposalCounter++;
        return proposalCounter;
    }

    function setProposalStatus(uint256 _proposalId, ProposalStatus _status) external onlyController {
        proposals[_proposalId].status = _status;
        emit StatusChanged(_proposalId, _status);
    }

    function voteFor(uint256 _proposalId, address _voter) external onlyController {
        require(!proposals[_proposalId].hasVoted[_voter], "Already voted");
        proposals[_proposalId].forVotes++;
        proposals[_proposalId].hasVoted[_voter] = true;
    }

    function voteAgainst(uint256 _proposalId, address _voter) external onlyController {
        require(!proposals[_proposalId].hasVoted[_voter], "Already voted");
        proposals[_proposalId].againstVotes++;
        proposals[_proposalId].hasVoted[_voter] = true;
    }
}
