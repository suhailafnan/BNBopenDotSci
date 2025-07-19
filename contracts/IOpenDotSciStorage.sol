// FILE: contracts/IOpenDotSciStorage.sol
// CORRECTED FILE: This interface is now correct and complete.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OpenDotSciStorage.sol";

interface IOpenDotSciStorage {
    // Write functions
    function incrementPaperCounter() external returns (uint256);
    function storePaper(uint256 _id, address _author, string memory _cid, bytes32 _expectedHash, uint256 _price) external;
    function setPaperDAO(uint256 _paperId, address _daoAddress) external;
    function setPaperStatus(uint256 _paperId, OpenDotSciStorage.PaperStatus _status) external;
    function addVoteForPaper(uint256 _paperId, address _voter, uint256 _weight) external;
    function addVoteAgainstPaper(uint256 _paperId, address _voter, uint256 _weight) external;
    function incrementProposalCounter() external returns (uint256);
    function createGrant(uint256 _id, address _proposer, string memory _desc, uint256 _amount) external;
    function setProposalStatus(uint256 _proposalId, OpenDotSciStorage.ProposalStatus _status) external;
    function addVoteForGrant(uint256 _proposalId, address _voter, uint256 _weight) external;
    function addVoteAgainstGrant(uint256 _proposalId, address _voter, uint256 _weight) external;

    // View functions
    function getPaper(uint256 _id) external view returns (uint256, address, string memory, bytes32, OpenDotSciStorage.PaperStatus, uint256, uint256, uint256, address);
    function getProposal(uint256 _id) external view returns (uint256, address, string memory, uint256, uint256, uint256, bool, OpenDotSciStorage.ProposalStatus);
    function proposalCounter() external view returns (uint256);
    function paperCounter() external view returns (uint256);
}