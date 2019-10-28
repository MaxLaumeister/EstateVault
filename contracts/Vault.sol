pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "./VaultManager.sol";

contract Vault is ERC721Holder  {

    VaultManager _parentContract;
    uint256 public _vaultId;

    modifier onlyParentContract() {
         require(msg.sender == address(_parentContract), "functions can only be called from the main VaultManager contract");
         _;
    }

    function () external payable {} // This contract acts like a wallet, holding ETH, ERC-20 and ERC-721

    constructor (VaultManager parentContract, uint256 vaultId) public {
        _parentContract = parentContract;
        _vaultId = vaultId;
    }

    function transferERC20(address tokenContractAddress, address recipient, uint256 amount) public {
        require(_parentContract.isOwner(_vaultId), "only the owner of this vault's key can withdraw ERC20");
        IERC20 tokenContract = IERC20(tokenContractAddress);
        tokenContract.transfer(recipient, amount);
    }

    function transferERC721(address tokenContractAddress, address recipient, uint256 tokenId) public {
        require(_parentContract.isOwner(_vaultId), "only the owner of this vault's key can withdraw ERC721");
        IERC721 tokenContract = IERC721(tokenContractAddress);
        tokenContract.safeTransferFrom(address(this), recipient, tokenId); // This potentially passes control to an external contract
    }

    function transferETH(address payable recipient, uint256 amount) public {
        require(_parentContract.isOwner(_vaultId), "only the owner of this vault's key can withdraw ETH");
        recipient.transfer(amount); // This potentially passes control to an external contract
    }

    //function removeBeneficiary(uint256 vaultId) public {
    //    require(isOwner(vaultId), "only owner can remove beneficiary");
        // TODO: Yank beneficiary ticket back into the vault
    //}

}
