// SPDX-License-Identifier: ISC
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol";

contract Token is ERC721Votes {
    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) EIP712(_name, "1") {

    }

    function getTotalSupply() public view returns(uint256) {
        return _getTotalSupply();
    }

    function mint(address userAccount, uint256 tokenId) public {
        _mint(userAccount, tokenId);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    
}
