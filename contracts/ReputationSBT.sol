// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationSBT is ERC721, Ownable {
    uint256 private _nextTokenId;

    // The Ownable constructor must be called. We make the deployer the initial owner.
    constructor() ERC721("OpenDotSci Reputation", "ODSR") Ownable(msg.sender) {}

    function safeMint(address to, string memory metadataURI) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        // Note: For a full implementation, you would set a tokenURI.
        // For the hackathon demo, just owning the token is enough proof.
    }

    // FIX: Removed the override for `_approve` as it is not virtual in all OpenZeppelin versions.
    // The overrides below are sufficient to make the token non-transferable.
    function setApprovalForAll(address operator, bool approved) public pure override {
        revert("SBTs cannot be approved for transfer");
    }

    function transferFrom(address from, address to, uint256 tokenId) public pure override {
        revert("SBTs are non-transferable");
    }

    // FIX: Changed `bytes calldata data` to `bytes memory data` to match the standard ERC721 interface.
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public pure override {
        revert("SBTs are non-transferable");
    }
}