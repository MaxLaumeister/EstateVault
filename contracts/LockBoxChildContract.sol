pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";

contract LockBoxChildContract is ERC721Holder  {

    address public _parentContract;

    modifier onlyParentContract() {
         require(msg.sender == _parentContract, "only parent contract can make calls to child contract");
         _;
    }

    function () external payable {} // This contract acts like a wallet, holding ETH, ERC-20 and ERC-721

    constructor (address parentContract) public {
        _parentContract = parentContract;
    }

    function transferERC20(address tokenContractAddress, address recipient, uint256 amount) public onlyParentContract {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        tokenContract.transfer(recipient, amount);
    }

    function transferERC721(address tokenContractAddress, address recipient, uint256 tokenId) public onlyParentContract {
        IERC721 tokenContract = IERC721(tokenContractAddress);
        tokenContract.safeTransferFrom(address(this), recipient, tokenId); // This potentially passes control to an external contract
    }

    function transferETH(address payable recipient, uint256 amount) public onlyParentContract {
        recipient.transfer(amount); // This potentially passes control to an external contract
    }

}
