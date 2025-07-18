
// FILE: contracts/OpenDotSciLogic.sol
// UPDATED CONTROLLER: Added getter functions to read data from the storage contract.

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

    // --- Write Functions ---
    function submitPaper(string memory _tokenURICID, string memory _greenfieldCID, bytes32 _expectedHash) external { /* ... */ }
    function approvePaperByAI(uint256 _paperId) external { /* ... */ }
    function voteOnPaper(uint256 _paperId, bool _supports) external payable { /* ... */ }
    function finalizePaper(uint256 _paperId, address _author) external { /* ... */ }
    function submitReproduction(uint256 _paperId, address _replicator, bool _isSuccess) external { /* ... */ }
    function createGrantProposal(string memory _description, uint256 _amount) external { /* ... */ }
    function createSubDAO(string memory _daoName) external { /* ... */ }

    // --- NEWLY ADDED VIEW FUNCTIONS (GETTERS) ---
    function getProposalCounter() external view returns (uint256) {
        return storageContract.proposalCounter();
    }

    function getProposal(uint256 _proposalId) external view returns (IOpenDotSciStorage.GrantProposal memory) {
        return storageContract.proposals(_proposalId);
    }
}

