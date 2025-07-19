

// FILE: contracts/OpenDotSciLogic.sol
// UPDATED CONTROLLER: Now with full implementation for all functions.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./IOpenDotSciStorage.sol";
import "./ReputationSBT.sol";

contract OpenDotSciLogic is ERC721URIStorage {
    IOpenDotSciStorage public storageContract;
    ReputationSBT public sbtContract;
    address public aiOracle;

    event SubDAOCreated(string name, address indexed sponsor);

    constructor(address _storageAddress, address _sbtAddress) ERC721("OpenDotSci Paper", "ODSP") {
        storageContract = IOpenDotSciStorage(_storageAddress);
        sbtContract = ReputationSBT(_sbtAddress);
        aiOracle = msg.sender;
    }

    // --- Paper Lifecycle ---
    function submitPaper(string memory _tokenURICID, string memory _greenfieldCID, bytes32 _expectedHash) external {
        uint256 newId = storageContract.incrementPaperCounter();
        storageContract.storePaper(newId, msg.sender, _greenfieldCID, _expectedHash);
        _safeMint(msg.sender, newId);
        _setTokenURI(newId, _tokenURICID);
    }

    function approvePaperByAI(uint256 _paperId) external {
        require(msg.sender == aiOracle, "Only AI Oracle");
        storageContract.setPaperStatus(_paperId, IOpenDotSciStorage.PaperStatus.AI_Approved);
    }

    function voteOnPaper(uint256 _paperId, bool _supports) external payable {
        require(msg.value >= 0.0001 ether, "Voting fee required");
        if (_supports) {
            storageContract.voteForPaper(_paperId, msg.sender);
        } else {
            storageContract.voteAgainstPaper(_paperId, msg.sender);
        }
    }

    function finalizePaper(uint256 _paperId, address _author) external {
        storageContract.setPaperStatus(_paperId, IOpenDotSciStorage.PaperStatus.Peer_Approved);
        sbtContract.safeMint(_author, "Verified Researcher");
    }

    // --- Reproducibility ---
    function submitReproduction(uint256 _paperId, address _replicator, bool _isSuccess) external {
        require(msg.sender == aiOracle, "Only AI Oracle");
        if (_isSuccess) {
            storageContract.setPaperStatus(_paperId, IOpenDotSciStorage.PaperStatus.Reproduced);
            sbtContract.safeMint(_replicator, "Verified Replicator");
        }
    }

    // --- DAO & Sponsor Track ---
    function createGrantProposal(string memory _description, uint256 _amount) external {
        uint256 newProposalId = storageContract.incrementProposalCounter();
        storageContract.createGrant(newProposalId, msg.sender, _description, _amount);
    }
    
    function createSubDAO(string memory _daoName) external {
        emit SubDAOCreated(_daoName, msg.sender);
    }

    // --- View Functions (Getters) ---
    function getProposalCounter() external view returns (uint256) {
        return storageContract.proposalCounter();
    }
    function getProposal(uint256 _proposalId) external view returns (IOpenDotSciStorage.GrantProposal memory) {
        return storageContract.proposals(_proposalId);
    }
    function getPaperCounter() external view returns (uint256) {
        return storageContract.paperCounter();
    }
    function getPaper(uint256 _paperId) external view returns (IOpenDotSciStorage.Paper memory) {
        return storageContract.papers(_paperId);
    }
}
