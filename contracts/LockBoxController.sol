pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./LockBoxChildContract.sol";

contract LockBoxController is ERC721 {

    using SafeMath for uint256;
    
    struct LockBox {
        address payable childContractAddress;
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
        require(_isAuthorizedBeneficiary(lockboxId), "either the release time is in the future, or the sending account is not a beneficiary");
        _transferFrom(from, to, lockboxId);
        lockboxes[lockboxId].beneficiary = address(0); // Zero out beneficiary
    }

    function setBeneficiary(uint256 lockboxId, address beneficiary) public {
        require(_isOwner(lockboxId), "only owner can set beneficiary");
        lockboxes[lockboxId].beneficiary = beneficiary;
        // Important: Check in (which resets endowment date) when setting beneficiary. This keeps the beneficiary from having immediate access.
        lockboxes[lockboxId].lastCheckIn = block.timestamp;
    }

    function removeBeneficiary(uint256 lockboxId) public {
        require(_isOwner(lockboxId), "only owner can set beneficiary");
        lockboxes[lockboxId].beneficiary = address(0);
    }

    function setCheckInInterval(uint256 lockboxId, uint newCheckInInterval) public {
        require(_isOwner(lockboxId), "only owner can set check in interval");
        lockboxes[lockboxId].checkInInterval = newCheckInInterval;
        // Automatically check in
        lockboxes[lockboxId].lastCheckIn = block.timestamp;
    }

    function checkIn(uint256 lockboxId) public {
        require(_isOwner(lockboxId), "only owner can check in");
        lockboxes[lockboxId].lastCheckIn = block.timestamp;
    }

    function transferERC20(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 amount) public {
        require(_isOwner(lockboxId), "only owner can transfer ERC20");
        LockBoxChildContract childContract = LockBoxChildContract(lockboxes[lockboxId].childContractAddress);
        childContract.transferERC20(tokenContractAddress, recipient, amount);
    }

    function transferERC721(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 tokenId) public {
        require(_isOwner(lockboxId), "only owner can transfer ERC721");
        LockBoxChildContract childContract = LockBoxChildContract(lockboxes[lockboxId].childContractAddress);
        childContract.transferERC721(tokenContractAddress, recipient, tokenId); // This potentially passes control to an external contract
    }

    function transferETH(uint256 lockboxId, address payable recipient, uint256 amount) public {
        require(_isOwner(lockboxId), "only owner can transfer ETH");
        LockBoxChildContract childContract = LockBoxChildContract(lockboxes[lockboxId].childContractAddress);
        childContract.transferETH(recipient, amount); // This potentially passes control to an external contract
    }

    function _isAuthorizedBeneficiary(uint256 lockboxId) private view returns (bool) {
        // Beneficiary is only allowed if the timelock is up
        LockBox memory lockbox = lockboxes[lockboxId];
        return msg.sender == lockbox.beneficiary && block.timestamp >= lockbox.lastCheckIn + lockbox.checkInInterval; // safemath should be used, but not a critical issue because these variables were set by the owner
    }

    function _isOwner(uint256 lockboxId) private view returns (bool) {
        return msg.sender == ownerOf(lockboxId);
    }

    // TODO: Emit events
}
