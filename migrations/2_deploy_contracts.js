const EstateWallet = artifacts.require("EstateWallet");
const ERC20Mintable = artifacts.require("ERC20Mintable");

module.exports = function(deployer) {
  deployer.deploy(EstateWallet);
  deployer.deploy(ERC20Mintable);
};
