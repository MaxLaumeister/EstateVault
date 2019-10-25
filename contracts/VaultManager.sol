pragma solidity >=0.4.21 <0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Vault.sol";

contract VaultManager is ERC721 {

    using SafeMath for uint256;
    
    struct VaultInfo {
        address payable childContractAddress;
        uint checkInInterval;
        uint lastCheckIn;
        address beneficiary;
    }

    VaultInfo[] public vaults;

    constructor() public {
        // Global setup
    }

    function newVault() public {
        uint256 vaultId = vaults.length;
        // Create instance of the child contract, with this contract as the parent
        Vault childContract = new Vault(address(this), vaultId);
        _mint(msg.sender, vaultId); // Create a new ERC-721 token with sequential ID
        vaults.push(VaultInfo(address(childContract), 365 days, block.timestamp + 365 days, address(0)));
    }

    // As beneficiary, transfer ownership to an address of your choice. Zeroes out the beneficiary.
    function claimOwnershipAsBeneficiary(uint256 vaultId, address from, address to) public {
        require(_isAuthorizedBeneficiary(vaultId), "either the release time is in the future, or the sending account is not a beneficiary");
        _transferFrom(from, to, vaultId);
        vaults[vaultId].beneficiary = address(0); // Zero out beneficiary
    }

    function setBeneficiary(uint256 vaultId, address beneficiary) public {
        require(_isOwner(vaultId), "only owner can set beneficiary");
        vaults[vaultId].beneficiary = beneficiary;
        // Important: Check in (which resets endowment date) when setting beneficiary. This keeps the beneficiary from having immediate access.
        vaults[vaultId].lastCheckIn = block.timestamp;
    }

    function removeBeneficiary(uint256 vaultId) public {
        require(_isOwner(vaultId), "only owner can remove beneficiary");
        vaults[vaultId].beneficiary = address(0);
    }

    function setCheckInInterval(uint256 vaultId, uint newCheckInInterval) public {
        require(_isOwner(vaultId), "only owner can set check in interval");
        vaults[vaultId].checkInInterval = newCheckInInterval;
        // Automatically check in
        vaults[vaultId].lastCheckIn = block.timestamp;
    }

    function checkIn(uint256 vaultId) public {
        require(_isOwner(vaultId), "only owner can check in");
        vaults[vaultId].lastCheckIn = block.timestamp;
    }

    function transferERC20(uint256 vaultId, address tokenContractAddress, address recipient, uint256 amount) public {
        require(_isOwner(vaultId), "only owner can transfer ERC20");
        Vault childContract = Vault(vaults[vaultId].childContractAddress);
        childContract.transferERC20(tokenContractAddress, recipient, amount);
    }

    function transferERC721(uint256 vaultId, address tokenContractAddress, address recipient, uint256 tokenId) public {
        require(_isOwner(vaultId), "only owner can transfer ERC721");
        Vault childContract = Vault(vaults[vaultId].childContractAddress);
        childContract.transferERC721(tokenContractAddress, recipient, tokenId); // This potentially passes control to an external contract
    }

    function transferETH(uint256 vaultId, address payable recipient, uint256 amount) public {
        require(_isOwner(vaultId), "only owner can transfer ETH");
        Vault childContract = Vault(vaults[vaultId].childContractAddress);
        childContract.transferETH(recipient, amount); // This potentially passes control to an external contract
    }

    function _isAuthorizedBeneficiary(uint256 vaultId) private view returns (bool) {
        // Beneficiary is only allowed if the timelock is up
        VaultInfo memory vault = vaults[vaultId];
        return msg.sender == vault.beneficiary && block.timestamp >= vault.lastCheckIn + vault.checkInInterval; // safemath should be used, but not a critical issue because these variables were set by the owner
    }

    function _isOwner(uint256 vaultId) private view returns (bool) {
        return msg.sender == ownerOf(vaultId);
    }

    // TODO: Emit events
}
