pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract LockBoxWallet  {

    address _parentContract;

    modifier onlyParentContract() {
         require(msg.sender == _parentContract);
         _;
    }

    constructor (address parentContract) public {
        _parentContract = parentContract;
    }

    function transferERC20(address tokenContractAddress, address recipient, uint256 amount) public onlyParentContract {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        tokenContract.transfer(recipient, amount);
    }

    function transferERC721(address tokenContractAddress, address recipient, uint256 tokenId) public onlyParentContract {
        IERC721 tokenContract = IERC721(tokenContractAddress);
        tokenContract.safeTransferFrom(address(this), recipient, tokenId);
    }
}
