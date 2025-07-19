// FILE: contracts/ReputationSBT.sol
// This is the Soulbound Token contract for on-chain reputation.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSBT is ERC721, Ownable {
    uint256 private _nextTokenId;
    enum TokenType { Researcher, Replicator }
    mapping(uint256 => TokenType) public tokenTypes;

    constructor() ERC721("OpenDotSci Reputation", "ODSR") Ownable(msg.sender) {}

    function safeMint(address to, TokenType _type) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        tokenTypes[tokenId] = _type;
    }
    
    function setApprovalForAll(address, bool) public pure override { revert("SBTs cannot be approved for transfer"); }
    function transferFrom(address, address, uint256) public pure override { revert("SBTs are non-transferable"); }
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override { revert("SBTs are non-transferable"); }
}
