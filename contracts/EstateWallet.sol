pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract EstateWallet is Ownable {

    // This contract is NOT payable using unwrapped ether

    uint public _releaseTime; // The time (seconds since unix epoch) when the beneficiary will gain access
    uint public _checkInInterval; // How long (in ms) after the owner last checks in until the beneficiary gains access

    address public _beneficiary; // The recipient of the funds if the owner fails to keep checking in

    modifier onlyAuthorizedUser() {
         require(msg.sender == owner() || (msg.sender == _beneficiary && block.timestamp >= _releaseTime));
         _;
    }

    constructor() public {
        // We do not set _beneficiary here. It's null (nobody) until set.
        _checkInInterval = 365 days; // Set check-in interval to 365 days by default
        _releaseTime = block.timestamp + _checkInInterval; // Set release time to be in the future
    }

    function setBeneficiary(address newBeneficiary) public onlyOwner {
        _beneficiary = newBeneficiary;
    }

    function setCheckInInterval(uint newCheckInInterval) public onlyOwner {
        _checkInInterval = newCheckInInterval;
        checkIn(); // Automatically check in
    }

    // Make sure to check in well before the release time, or the beneficiary will gain control!
    function checkIn() public onlyOwner {
        _releaseTime = block.timestamp + _checkInInterval;
    }

    function transferERC20(address tokenContractAddress, address recipient, uint256 amount) public onlyAuthorizedUser {
        IERC20 tokenContract = IERC20(tokenContractAddress);
        tokenContract.transfer(recipient, amount);
    }

    function transferERC721(address tokenContractAddress, address recipient, uint256 amount) public onlyAuthorizedUser {
        IERC721 tokenContract = IERC721(tokenContractAddress);
        tokenContract.safeTransferFrom(address(this), recipient, amount);
    }

    // This contract should not be destroyable, it would allow a user to strand tokens too easily
}
