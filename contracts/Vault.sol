pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";

contract Vault is ERC721Holder  {

    address public _parentContract;
    uint256 public _vaultId;

    modifier onlyParentContract() {
         require(msg.sender == _parentContract, "transfer functions can only be called from the main VaultManager contract");
         _;
    }

    function () external payable {} // This contract acts like a wallet, holding ETH, ERC-20 and ERC-721

    constructor (address parentContract, uint256 vaultId) public {
        _parentContract = parentContract;
        _vaultId = vaultId;
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
