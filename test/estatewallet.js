const LockBoxController = artifacts.require("LockBoxController");
const LockBoxChildContract = artifacts.require("LockBoxChildContract");
const truffleAssert = require('truffle-assertions');

const NUM_CONTRACTS = 3; // Do not edit - address 4 and greater are used for additional tests

function areEqual(){
    var len = arguments.length;
    for (var i = 1; i< len; i++){
       if (arguments[i] === null || arguments[i] !== arguments[i-1])
          return false;
    }
    return true;
}

contract("LockBoxController", async function(accounts) {

    let lockBoxControllerInstance;
    let lockBoxChildContract0;
    let lockBoxChildContract1;

    it("can be deployed", async function() {
        lockBoxControllerInstance = await LockBoxController.deployed();
    });

    it("can create " + NUM_CONTRACTS + " properly-owned lockboxes with sequential IDs", async function() {
        for (let i = 0; i < NUM_CONTRACTS; i++) {
            await lockBoxControllerInstance.newLockBox({ from: accounts[i] });
            // console.log("Child address: ", (await lockBoxControllerInstance.lockboxes(i)).childContractAddress);
            assert(await lockBoxControllerInstance.ownerOf(i) == accounts[i]);
        }
    });

    it("has " + NUM_CONTRACTS + " new child contracts that point back to it", async function() {
        for (let i = 0; i < NUM_CONTRACTS; i++) {
            let childaddress = (await lockBoxControllerInstance.lockboxes(i)).childContractAddress;
            let childcontract = await LockBoxChildContract.at(childaddress);
            // console.log((await childcontract._parentContract()), lockBoxControllerInstance.address);
            assert((await childcontract._parentContract()) == lockBoxControllerInstance.address);
        }
    });

    it("beneficiary starts as zero address", async function() {
        assert((await lockBoxControllerInstance.lockboxes(0)).beneficiary == 0);
    });

    
    it("owner can transfer ownership of lockbox", async function() {
        await lockBoxControllerInstance.safeTransferFrom(accounts[0], accounts[3], 0 /* ERC721 token id */, { from: accounts[0] });
        assert(await lockBoxControllerInstance.ownerOf(0) == accounts[3]);
    });

    it("stranger cannot transfer ownership of lockbox", async function() {
        await truffleAssert.reverts(lockBoxControllerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[0] }));
        await truffleAssert.reverts(lockBoxControllerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[2] }));
        await truffleAssert.reverts(lockBoxControllerInstance.safeTransferFrom(accounts[3], accounts[4], 0 /* ERC721 token id */, { from: accounts[4] }));
    });

    //it("anyone can send ETH to any lockbox contract", async function() {
        
    //});

    //it("anyone can send ERC-20 tokens to any lockbox contract", async function() {
        
    //});

    //it("anyone can send ERC-721 tokens to any lockbox contract", async function() {
        
    //});

    //it("owner can transfer ", async function() {
        
    //});

    it("owner can set beneficiary", async function() {
        await lockBoxControllerInstance.setBeneficiary(1, accounts[4], { from: accounts[1] });
        assert((await lockBoxControllerInstance.lockboxes(1)).beneficiary == accounts[4]);
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
        assert(await lockBoxControllerInstance.ownerOf(1) == accounts[4]);
    });

    it("after beneficiary claims ownership, the beneficiary is unset to the zero address", async function() {
        assert((await lockBoxControllerInstance.lockboxes(1)).beneficiary == 0);
    });

    //it("beneficiary (new owner) can now transfer ETH and tokens away from child contract", async function() {
        
    //});
    
});
