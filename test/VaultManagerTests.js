const VaultManager = artifacts.require("VaultManager");
const Vault = artifacts.require("Vault");
const ERC20Mintable = artifacts.require("ERC20Mintable");
const ERC721Mintable = artifacts.require("ERC721Mintable");
const truffleAssert = require('truffle-assertions');

const NUM_CONTRACTS = 3; // Do not edit - address 4 and greater are used for additional tests

let erc20MintableInstance;
let erc721MintableInstance;

contract("ERC20Mintable", async function(accounts) {
    it("is deployed", async function() {
        erc20MintableInstance = await ERC20Mintable.deployed()
    });
});

contract("ERC721Mintable", async function(accounts) {
    it("is deployed", async function() {
        erc721MintableInstance = await ERC721Mintable.deployed()
    });
});

contract("VaultManager", async function(accounts) {

    let vaultManagerInstance;
    let childContracts = [];

    /*describe("setup", async function() {
        it("deploy ", async function() {
            erc20MintableInstance = await ERC20Mintable.deployed()
        });
    });*/

    describe("deployment", async function() {

        it("is deployed", async function() {
            vaultManagerInstance = await VaultManager.deployed();
        });

        it("can create " + NUM_CONTRACTS + " properly-owned vaults with sequential IDs", async function() {
            for (let i = 0; i < NUM_CONTRACTS; i++) {
                await vaultManagerInstance.newVault({ from: accounts[i] });
                // console.log("Child address: ", (await vaultManagerInstance.vaults(i)).childContractAddress);
                assert.equal(await vaultManagerInstance.ownerOf(i), accounts[i]);
            }
        });

        it("has " + NUM_CONTRACTS + " new child contracts that point back to it", async function() {
            for (let i = 0; i < NUM_CONTRACTS; i++) {
                let childaddress = (await vaultManagerInstance.vaults(i)).childContractAddress;
                let childcontract = await Vault.at(childaddress);
                childContracts.push(childcontract);
                // console.log((await childcontract._parentContract()), vaultManagerInstance.address);
                assert.equal((await childcontract._parentContract()), vaultManagerInstance.address);
            }
        });

        it("beneficiary starts as zero address", async function() {
            assert.equal((await vaultManagerInstance.vaults(0)).beneficiary, 0);
        });

    });

    describe("ownership", async function() {
    
        it("owner can transfer ownership of lockbox", async function() {
            await vaultManagerInstance.safeTransferFrom(accounts[0], accounts[3], 0 /* ERC721 token id */, { from: accounts[0] });
            assert.equal(await vaultManagerInstance.ownerOf(0), accounts[3]);
        });

        it("stranger cannot transfer ownership of lockbox", async function() {
            await truffleAssert.reverts(vaultManagerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[0] }));
            await truffleAssert.reverts(vaultManagerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[2] }));
            await truffleAssert.reverts(vaultManagerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[4] }));
        });

    });

    describe("deposits", async function() {

        it("anyone can send ETH to a lockbox contract", async function() {
            await childContracts[0].send(10); // Send 10 wei to lockbox
            assert.equal(await web3.eth.getBalance(childContracts[0].address), 10);
        });
    
        it("anyone can send ERC-20 tokens to a lockbox contract", async function() {
            await erc20MintableInstance.mint(accounts[0], 100); // Mint some ERC-20
            assert.equal(await erc20MintableInstance.balanceOf(accounts[0]), 100);
            await erc20MintableInstance.transfer(childContracts[0].address, 10); // Send it to the lockbox
            assert.equal(await erc20MintableInstance.balanceOf(childContracts[0].address), 10);
        });
    
        it("anyone can send ERC-721 tokens to a lockbox contract", async function() {
            await erc721MintableInstance.mint(accounts[0], 0); // Mint an ERC-721 with id 0
            assert.equal(await erc721MintableInstance.ownerOf(0), accounts[0]);
            await erc721MintableInstance.safeTransferFrom(accounts[0], childContracts[0].address, 0); // Send it to the lockbox
            assert.equal(await erc721MintableInstance.ownerOf(0), childContracts[0].address);
        });

    });

    describe("withdrawals", async function() {

        it("stranger cannot transfer ETH from unowned lockbox contract", async function() {
            await truffleAssert.reverts(vaultManagerInstance.transferETH(0, accounts[5], 10)); // Send 10 wei from lockbox
        });

        it("stranger cannot transfer ERC-20 tokens from unowned lockbox contract", async function() {
            await truffleAssert.reverts(vaultManagerInstance.transferERC20(0, erc20MintableInstance.address, accounts[5], 1)); // Send 1 ERC-20 token from lockbox
        });

        it("stranger cannot transfer ERC-721 tokens from unowned lockbox contract", async function() {
            await truffleAssert.reverts(vaultManagerInstance.transferERC721(0, erc721MintableInstance.address, accounts[5], 0)); // Send 1 ERC-721 token from lockbox
        });

        it("owner can transfer ETH from owned lockbox contract", async function() {
            let balanceBefore = await web3.eth.getBalance(accounts[5]);
            let balanceBeforeBN = web3.utils.toBN(balanceBefore);
            await vaultManagerInstance.transferETH(0, accounts[5], 10, { from: accounts[3] }); // Send 10 wei from lockbox
            let balanceNew = await web3.eth.getBalance(accounts[5]);
            let balanceNewBN = web3.utils.toBN(balanceNew);
            assert.equal(balanceNewBN.sub(balanceBeforeBN), 10); // We should be 10 wei richer
        });

        it("owner can transfer ERC-20 tokens from owned lockbox contract", async function() {
            let balanceBefore = await erc20MintableInstance.balanceOf(accounts[5]);
            await vaultManagerInstance.transferERC20(0, erc20MintableInstance.address, accounts[5], 1, { from: accounts[3] }); // Send 1 ERC-20 token from acct 3 to acct 5
            let balanceNew = await erc20MintableInstance.balanceOf(accounts[5]);
            assert.equal(balanceNew - balanceBefore, 1); // We should be 1 ERC-20 richer
        });

        it("owner can transfer ERC-721 tokens from owned lockbox contract", async function() {
            let oldOwner = await erc721MintableInstance.ownerOf(0);
            assert.equal(oldOwner, childContracts[0].address); // Old owner was the child contract
            await vaultManagerInstance.transferERC721(0, erc721MintableInstance.address, accounts[5], 0, { from: accounts[3] }); // Send 1 ERC-721 token from acct 3 to acct 5
            let newOwner = await erc721MintableInstance.ownerOf(0);
            assert.equal(newOwner, accounts[5]); // Our account should now own the token
        });

    });

    describe("beneficiary", async function() {

        it("owner can set beneficiary", async function() {
            await vaultManagerInstance.setBeneficiary(1, accounts[4], { from: accounts[1] });
            assert.equal((await vaultManagerInstance.vaults(1)).beneficiary, accounts[4]);
        });

        it("beneficiary cannot yet claim ownership of lockbox", async function() {
            await truffleAssert.reverts(vaultManagerInstance.claimOwnershipAsBeneficiary(1, accounts[1], accounts[4], { from: accounts[4] }));
        });

        it("beneficiary cannot transfer ETH or tokens away from lockbox", async function() {
            // Load up lockbox
            await childContracts[1].send(10); // Send 10 wei to lockbox
            await erc20MintableInstance.mint(accounts[0], 100); // Mint some ERC-20
            await erc20MintableInstance.transfer(childContracts[1].address, 10); // Send some ERC-20 to the lockbox
            await erc721MintableInstance.mint(accounts[0], 1); // Mint an ERC-721 with id 1
            await erc721MintableInstance.safeTransferFrom(accounts[0], childContracts[1].address, 1); // Send it to the lockbox
            // Try to take
            await truffleAssert.reverts(vaultManagerInstance.transferETH(1, accounts[5], 10, { from: accounts[4] })); // Send 10 wei from lockbox
            await truffleAssert.reverts(vaultManagerInstance.transferERC20(1, erc20MintableInstance.address, accounts[5], 1, { from: accounts[4] })); // Send 1 ERC-20 token from lockbox
            await truffleAssert.reverts(vaultManagerInstance.transferERC721(1, erc721MintableInstance.address, accounts[5], 1, { from: accounts[4] })); // Send 1 ERC-721 token from lockbox
        });

        it("owner can change check-in period of lockbox (to zero)", async function() {
            await vaultManagerInstance.setCheckInInterval(1, 0, { from: accounts[1] });
        });

        it("beneficiary can now claim ownership of lockbox", async function() {
            await vaultManagerInstance.claimOwnershipAsBeneficiary(1, accounts[1], accounts[4], { from: accounts[4] });
            assert.equal(await vaultManagerInstance.ownerOf(1), accounts[4]);
        });

        it("after beneficiary claims ownership, the beneficiary is unset to the zero address", async function() {
            assert.equal((await vaultManagerInstance.vaults(1)).beneficiary, 0);
        });

        it("beneficiary (new owner) can now transfer ETH and tokens away from child contract", async function() {
            // Try to take
            await vaultManagerInstance.transferETH(1, accounts[5], 10, { from: accounts[4] }); // Send 10 wei from lockbox
            await vaultManagerInstance.transferERC20(1, erc20MintableInstance.address, accounts[5], 1, { from: accounts[4] }); // Send 1 ERC-20 token from lockbox
            await vaultManagerInstance.transferERC721(1, erc721MintableInstance.address, accounts[5], 1, { from: accounts[4] }); // Send 1 ERC-721 token from lockbox
        });

    });
    
});
