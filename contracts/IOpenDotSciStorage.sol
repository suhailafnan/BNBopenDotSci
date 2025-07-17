// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// FILE: contracts/IOpenDotSciStorage.sol
// This is an Interface. It defines the functions that our Logic contract
// can call on our Storage contract. It's a blueprint for communication.

interface IOpenDotSciStorage {
    enum ProposalStatus { Pending, AI_Approved, Rejected, Funded }

    function incrementPaperCounter() external returns (uint256);
    function storePaper(uint256 _id, string memory _cid) external;
    function createGrant(uint256 _id, address _proposer, string memory _desc, uint256 _amount) external;
    function incrementProposalCounter() external returns (uint256); // <-- FIX: Added missing function
    function setProposalStatus(uint256 _proposalId, ProposalStatus _status) external;
    function voteFor(uint256 _proposalId, address _voter) external;
    function voteAgainst(uint256 _proposalId, address _voter) external;
}

