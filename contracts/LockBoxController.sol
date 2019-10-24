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
        uint lastCheckIn;
        address beneficiary;
    }

    LockBox[] public lockboxes;

    constructor() public {
        // Global setup
    }

    function newLockBox() public {
        // Create instance of the child contract, with this contract as the parent
        LockBoxChildContract childContract = new LockBoxChildContract(address(this));
        uint256 lockboxId = lockboxes.length;
        _mint(msg.sender, lockboxId); // Create a new ERC-721 token with sequential ID
        lockboxes.push(LockBox(address(childContract), 365 days, block.timestamp + 365 days, address(0)));
    }

    // As beneficiary, transfer ownership to an address of your choice. Zeroes out the beneficiary.
    function claimOwnershipAsBeneficiary(uint256 lockboxId, address from, address to) public {
        require(_isAuthorizedBeneficiary(lockboxId));
        _transferFrom(from, to, lockboxId);
        lockboxes[lockboxId].beneficiary = address(0); // Zero out beneficiary
    }

    function setBeneficiary(uint256 lockboxId, address beneficiary) public {
        require(_isOwner(lockboxId));
        lockboxes[lockboxId].beneficiary = beneficiary;
    }

    function setCheckInInterval(uint256 lockboxId, uint newCheckInInterval) public {
        require(_isOwner(lockboxId));
        lockboxes[lockboxId].checkInInterval = newCheckInInterval;
        lockboxes[lockboxId].lastCheckIn = block.timestamp;
    }

    function checkIn(uint256 lockboxId) public {
        require(_isOwner(lockboxId));
        lockboxes[lockboxId].lastCheckIn = block.timestamp;
    }

    function transferERC20(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 amount) public {
        require(_isOwner(lockboxId));
        LockBoxChildContract childContract = LockBoxChildContract(lockboxes[lockboxId].childContractAddress);
        childContract.transferERC20(tokenContractAddress, recipient, amount);
    }

    function transferERC721(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 tokenId) public {
        require(_isOwner(lockboxId));
        LockBoxChildContract childContract = LockBoxChildContract(lockboxes[lockboxId].childContractAddress);
        childContract.transferERC721(tokenContractAddress, recipient, tokenId);
    }

    function _isAuthorizedBeneficiary(uint256 lockboxId) private view returns (bool) {
        // Beneficiary is only allowed if the timelock is up
        LockBox memory lockbox = lockboxes[lockboxId];
        return msg.sender == lockbox.beneficiary && block.timestamp >= lockbox.lastCheckIn + lockbox.checkInInterval; // No need for safemath, because these variables were set sanely by the owner
    }

    function _isOwner(uint256 lockboxId) private view returns (bool) {
        return msg.sender == ownerOf(lockboxId);
    }

    // TODO: Emit events
}
