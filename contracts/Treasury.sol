// SPDX-License-Identifier: ISC
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Treasury is Ownable {
    uint256 totalFunds; 
    address public payee; 
    
    constructor(
        address _payee
    ) payable {
        totalFunds += msg.value;
        payee = _payee;
    }

    function releaseFunds(uint amount) public onlyOwner {
        require(amount < totalFunds);
        totalFunds -= amount;
        payable(payee).transfer(amount);
    }
}