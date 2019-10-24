const LockBoxController = artifacts.require("LockBoxController");
const LockBoxWallet = artifacts.require("LockBoxWallet");

contract("LockBoxController", async function(accounts) {

    let lockBoxControllerInstance;

    it("can be deployed", async function() {
        lockBoxControllerInstance = await LockBoxController.deployed();
    });

    it("can create lockboxes sequentially", async function() {
        let lockBox0Id = await lockBoxControllerInstance.newLockBox();
        assert(lockBox0Id == 0);
        let lockBox1Id = await lockBoxControllerInstance.newLockBox();
        assert(lockBox1Id == 1);
      });

});

contract("LockBoxWallet", async function(accounts) {
});
