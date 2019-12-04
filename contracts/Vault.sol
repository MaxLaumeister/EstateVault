pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "./VaultAccessERC721.sol";

contract Vault is ERC721Holder  {

    VaultAccessERC721 public _vaultKeyTokenContract;
    uint256 public _vaultId;

    function () external payable {} // This contract acts like a wallet, holding ETH, ERC-20 and ERC-721

    constructor (VaultAccessERC721 vaultKeyTokenContract, uint256 vaultId) public {
        _vaultKeyTokenContract = vaultKeyTokenContract;
        _vaultId = vaultId;
    }

    function transferERC20(IERC20 tokenContract, address recipient, uint256 amount) public {
        require(_vaultKeyTokenContract.ownerOf(_vaultId) == msg.sender, "only the owner of this vault's key can withdraw ERC20");
        tokenContract.transfer(recipient, amount); // This potentially passes control to an external contract
    }

    function transferERC721(IERC721 tokenContract, address recipient, uint256 tokenId) public {
        require(_vaultKeyTokenContract.ownerOf(_vaultId) == msg.sender, "only the owner of this vault's key can withdraw ERC721");
        tokenContract.safeTransferFrom(address(this), recipient, tokenId); // This potentially passes control to an external contract
    }

    function transferETH(address payable recipient, uint256 amount) public {
        require(_vaultKeyTokenContract.ownerOf(_vaultId) == msg.sender, "only the owner of this vault's key can withdraw ETH");
        recipient.transfer(amount); // This potentially passes control to an external contract
    }

}
