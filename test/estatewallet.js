const EstateWallet = artifacts.require("EstateWallet");
const ERC20Mintable = artifacts.require("ERC20Mintable");
const truffleAssert = require('truffle-assertions');

contract("EstateWallet", async function(accounts) {
  let erc20instance;
  let estateWalletInstance;

  it("constructor should set owner to the calling address", async function() {
    estateWalletInstance = await EstateWallet.deployed()
    let owner = await estateWalletInstance.owner();
    assert(owner === accounts[0]);
  });

  it("constructor should leave the beneficiary as the null address", async function() {
    let beneficiary = await estateWalletInstance._beneficiary();
    assert(beneficiary === '0x0000000000000000000000000000000000000000');
  });

  it("constructor should set the check-in interval to 365 days", async function() {
    let interval = await estateWalletInstance._checkInInterval();
    assert(interval.toNumber() === 31536000); // seconds in 365 days
  });

  it("owner should be able to set, then retrieve the beneficiary", async function() {
    // Set the beneficiary
    await estateWalletInstance.setBeneficiary(accounts[1]);

    // Check to make sure the beneficiary has been set
    let beneficiary = await estateWalletInstance._beneficiary();
    assert(beneficiary === accounts[1]);
  });

  it("owner should be able to withdraw at any time", async function() {
    // Mint tokens to contract address
    erc20instance = await ERC20Mintable.deployed();
    await erc20instance.mint(estateWalletInstance.address, 1000);

    // Check erc20 balance of contract
    let balance = await erc20instance.balanceOf(estateWalletInstance.address);
    assert(balance.toNumber() === 1000);

    // Try to withdraw as owner
    await estateWalletInstance.transferERC20(erc20instance.address, accounts[0], 100);

    // Make sure we've received the coins
    let ownerBalance = await erc20instance.balanceOf(accounts[0]);
    assert(ownerBalance.toNumber() === 100);
  });

  it("beneficiary should NOT be able to withdraw, as it is before releaseTime", async function() {
    // Try to withdraw as beneficiary (it should fail and revert)
    await truffleAssert.reverts(estateWalletInstance.transferERC20(erc20instance.address, accounts[1], 1000, { from: accounts[1] }));
  });

  it("owner should be able to set new checkInInterval (to zero)", async function() {
    // As owner, et the checkInInterval to 0, causing the contract to be immediately accessible by the beneficiary
    await estateWalletInstance.setCheckInInterval(0);

    // Verify checkInterval is indeed 0
    let checkInInterval = await estateWalletInstance._checkInInterval();
    assert(checkInInterval.toNumber() === 0);
  });

  it("beneficiary should be able to withdraw, since by setting checkInInterval to zero, releaseTime is now", async function() {
    // Try to withdraw as beneficiary (it should succeed)
    await estateWalletInstance.transferERC20(erc20instance.address, accounts[1], 100, { from: accounts[1] });

    // Check beneficiary's erc20 balance to make sure we received the tokens
    let beneficiaryBalance = await erc20instance.balanceOf(accounts[1]);
    assert(beneficiaryBalance.toNumber() === 100);
  });

});
