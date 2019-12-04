pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/* Both the vault "key" contract and the vault "beneficiary claim
ticket" contract are instantiated from this VaultAccessERC721 */ 

contract VaultAccessERC721 is ERC721 {

    address public _parentContract;

    modifier onlyParentContract() {
         require(msg.sender == _parentContract, "functions can only be called from the main VaultManager contract");
         _;
    }

    constructor (address parentContract) public {
        _parentContract = parentContract;
    }

    function mintAuthorized(address to, uint256 tokenId) public onlyParentContract {
        _safeMint(to, tokenId);
    }

    function transferAuthorized(address from, address to, uint256 tokenId) public onlyParentContract {
        _safeTransferFrom(from, to, tokenId, "");
    }
}
