pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./VaultManager.sol";

/* Both the vault "key" contract and the vault "beneficiary claim
ticket" contract are instantiated from this VaultAccessERC721 */ 

contract VaultAccessERC721 is ERC721 {

    VaultManager public _parentContract;

    modifier onlyParentContract() {
         require(msg.sender == address(_parentContract), "functions can only be called from the main VaultManager contract");
         _;
    }

    constructor (VaultManager parentContract) public {
        _parentContract = parentContract;
    }

    function mintAuthorized(address to, uint256 tokenId) public onlyParentContract {
        _safeMint(to, tokenId);
    }

    function transferAuthorized(address from, address to, uint256 tokenId) public onlyParentContract {
        _safeTransferFrom(from, to, tokenId, "");
    }

    // When the vault owner transfers anything, check in
    // TODO: Test coverage
    function _transferFrom(address from, address to, uint256 tokenId) internal {
        _parentContract.autoCheckIn(tokenId, msg.sender); // Token IDs always match up with Vault IDs. This function will check our msg.sender to see if it's the vault owner.
        super._transferFrom(from, to, tokenId);
    }
}
