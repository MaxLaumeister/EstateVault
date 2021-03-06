pragma solidity 0.5.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Vault.sol";
import "./VaultAccessERC721.sol";

contract VaultManager {
    
    struct VaultInfo {
        Vault vaultContract;
        uint checkInInterval;
        uint lastCheckIn;
    }

    VaultInfo[] public vaults;

    VaultAccessERC721 public vaultKeyTokenContract;
    VaultAccessERC721 public vaultBeneficiaryTicketTokenContract;

    constructor() public {
        // Global setup
        vaultKeyTokenContract = new VaultAccessERC721(this);
        vaultBeneficiaryTicketTokenContract = new VaultAccessERC721(this);
    }

    function newVault() public {
        uint256 vaultId = vaults.length;
        // Create instance of the child contract, with this contract as the parent
        Vault userVaultContract = new Vault(vaultKeyTokenContract, vaultId);
        vaultKeyTokenContract.mintAuthorized(msg.sender, vaultId); // Create a key and send it to the user
        vaultBeneficiaryTicketTokenContract.mintAuthorized(address(userVaultContract), vaultId); // Create a beneficiary ticket and leave it inside the user's vault
        vaults.push(VaultInfo(userVaultContract, 365 days, block.timestamp + 365 days)); // Save info about the vault
    }

    // If you have the beneficiary ticket, when it's time, use your ticket to yank the vault key away from its current owner.
    // Upon use, your beneficiary ticket will be locked in the vault for future reuse.
    function claimVaultKeyAsBeneficiary(uint256 vaultId) public {
        require(_isAuthorizedBeneficiary(vaultId), "either the release time is in the future, or you do not have the right beneficiary claim ticket");
        vaultKeyTokenContract.transferAuthorized(vaultKeyTokenContract.ownerOf(vaultId), msg.sender, vaultId); // Transfer the key from its current owner to msg.sender, the beneficiary.
        VaultInfo memory vault = vaults[vaultId];
        vaultBeneficiaryTicketTokenContract.transferAuthorized(msg.sender, address(vault.vaultContract), vaultId); // Transfer the benificiary claim ticket into the vault
    }

    function setCheckInInterval(uint256 vaultId, uint newCheckInInterval) public {
        require(vaultKeyTokenContract.ownerOf(vaultId) == msg.sender, "only owner can set check in interval");
        vaults[vaultId].checkInInterval = newCheckInInterval;
        // Automatically check in
        _checkIn(vaultId);
    }

    function checkIn(uint256 vaultId) public {
        require(vaultKeyTokenContract.ownerOf(vaultId) == msg.sender, "only owner can check in");
            _checkIn(vaultId);
    }

    function autoCheckIn(uint256 vaultId, address sender) public {
        require(address(vaultKeyTokenContract) == msg.sender
            || address(vaultBeneficiaryTicketTokenContract) == msg.sender
            , "only the authorized token contracts can call this");
        if (vaultKeyTokenContract.ownerOf(vaultId) == sender) {
            _checkIn(vaultId);
        }
    }

    function _checkIn(uint256 vaultId) private {
        vaults[vaultId].lastCheckIn = block.timestamp;
    }

    function _isAuthorizedBeneficiary(uint256 vaultId) private view returns (bool) {
        // Beneficiary is only allowed if the timelock is up
        require(vaultId < vaults.length);
        VaultInfo memory vault = vaults[vaultId];
        return vaultBeneficiaryTicketTokenContract.ownerOf(vaultId) == msg.sender && block.timestamp >= vault.lastCheckIn + vault.checkInInterval; // safemath should be used, but not a critical issue because these variables were set by the owner
    }

    // TODO: Emit events
}
