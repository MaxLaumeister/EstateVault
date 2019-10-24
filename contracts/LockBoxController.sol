pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./LockBoxWallet.sol";

contract LockBoxController is ERC721 {

    using SafeMath for uint256;
    
    struct LockBox {
        address childContractAddress;
        uint checkInInterval;
        uint releaseTime;
        address beneficiary;
    }

    uint256 _tokenCount;

    LockBox[] lockBoxes;

    constructor() public {
        // Global setup
    }

    function newLockBox() public returns (uint256) {
        // Create instance of the child contract, with this contract as the parent
        LockBoxWallet childContract = new LockBoxWallet(address(this));
        uint256 lockboxId = _tokenCount;
        _mint(msg.sender, lockboxId); // Create a new ERC-721 token with sequential ID
        _tokenCount = _tokenCount.add(1); // If successful, increment the token count.
        lockBoxes[lockboxId] = LockBox(address(childContract), 365 days, block.timestamp + 365 days, address(0));
        lockBoxes[lockboxId];
        return lockboxId;
    }

    // Transfer a lockbox to a new owner
    function transferFrom(address from, address to, uint256 lockboxId) public {
        require(_isAuthorized(lockboxId));
        _transferFrom(from, to, lockboxId);
    }

    function transferERC20(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 amount) public {
        require(_isAuthorized(lockboxId));
        LockBoxWallet childContract = LockBoxWallet(lockBoxes[lockboxId].childContractAddress);
        childContract.transferERC20(tokenContractAddress, recipient, amount);
    }

    function transferERC721(uint256 lockboxId, address tokenContractAddress, address recipient, uint256 tokenId) public {
        require(_isAuthorized(lockboxId));
        LockBoxWallet childContract = LockBoxWallet(lockBoxes[lockboxId].childContractAddress);
        childContract.transferERC721(tokenContractAddress, recipient, tokenId);
    }

    function _isAuthorized(uint256 lockboxId) private view returns (bool) {
        // Only the owner, or if the timelock is up, the beneficiary.
        LockBox memory lockbox = lockBoxes[lockboxId];
        return _isApprovedOrOwner(msg.sender, lockboxId) ||
            (msg.sender == lockbox.beneficiary && block.timestamp >= lockbox.releaseTime);
    }
}
