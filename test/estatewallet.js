const LockBoxController = artifacts.require("LockBoxController");
const LockBoxChildContract = artifacts.require("LockBoxChildContract");

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
            // console.log("Child address: ", (await lockBoxControllerInstance.lockBoxes(i)).childContractAddress);
            assert(await lockBoxControllerInstance.ownerOf(i) == accounts[i]);
        }
    });

    it("has " + NUM_CONTRACTS + " new child contracts that point back to it", async function() {
        for (let i = 0; i < NUM_CONTRACTS; i++) {
            let childaddress = (await lockBoxControllerInstance.lockBoxes(i)).childContractAddress;
            let childcontract = await LockBoxChildContract.at(childaddress);
            // console.log((await childcontract._parentContract()), lockBoxControllerInstance.address);
            assert((await childcontract._parentContract()) == lockBoxControllerInstance.address);
        }
    });

    /*
    it("owner can transfer ownership of lockbox", async function() {
        
    });

    it("owner of different lockbox cannot transfer ownership of lockbox", async function() {
        
    });

    it("anyone can send an ERC-20 token and an ERC-721 token to any lockbox contract", async function() {
        
    });

    it("beneficiary cannot yet transfer ownership of lockbox", async function() {
        
    });

    it("owner can change check-in period of lockbox (to zero)", async function() {
        
    });

    it("beneficiary can now transfer ownership of lockbox", async function() {
        
    });
    */
});
