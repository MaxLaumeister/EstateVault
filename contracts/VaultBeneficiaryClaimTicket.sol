pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract VaultBeneficiaryClaimTicket is ERC721 {

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

    // TODO: Inherit an abstract contract alongside VaultKey to make it DRY
}
