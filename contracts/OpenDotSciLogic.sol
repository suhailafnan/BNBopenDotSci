// UPDATED CONTROLLER: Includes all new logic for AI, voting, reproducibility, and SBTs.

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
        aiOracle = msg.sender; // For the demo, the deployer is the oracle
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
        // In a real app, you'd add a check here to ensure paper status is AI_Approved
        if (_supports) {
            storageContract.voteForPaper(_paperId, msg.sender);
        } else {
            storageContract.voteAgainstPaper(_paperId, msg.sender);
        }
    }

    function finalizePaper(uint256 _paperId, address _author) external {
        // In a real app, you'd read vote counts from storage and check them here.
        // For the demo, we'll assume it passes and mint the SBT.
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
        // For the hackathon, we simulate the creation by emitting an event.
        // A full implementation would deploy a new contract here.
        emit SubDAOCreated(_daoName, msg.sender);
    }
}
