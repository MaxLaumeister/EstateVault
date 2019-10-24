pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./LockBoxChildContract.sol";

contract LockBoxController is ERC721 {

    using SafeMath for uint256;
    
    struct LockBox {
        address childContractAddress;
        uint checkInInterval;
        uint releaseTime;
        address beneficiary;
    }

    LockBox[] public lockBoxes;

    constructor() public {
        // Global setup
    }

    function newLockBox() public {
        // Create instance of the child contract, with this contract as the parent
        LockBoxChildContract childContract = new LockBoxChildContract(address(this));
        uint256 lockboxId = lockBoxes.length;
        _mint(msg.sender, lockboxId); // Create a new ERC-721 token with sequential ID
        lockBoxes.push(LockBox(address(childContract), 365 days, block.timestamp + 365 days, address(0)));
    }

    // As beneficiary, transfer ownership to an address of your choice
    function claimAsBeneficiary(address from, address to, uint256 lockboxId) public {
        require(_isAuthorizedBeneficiary(lockboxId));
        _transferFrom(from, to, lockboxId);
    }

    function transferERC20(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 amount) public {
        require(_isOwner(lockboxId));
        LockBoxChildContract childContract = LockBoxChildContract(lockBoxes[lockboxId].childContractAddress);
        childContract.transferERC20(tokenContractAddress, recipient, amount);
    }

    function transferERC721(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 tokenId) public {
        require(_isOwner(lockboxId));
        LockBoxChildContract childContract = LockBoxChildContract(lockBoxes[lockboxId].childContractAddress);
        childContract.transferERC721(tokenContractAddress, recipient, tokenId);
    }

    function _isAuthorizedBeneficiary(uint256 lockboxId) private view returns (bool) {
        // Beneficiary is only allowed if the timelock is up
        LockBox memory lockbox = lockBoxes[lockboxId];
        return msg.sender == lockbox.beneficiary && block.timestamp >= lockbox.releaseTime;
    }

    function _isOwner(uint256 lockboxId) private view returns (bool) {
        return msg.sender == ownerOf(lockboxId);
    }
}
