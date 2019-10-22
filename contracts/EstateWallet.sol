pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Wallet is Ownable {

    // This contract is NOT payable using unwrapped ether

    uint releaseTime; // The unix time (ms) when the beneficiary will gain access
    uint checkInInterval; // How long (in ms) after the owner last checks in until the beneficiary gains access

    address beneficiary; // The recipient of the funds if the owner fails to keep checking in
    
    modifier onlyAuthorizedUser() {
         require(msg.sender == owner() || (msg.sender == beneficiary && now > releaseTime));
         _;
    }

    constructor(address _beneficiary, uint _checkInInterval) internal {
        beneficiary = _beneficiary;
        checkInInterval = _checkInInterval;
        releaseTime = now + _checkInInterval;
    }

    function setCheckInInterval(uint _checkInInterval) onlyOwner public {
        checkIn(); // Automatically check in
        checkInInterval = _checkInInterval;
    }

    // Make sure to check in well before the release time, or the beneficiary will gain control!
    function checkIn() onlyOwner public {
        releaseTime = now + checkInInterval;
    }

    function transferERC20(address tokenContractAddress, address recipient, uint256 amount) onlyAuthorizedUser public {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        tokenContract.transfer(recipient, amount);
    }

    function transferERC721(address tokenContractAddress, address recipient, uint256 amount) onlyAuthorizedUser public {
        IERC721 tokenContract = IERC721(tokenContractAddress);
        tokenContract.safeTransferFrom(address(this), recipient, amount);
    }

    // This contract should not be destroyable, it would only allow for user error
}
