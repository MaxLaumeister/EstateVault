const LockBoxController = artifacts.require("LockBoxController");
const ERC20Mintable = artifacts.require("ERC20Mintable");

module.exports = function(deployer) {
  deployer.deploy(LockBoxController);
  deployer.deploy(ERC20Mintable);
};
