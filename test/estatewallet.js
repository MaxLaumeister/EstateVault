const LockBoxController = artifacts.require("LockBoxController");
const LockBoxChildContract = artifacts.require("LockBoxChildContract");
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

contract("LockBoxController", async function(accounts) {

    let lockBoxControllerInstance;
    let childContracts = [];

    /*describe("setup", async function() {
        it("deploy ", async function() {
            erc20MintableInstance = await ERC20Mintable.deployed()
        });
    });*/

    describe("deployment", async function() {

        it("is deployed", async function() {
            lockBoxControllerInstance = await LockBoxController.deployed();
        });

        it("can create " + NUM_CONTRACTS + " properly-owned lockboxes with sequential IDs", async function() {
            for (let i = 0; i < NUM_CONTRACTS; i++) {
                await lockBoxControllerInstance.newLockBox({ from: accounts[i] });
                // console.log("Child address: ", (await lockBoxControllerInstance.lockboxes(i)).childContractAddress);
                assert.equal(await lockBoxControllerInstance.ownerOf(i), accounts[i]);
            }
        });

        it("has " + NUM_CONTRACTS + " new child contracts that point back to it", async function() {
            for (let i = 0; i < NUM_CONTRACTS; i++) {
                let childaddress = (await lockBoxControllerInstance.lockboxes(i)).childContractAddress;
                let childcontract = await LockBoxChildContract.at(childaddress);
                childContracts.push(childcontract);
                // console.log((await childcontract._parentContract()), lockBoxControllerInstance.address);
                assert.equal((await childcontract._parentContract()), lockBoxControllerInstance.address);
            }
        });

        it("beneficiary starts as zero address", async function() {
            assert.equal((await lockBoxControllerInstance.lockboxes(0)).beneficiary, 0);
        });

    });

    describe("ownership", async function() {
    
        it("owner can transfer ownership of lockbox", async function() {
            await lockBoxControllerInstance.safeTransferFrom(accounts[0], accounts[3], 0 /* ERC721 token id */, { from: accounts[0] });
            assert.equal(await lockBoxControllerInstance.ownerOf(0), accounts[3]);
        });

        it("stranger cannot transfer ownership of lockbox", async function() {
            await truffleAssert.reverts(lockBoxControllerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[0] }));
            await truffleAssert.reverts(lockBoxControllerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[2] }));
            await truffleAssert.reverts(lockBoxControllerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[4] }));
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
            //await truffleAssert.reverts(lockBoxControllerInstance.transferETH(0, accounts[5], 10)); // Send 10 wei from lockbox
        });

        it("stranger cannot transfer ERC-20 tokens from unowned lockbox contract", async function() {
            
        });

        it("stranger cannot transfer ERC-721 tokens from unowned lockbox contract", async function() {
            
        });

        it("owner can transfer ETH from owned lockbox contract", async function() {
            let balanceBefore = await web3.eth.getBalance(accounts[5]);
            let balanceBeforeBN = web3.utils.toBN(balanceBefore);
            await lockBoxControllerInstance.transferETH(0, accounts[5], 10, { from: accounts[3] });
            let balanceNew = await web3.eth.getBalance(accounts[5]);
            let balanceNewBN = web3.utils.toBN(balanceNew);
            assert.equal(balanceNewBN.sub(balanceBeforeBN), 10);
        });

        it("owner can transfer ERC-20 tokens from owned lockbox contract", async function() {
            
        });

        it("owner can transfer ERC-721 tokens from owned lockbox contract", async function() {
            
        });

    });

    describe("beneficiary", async function() {

        it("owner can set beneficiary", async function() {
            await lockBoxControllerInstance.setBeneficiary(1, accounts[4], { from: accounts[1] });
            assert.equal((await lockBoxControllerInstance.lockboxes(1)).beneficiary, accounts[4]);
        });

        it("beneficiary cannot yet claim ownership of lockbox", async function() {
            await truffleAssert.reverts(lockBoxControllerInstance.claimOwnershipAsBeneficiary(1, accounts[1], accounts[4], { from: accounts[4] }));
        });

        //it("beneficiary cannot transfer ETH or tokens away from lockbox", async function() {
            
        //});

        it("owner can change check-in period of lockbox (to zero)", async function() {
            await lockBoxControllerInstance.setCheckInInterval(1, 0, { from: accounts[1] });
        });

        it("beneficiary can now claim ownership of lockbox", async function() {
            await lockBoxControllerInstance.claimOwnershipAsBeneficiary(1, accounts[1], accounts[4], { from: accounts[4] });
            assert.equal(await lockBoxControllerInstance.ownerOf(1), accounts[4]);
        });

        it("after beneficiary claims ownership, the beneficiary is unset to the zero address", async function() {
            assert.equal((await lockBoxControllerInstance.lockboxes(1)).beneficiary, 0);
        });

        //it("beneficiary (new owner) can now transfer ETH and tokens away from child contract", async function() {
            
        //});

    });
    
});
