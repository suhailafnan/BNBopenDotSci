
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Grant is Ownable {
    address public immutable researcher;

    constructor(address _researcher) Ownable(msg.sender) {
        researcher = _researcher;
    }

    // Allow anyone to fund this specific research
    receive() external payable {}

    // Allow only the original researcher to withdraw the funds
    function withdraw() external {
        require(msg.sender == researcher, "Only the researcher can withdraw.");
        payable(researcher).transfer(address(this).balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
