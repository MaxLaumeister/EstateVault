const VaultManager = artifacts.require("VaultManager");
const Vault = artifacts.require("Vault");
const VaultAccessERC721 = artifacts.require("VaultAccessERC721");
const ERC20Mintable = artifacts.require("ERC20Mintable");
const ERC721Mintable = artifacts.require("ERC721Mintable");
const truffleAssert = require('truffle-assertions');

const NUM_CONTRACTS = 3; // Do not edit - address 4 and greater are used for additional tests

let erc20MintableInstance;
let erc721MintableInstance;

contract("Setup", async function(accounts) {
    it("done", async function() {
        erc20MintableInstance = await ERC20Mintable.deployed()
        erc721MintableInstance = await ERC721Mintable.deployed()
    });
});

contract("VaultManager", async function(accounts) {

    let vaultManagerInstance;
    let vaultKeyInstance;
    let vaultBeneficiaryClaimTicketInstance;

    let childContracts = [];

    /*describe("setup", async function() {
        it("deploy ", async function() {
            erc20MintableInstance = await ERC20Mintable.deployed()
        });
    });*/

    describe("deployment", async function() {

        it("is deployed", async function() {
            vaultManagerInstance = await VaultManager.deployed();
            vaultKeyInstance = await VaultAccessERC721.at(await vaultManagerInstance.vaultKeyTokenContract());
            vaultBeneficiaryClaimTicketInstance = await VaultAccessERC721.at(await vaultManagerInstance.vaultBeneficiaryTicketTokenContract());
        });

        it("can create " + NUM_CONTRACTS + " properly-owned vaults with sequential IDs", async function() {
            for (let i = 0; i < NUM_CONTRACTS; i++) {
                await vaultManagerInstance.newVault({ from: accounts[i] });
                assert.equal(await vaultKeyInstance.ownerOf(i), accounts[i]);
            }
        });

        it("has " + NUM_CONTRACTS + " new child contracts with the correct key token contract", async function() {
            for (let i = 0; i < NUM_CONTRACTS; i++) {
                let childcontract = (await vaultManagerInstance.vaults(i)).vaultContract;
                childContracts.push(childcontract);
                assert.equal(await (await Vault.at(childcontract))._vaultKeyTokenContract(), vaultKeyInstance.address);
            }
        });

        it("beneficiary starts as the vault itself", async function() {
            assert.equal(await vaultBeneficiaryClaimTicketInstance.ownerOf(0), (await vaultManagerInstance.vaults(0)).vaultContract);
        });

    });

    describe("ownership", async function() {
    
        it("owner can transfer ownership of vault", async function() {
            await vaultKeyInstance.safeTransferFrom(accounts[0], accounts[3], 0 /* ERC721 token id */, { from: accounts[0] });
            assert.equal(await vaultKeyInstance.ownerOf(0), accounts[3]);
            await vaultKeyInstance.safeTransferFrom(accounts[3], accounts[0], 0 /* ERC721 token id */, { from: accounts[3] });
            assert.equal(await vaultKeyInstance.ownerOf(0), accounts[0]);

        });

        it("stranger cannot transfer ownership of vault", async function() {
            await truffleAssert.reverts(vaultKeyInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[0] }));
            await truffleAssert.reverts(vaultKeyInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[2] }));
            await truffleAssert.reverts(vaultKeyInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[4] }));
        });

    });
        
    let vaultzero;

    describe("deposits", async function() {

        it("anyone can send ETH to a vault contract", async function() {
            vaultzero = await Vault.at((await vaultManagerInstance.vaults(0)).vaultContract);
            await vaultzero.send(100); // Send 100 wei to vault
            assert.equal(await web3.eth.getBalance(vaultzero.address), 100);
        });
    
        it("anyone can send ERC-20 tokens to a vault contract", async function() {
            await erc20MintableInstance.mint(accounts[0], 100); // Mint some ERC-20
            assert.equal(await erc20MintableInstance.balanceOf(accounts[0]), 100);
            await erc20MintableInstance.transfer(vaultzero.address, 10); // Send it to the vault
            assert.equal(await erc20MintableInstance.balanceOf(vaultzero.address), 10);
        });
    
        it("anyone can send ERC-721 tokens to a vault contract", async function() {
            await erc721MintableInstance.mint(accounts[0], 0); // Mint an ERC-721 with id 0
            await erc721MintableInstance.mint(accounts[0], 1); // Mint an ERC-721 with id 1
            assert.equal(await erc721MintableInstance.ownerOf(0), accounts[0]);
            await erc721MintableInstance.safeTransferFrom(accounts[0], vaultzero.address, 0); // Send token 0 to the vault
            await erc721MintableInstance.safeTransferFrom(accounts[0], vaultzero.address, 1); // Send token 1 to the vault
            assert.equal(await erc721MintableInstance.ownerOf(0), vaultzero.address);
        });

    });

    describe("withdrawals", async function() {

        it("stranger cannot transfer ETH from unowned vault contract", async function() {
            await truffleAssert.reverts(vaultzero.transferETH(accounts[5], 10, { from: accounts[5] })); // Send 10 wei from vault
        });

        it("stranger cannot transfer ERC-20 tokens from unowned vault contract", async function() {
            await truffleAssert.reverts(vaultzero.transferERC20(erc20MintableInstance.address, accounts[5], 1, { from: accounts[5] })); // Send 1 ERC-20 token from vault
        });

        it("stranger cannot transfer ERC-721 tokens from unowned vault contract", async function() {
            await truffleAssert.reverts(vaultzero.transferERC721(erc721MintableInstance.address, accounts[5], 0, { from: accounts[5] })); // Send 1 ERC-721 token from vault
        });

        it("owner can transfer ETH from owned vault contract", async function() {
            let balanceBefore = await web3.eth.getBalance(accounts[5]);
            let balanceBeforeBN = web3.utils.toBN(balanceBefore);
            await vaultzero.transferETH(accounts[5], 10, { from: accounts[0] }); // Send 10 wei from vault
            let balanceNew = await web3.eth.getBalance(accounts[5]);
            let balanceNewBN = web3.utils.toBN(balanceNew);
            assert.equal(balanceNewBN.sub(balanceBeforeBN), 10); // We should be 10 wei richer
        });

        it("owner can transfer ERC-20 tokens from owned vault contract", async function() {
            let balanceBefore = await erc20MintableInstance.balanceOf(accounts[5]);
            await vaultzero.transferERC20(erc20MintableInstance.address, accounts[5], 1, { from: accounts[0] }); // Send 1 ERC-20 token from acct 0 to acct 5
            let balanceNew = await erc20MintableInstance.balanceOf(accounts[5]);
            assert.equal(balanceNew - balanceBefore, 1); // We should be 1 ERC-20 richer
        });

        it("owner can transfer ERC-721 tokens from owned vault contract", async function() {
            let oldOwner = await erc721MintableInstance.ownerOf(0);
            assert.equal(oldOwner, vaultzero.address); // Old owner was the vault contract
            await vaultzero.transferERC721(erc721MintableInstance.address, accounts[5], 0, { from: accounts[0] }); // Send ERC-721 token with id 0 from acct 0 to acct 5
            let newOwner = await erc721MintableInstance.ownerOf(0);
            assert.equal(newOwner, accounts[5]); // Our account should now own the token
        });

    });

    describe("beneficiary", async function() {

        it("owner can withdraw beneficiary ticket and send it", async function() {
            assert.equal(await vaultBeneficiaryClaimTicketInstance.ownerOf(0), (await vaultManagerInstance.vaults(0)).vaultContract); // vault contains ticket
            await vaultzero.transferERC721(vaultBeneficiaryClaimTicketInstance.address, accounts[0], 0, { from: accounts[0] }); // account 0 withdraws ticket from vault
            assert.equal(await vaultBeneficiaryClaimTicketInstance.ownerOf(0), accounts[0]); // account 0 contains ticket
            await vaultBeneficiaryClaimTicketInstance.safeTransferFrom(accounts[0], accounts[5], 0); // account 0 sends ticket to account 5
            assert.equal(await vaultBeneficiaryClaimTicketInstance.ownerOf(0), accounts[5]); // account 5 contains ticket
        });

        it("stranger cannot claim ownership of vault", async function() {
            await truffleAssert.reverts(vaultManagerInstance.claimVaultKeyAsBeneficiary(1, { from: accounts[6] }));
        });

        it("beneficiary cannot yet claim ownership of vault", async function() {
            await truffleAssert.reverts(vaultManagerInstance.claimVaultKeyAsBeneficiary(1, { from: accounts[5] }));
        });

        it("owner can change check-in period of vault (to zero)", async function() {
            await vaultManagerInstance.setCheckInInterval(0, 0, { from: accounts[0] });
        });

        it("beneficiary can now claim ownership of vault", async function() {
            assert.equal(await vaultKeyInstance.ownerOf(0), accounts[0]);
            await vaultManagerInstance.claimVaultKeyAsBeneficiary(0, { from: accounts[5] });
            assert.equal(await vaultKeyInstance.ownerOf(0), accounts[5]);
        });

        it("after beneficiary claims ownership, the beneficiary ticket returns to the vault", async function() {
            assert.equal((await vaultBeneficiaryClaimTicketInstance.ownerOf(0)), vaultzero.address);
        });

        it("beneficiary (new owner) can now transfer ETH and tokens away from child contract", async function() {
            // Try to take
            await vaultzero.transferETH(accounts[5], 10, { from: accounts[5] }); // Send 10 wei from vault
            await vaultzero.transferERC20(erc20MintableInstance.address, accounts[5], 1, { from: accounts[5] }); // Send 1 ERC-20 token from vault
            await vaultzero.transferERC721(erc721MintableInstance.address, accounts[5], 1, { from: accounts[5] }); // Send ERC-721 token with id 1 from vault
        });

    });
    
});
