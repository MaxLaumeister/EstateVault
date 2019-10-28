pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VaultKey is ERC721 {

    address public _parentContract;

    modifier onlyParentContract() {
         require(msg.sender == _parentContract, "functions can only be called from the main VaultManager contract");
         _;
    }

    constructor (address parentContract) public {
        _parentContract = parentContract;
    }

    function mint(address to, uint256 tokenId) public onlyParentContract {
        _mint(to, tokenId);
    }

    function yank(address from, address to, uint256 tokenId) public onlyParentContract {
        _transferFrom(from, to, tokenId);
    }

    // TODO: Check owner in when they do anything including transfer
}
